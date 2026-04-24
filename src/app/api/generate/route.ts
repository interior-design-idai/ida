import { NextRequest } from "next/server";
import { replicate, MODELS, CREDIT_COSTS } from "@/lib/replicate";
import { getServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, functionType, prompt, imageUrl, style, roomType } = body;

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

  // Build prompt
  const fullPrompt = buildPrompt(functionType, prompt, style, roomType);

  try {
    let output: unknown;

    switch (functionType) {
      case "sketch2render":
        output = await replicate.run(MODELS.sketch2render, {
          input: {
            image: imageUrl,
            prompt: fullPrompt,
            num_samples: "1",
            image_resolution: "768",
            ddim_steps: 30,
            scale: 9,
            a_prompt: "best quality, extremely detailed, photorealistic, 8k, interior design",
            n_prompt: "longbody, lowres, bad anatomy, bad hands, missing fingers, blurry, cartoon, painting",
          },
        });
        break;

      case "text2img":
        output = await replicate.run(MODELS.text2img, {
          input: {
            prompt: fullPrompt,
            num_outputs: 1,
            aspect_ratio: "16:9",
            output_format: "webp",
            output_quality: 90,
          },
        });
        break;

      case "realistic_render":
      case "photo_remodel":
      case "style_transfer":
        output = await replicate.run(MODELS.img2img, {
          input: {
            image: imageUrl,
            prompt: fullPrompt,
            negative_prompt: "lowres, bad quality, blurry, cartoon, painting, sketch",
            num_inference_steps: 40,
            guidance_scale: 7.5,
            prompt_strength: functionType === "style_transfer" ? 0.7 : 0.5,
          },
        });
        break;

      case "upscale":
        output = await replicate.run(MODELS.upscale, {
          input: {
            image: imageUrl,
            scale: 4,
            face_enhance: false,
          },
        });
        break;

      default:
        return Response.json({ error: "Unknown function type" }, { status: 400 });
    }

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

    // Get output URL
    const outputUrl = Array.isArray(output) ? output[0] : output;

    // Save generation record
    await supabase.from("generations").insert({
      user_id: userId,
      function_type: functionType,
      prompt: fullPrompt,
      input_image_url: imageUrl || null,
      output_image_url: typeof outputUrl === "string" ? outputUrl : null,
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

function buildPrompt(functionType: string, prompt?: string, style?: string, roomType?: string): string {
  const parts: string[] = [];

  if (roomType) parts.push(roomType);
  if (style) parts.push(`${style} style`);
  if (prompt) parts.push(prompt);

  const base = parts.join(", ") || "modern interior design";

  const suffixes: Record<string, string> = {
    sketch2render: ", photorealistic render, 8k, detailed interior, professional photography",
    realistic_render: ", photorealistic, 8k, ultra detailed, natural lighting, professional interior photography",
    photo_remodel: ", interior design renovation, photorealistic, professional, detailed",
    style_transfer: ", interior design, high quality, detailed, cohesive style",
    text2img: ", interior design concept, photorealistic visualization, 8k, detailed",
  };

  return base + (suffixes[functionType] || "");
}
