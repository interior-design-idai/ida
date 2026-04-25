import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY! });

// Upload data URI to fal.ai CDN and return a public URL
async function uploadImage(dataUri: string): Promise<string> {
  if (!dataUri.startsWith("data:")) return dataUri;

  const base64 = dataUri.split(",")[1];
  const mimeType = dataUri.split(";")[0].split(":")[1] || "image/jpeg";
  const buffer = Buffer.from(base64, "base64");
  const blob = new Blob([buffer], { type: mimeType });
  const file = new File([blob], "upload.jpg", { type: mimeType });

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

// Sketch to Render — two-stage pipeline for high quality output
// Stage 1: Flux General + InstantX ControlNet Canny (structure from sketch)
// Stage 2: Clarity Upscaler (refine materials, textures, lighting details)
export async function sketchToRender(params: {
  imageUrl: string;
  prompt: string;
  style?: string;
  referenceImageUrl?: string;
}): Promise<GenerateResult> {
  const uploadedUrl = await uploadImage(params.imageUrl);
  const fullPrompt = `${params.prompt}${params.style ? `, ${params.style} style` : ""}, photorealistic interior design rendering, realistic materials and textures, marble, wood, concrete, volumetric lighting, global illumination, 8k resolution, professional architectural visualization, V-Ray quality, ultra detailed, sharp focus`;

  // Stage 1: ControlNet generation — conditioning_scale 0.45 for photorealistic freedom
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const input: Record<string, any> = {
    prompt: fullPrompt,
    image_size: "landscape_16_9",
    num_inference_steps: 30,
    guidance_scale: 3.5,
    num_images: 1,
    controlnets: [
      {
        path: "InstantX/FLUX.1-dev-Controlnet-Canny",
        control_image_url: uploadedUrl,
        conditioning_scale: 0.45,
      },
    ],
  };

  if (params.referenceImageUrl) {
    const refUrl = await uploadImage(params.referenceImageUrl);
    input.ip_adapters = [
      {
        path: "XLabs-AI/flux-ip-adapter",
        image_url: refUrl,
        scale: 0.6,
      },
    ];
  }

  const stage1 = (await fal.subscribe("fal-ai/flux-general" as any, {
    input,
  })) as FalImageOutput;

  const rawUrl = stage1.data.images[0].url;

  // Stage 2: Clarity Upscaler — refine materials and add photorealistic detail
  const stage2 = (await fal.subscribe("fal-ai/clarity-upscaler" as any, {
    input: {
      image_url: rawUrl,
      scale: 2,
      prompt: "photorealistic interior design, marble texture, wood grain, LED lighting, polished surfaces, high quality, ultra detailed, sharp focus",
      creativity: 0.35,
      resemblance: 0.85,
    },
  })) as FalUpscaleOutput;

  return {
    imageUrl: stage2.data.image.url,
    seed: stage1.data.seed,
  };
}

// Text to Image — with optional reference image via IP-Adapter
export async function textToImage(params: {
  prompt: string;
  style?: string;
  roomType?: string;
  quality?: "fast" | "quality";
  referenceImageUrl?: string;
}): Promise<GenerateResult> {
  const parts = [];
  if (params.roomType) parts.push(params.roomType);
  parts.push(params.prompt);
  if (params.style) parts.push(`${params.style} style`);
  parts.push("photorealistic interior design, 8k, ultra detailed, professional architectural photography");

  if (params.referenceImageUrl) {
    const refUrl = await uploadImage(params.referenceImageUrl);
    const result = (await fal.subscribe("fal-ai/flux-general" as any, {
      input: {
        prompt: parts.join(", "),
        image_size: "landscape_16_9",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        ip_adapters: [
          {
            path: "XLabs-AI/flux-ip-adapter",
            image_url: refUrl,
            scale: 0.7,
          },
        ],
      },
    })) as FalImageOutput;

    return {
      imageUrl: result.data.images[0].url,
      seed: result.data.seed,
    };
  }

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

// Image to Image — photo remodel / realistic render + optional reference
export async function imageToImage(params: {
  imageUrl: string;
  prompt: string;
  style?: string;
  strength?: number;
  referenceImageUrl?: string;
}): Promise<GenerateResult> {
  const uploadedUrl = await uploadImage(params.imageUrl);
  const fullPrompt = `${params.prompt}${params.style ? `, ${params.style} style` : ""}, photorealistic interior design, professional photography`;

  if (params.referenceImageUrl) {
    const refUrl = await uploadImage(params.referenceImageUrl);
    const result = (await fal.subscribe("fal-ai/flux-general/image-to-image" as any, {
      input: {
        image_url: uploadedUrl,
        prompt: fullPrompt,
        strength: params.strength ?? 0.7,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        ip_adapters: [
          {
            path: "XLabs-AI/flux-ip-adapter",
            image_url: refUrl,
            scale: 0.7,
          },
        ],
      },
    })) as FalImageOutput;

    return {
      imageUrl: result.data.images[0].url,
      seed: result.data.seed,
    };
  }

  const result = (await fal.subscribe("fal-ai/flux/dev/image-to-image" as any, {
    input: {
      image_url: uploadedUrl,
      prompt: fullPrompt,
      strength: params.strength ?? 0.7,
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
