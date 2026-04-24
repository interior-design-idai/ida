import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY! });

// Upload data URI to fal.ai CDN and return a public URL
async function uploadImage(dataUri: string): Promise<string> {
  // If it's already a regular URL (not data URI), return as-is
  if (!dataUri.startsWith("data:")) return dataUri;

  // Convert data URI to Blob
  const base64 = dataUri.split(",")[1];
  const mimeType = dataUri.split(";")[0].split(":")[1] || "image/jpeg";
  const buffer = Buffer.from(base64, "base64");
  const blob = new Blob([buffer], { type: mimeType });
  const file = new File([blob], "upload.jpg", { type: mimeType });

  // Upload to fal.ai CDN
  const url = await fal.storage.upload(file);
  return url;
}

export interface GenerateResult {
  imageUrl: string;
  seed?: number;
}

interface FalImageOutput {
  data: { images: Array<{ url: string }>; seed?: number };
}

interface FalUpscaleOutput {
  data: { image: { url: string } };
}

// Sketch to Render — uses Flux image-to-image with high strength
export async function sketchToRender(params: {
  imageUrl: string;
  prompt: string;
  style?: string;
}): Promise<GenerateResult> {
  const uploadedUrl = await uploadImage(params.imageUrl);
  const fullPrompt = `${params.prompt}${params.style ? `, ${params.style} style` : ""}, photorealistic interior design, 8k, professional photography, natural lighting`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (await fal.subscribe("fal-ai/flux/dev/image-to-image" as any, {
    input: {
      image_url: uploadedUrl,
      prompt: fullPrompt,
      strength: 0.85,
      num_inference_steps: 28,
      guidance_scale: 3.5,
    },
  })) as FalImageOutput;

  return {
    imageUrl: result.data.images[0].url,
    seed: result.data.seed,
  };
}

// Text to Image — uses Flux Schnell (fast) or Flux Dev (quality)
export async function textToImage(params: {
  prompt: string;
  style?: string;
  roomType?: string;
  quality?: "fast" | "quality";
}): Promise<GenerateResult> {
  const parts = [];
  if (params.roomType) parts.push(params.roomType);
  parts.push(params.prompt);
  if (params.style) parts.push(`${params.style} style`);
  parts.push("photorealistic interior design, 8k, ultra detailed, professional architectural photography, natural lighting");

  const model = params.quality === "fast"
    ? "fal-ai/flux/schnell"
    : "fal-ai/flux/dev";

  const result = (await fal.subscribe(model as any, {
    input: {
      prompt: parts.join(", "),
      image_size: "landscape_16_9",
      num_inference_steps: params.quality === "fast" ? 4 : 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: false,
    },
  })) as FalImageOutput;

  return {
    imageUrl: result.data.images[0].url,
    seed: result.data.seed,
  };
}

// Image to Image — photo remodel / realistic render
export async function imageToImage(params: {
  imageUrl: string;
  prompt: string;
  style?: string;
  strength?: number;
}): Promise<GenerateResult> {
  const uploadedUrl = await uploadImage(params.imageUrl);
  const fullPrompt = `${params.prompt}${params.style ? `, ${params.style} style` : ""}, photorealistic interior design, professional photography`;

  const result = (await fal.subscribe("fal-ai/flux/dev/image-to-image" as any, {
    input: {
      image_url: uploadedUrl,
      prompt: fullPrompt,
      strength: params.strength ?? 0.6,
      num_inference_steps: 28,
      guidance_scale: 3.5,
    },
  })) as FalImageOutput;

  return {
    imageUrl: result.data.images[0].url,
    seed: result.data.seed,
  };
}

// 4K Upscale
export async function upscaleImage(params: {
  imageUrl: string;
  scale?: number;
}): Promise<GenerateResult> {
  const uploadedUrl = await uploadImage(params.imageUrl);
  const result = (await fal.subscribe("fal-ai/clarity-upscaler" as any, {
    input: {
      image_url: uploadedUrl,
      scale: params.scale ?? 4,
      prompt: "photorealistic interior design, high quality, detailed",
      creativity: 0.2,
      resemblance: 0.9,
    },
  })) as FalUpscaleOutput;

  return {
    imageUrl: result.data.image.url,
  };
}
