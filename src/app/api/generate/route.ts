import { NextRequest } from "next/server";
import {
  runWorkflow,
  buildSketch2RenderWorkflow,
  buildText2ImgWorkflow,
  buildImg2ImgWorkflow,
  buildUpscaleWorkflow,
  buildStyleTransferWorkflow,
} from "@/lib/comfyui";
import { getServiceClient } from "@/lib/supabase";
import { translatePrompt } from "@/lib/translate";

const CREDIT_COSTS: Record<string, number> = {
  sketch2render: 2,
  realistic_render: 2,
  photo_remodel: 3,
  style_transfer: 2,
  upscale: 1,
  text2img: 1,
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, functionType, imageBase64, roomType } = body;

  // Auto-translate Chinese prompts to English
  const prompt = body.prompt ? await translatePrompt(body.prompt) : body.prompt;
  const style = body.style ? await translatePrompt(body.style) : body.style;

  if (!userId || !functionType) {
    return Response.json({ error: "userId and functionType required" }, { status: 400 });
  }

  const creditCost = CREDIT_COSTS[functionType] ?? 2;

  // Check credits
  const supabase = getServiceClient();
  const { data: user } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (!user || user.credits < creditCost) {
    return Response.json({ error: "Insufficient credits", required: creditCost }, { status: 402 });
  }

  try {
    let workflow: Record<string, unknown>;

    switch (functionType) {
      case "sketch2render":
        workflow = buildSketch2RenderWorkflow({
          imageBase64,
          prompt: prompt || "interior design",
          style,
        });
        break;

      case "text2img":
        workflow = buildText2ImgWorkflow({
          prompt: prompt || "modern interior design",
          style,
          roomType,
        });
        break;

      case "realistic_render":
        workflow = buildImg2ImgWorkflow({
          imageBase64,
          prompt: prompt || "photorealistic interior",
          style,
          denoise: 0.5,
        });
        break;

      case "photo_remodel":
        workflow = buildImg2ImgWorkflow({
          imageBase64,
          prompt: prompt || "interior renovation",
          style,
          denoise: 0.6,
        });
        break;

      case "style_transfer":
        workflow = buildStyleTransferWorkflow({
          imageBase64,
          style: style || "Modern Minimalist",
        });
        break;

      case "upscale":
        workflow = buildUpscaleWorkflow({ imageBase64 });
        break;

      default:
        return Response.json({ error: "Unknown function type" }, { status: 400 });
    }

    // Run on ComfyUI via RunPod
    const images = await runWorkflow(workflow);
    const outputUrl = images[0] || null;

    // Deduct credits
    await supabase
      .from("users")
      .update({ credits: user.credits - creditCost })
      .eq("id", userId);

    // Record transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "consume",
      amount: creditCost,
      description: `${functionType}: ${prompt?.slice(0, 100) || "generation"}`,
    });

    // Save generation record
    await supabase.from("generations").insert({
      user_id: userId,
      function_type: functionType,
      prompt: prompt || "",
      input_image_url: null,
      output_image_url: outputUrl,
      credits_used: creditCost,
      is_public: false,
    });

    return Response.json({
      success: true,
      outputUrl,
      creditsUsed: creditCost,
      creditsRemaining: user.credits - creditCost,
    });
  } catch (err) {
    console.error("Generation error:", err);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
