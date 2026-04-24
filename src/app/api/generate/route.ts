import { NextRequest } from "next/server";
import { textToImage, sketchToRender, imageToImage, upscaleImage } from "@/lib/fal-engine";
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
  const { userId, functionType, imageUrl, imageBase64, roomType, referenceImageUrl } = body;

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
    // Use the uploaded image URL (data URI from client)
    const imgUrl = imageUrl || (imageBase64 ? `data:image/png;base64,${imageBase64}` : undefined);

    let result;

    switch (functionType) {
      case "text2img":
        result = await textToImage({ prompt, style, roomType, quality: "quality", referenceImageUrl });
        break;
      case "sketch2render":
        result = await sketchToRender({ imageUrl: imgUrl!, prompt, style, referenceImageUrl });
        break;
      case "realistic_render":
        result = await imageToImage({ imageUrl: imgUrl!, prompt, style, strength: 0.5, referenceImageUrl });
        break;
      case "photo_remodel":
        result = await imageToImage({ imageUrl: imgUrl!, prompt, style, strength: 0.65, referenceImageUrl });
        break;
      case "style_transfer":
        result = await imageToImage({ imageUrl: imgUrl!, prompt: style || "modern minimalist", strength: 0.6, referenceImageUrl });
        break;
      case "upscale":
        result = await upscaleImage({ imageUrl: imgUrl! });
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

    // Save generation record
    await supabase.from("generations").insert({
      user_id: userId,
      function_type: functionType,
      prompt: prompt || "",
      input_image_url: null,
      output_image_url: result.imageUrl,
      credits_used: creditCost,
      is_public: false,
    });

    return Response.json({
      success: true,
      outputUrl: result.imageUrl,
      creditsUsed: creditCost,
      creditsRemaining: user.credits - creditCost,
      seed: result.seed,
      engine: "fal.ai",
    });
  } catch (err) {
    console.error("Generation error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
