// Test endpoint — uses fal.ai for immediate testing
// Remove this after RunPod ComfyUI is production-ready

import { NextRequest } from "next/server";
import { textToImage, sketchToRender, imageToImage, upscaleImage } from "@/lib/fal-engine";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { functionType, prompt, imageUrl, style, roomType } = body;

  try {
    let result;

    switch (functionType) {
      case "text2img":
        result = await textToImage({ prompt, style, roomType, quality: "quality" });
        break;
      case "sketch2render":
        result = await sketchToRender({ imageUrl, prompt, style });
        break;
      case "realistic_render":
        result = await imageToImage({ imageUrl, prompt, style, strength: 0.5 });
        break;
      case "photo_remodel":
        result = await imageToImage({ imageUrl, prompt, style, strength: 0.65 });
        break;
      case "style_transfer":
        result = await imageToImage({ imageUrl, prompt: style || "modern minimalist", strength: 0.6 });
        break;
      case "upscale":
        result = await upscaleImage({ imageUrl });
        break;
      default:
        return Response.json({ error: "Unknown function type" }, { status: 400 });
    }

    return Response.json({
      success: true,
      outputUrl: result.imageUrl,
      seed: result.seed,
      engine: "fal.ai",
    });
  } catch (err) {
    console.error("Test generation error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
