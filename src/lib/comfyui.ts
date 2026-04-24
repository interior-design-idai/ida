// ComfyUI via RunPod Serverless API

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY!;
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID!;

const RUNPOD_BASE = `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}`;

interface RunPodResponse {
  id: string;
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  output?: {
    images: string[]; // base64 or URLs
    status: string;
  };
  error?: string;
}

// Submit a job to ComfyUI on RunPod
async function submitJob(workflow: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${RUNPOD_BASE}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RUNPOD_API_KEY}`,
    },
    body: JSON.stringify({ input: { workflow } }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`RunPod submit failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.id;
}

// Poll for job completion
async function pollJob(jobId: string, maxWait = 120000): Promise<RunPodResponse> {
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    const res = await fetch(`${RUNPOD_BASE}/status/${jobId}`, {
      headers: { Authorization: `Bearer ${RUNPOD_API_KEY}` },
    });

    const data: RunPodResponse = await res.json();

    if (data.status === "COMPLETED") return data;
    if (data.status === "FAILED") throw new Error(data.error || "Job failed");

    await new Promise((r) => setTimeout(r, 2000));
  }

  throw new Error("Job timed out");
}

// Run a ComfyUI workflow and wait for result
export async function runWorkflow(workflow: Record<string, unknown>): Promise<string[]> {
  const jobId = await submitJob(workflow);
  const result = await pollJob(jobId);
  return result.output?.images || [];
}

// ── Workflow Builders ──

export function buildSketch2RenderWorkflow(params: {
  imageBase64: string;
  prompt: string;
  style?: string;
  steps?: number;
  controlnetStrength?: number;
}): Record<string, unknown> {
  const {
    imageBase64,
    prompt,
    style = "",
    steps = 30,
    controlnetStrength = 0.85,
  } = params;

  const fullPrompt = `${prompt}${style ? `, ${style} style` : ""}, photorealistic interior design, 8k, detailed, professional photography, natural lighting`;
  const negPrompt = "lowres, bad quality, blurry, cartoon, painting, sketch, watermark, text, deformed, ugly, oversaturated";

  return {
    // Load ControlNet Scribble/Canny preprocessor
    "1": {
      class_type: "LoadImage",
      inputs: { image: imageBase64 },
    },
    "2": {
      class_type: "CannyEdgePreprocessor",
      inputs: { image: ["1", 0], low_threshold: 100, high_threshold: 200, resolution: 1024 },
    },
    // Load checkpoint
    "3": {
      class_type: "CheckpointLoaderSimple",
      inputs: { ckpt_name: "juggernautXL_v9.safetensors" },
    },
    // ControlNet loader
    "4": {
      class_type: "ControlNetLoader",
      inputs: { control_net_name: "control-lora-canny-rank256.safetensors" },
    },
    // CLIP encode positive
    "5": {
      class_type: "CLIPTextEncode",
      inputs: { text: fullPrompt, clip: ["3", 1] },
    },
    // CLIP encode negative
    "6": {
      class_type: "CLIPTextEncode",
      inputs: { text: negPrompt, clip: ["3", 1] },
    },
    // Apply ControlNet
    "7": {
      class_type: "ControlNetApplyAdvanced",
      inputs: {
        positive: ["5", 0],
        negative: ["6", 0],
        control_net: ["4", 0],
        image: ["2", 0],
        strength: controlnetStrength,
        start_percent: 0,
        end_percent: 1,
      },
    },
    // Empty Latent
    "8": {
      class_type: "EmptyLatentImage",
      inputs: { width: 1024, height: 768, batch_size: 1 },
    },
    // KSampler
    "9": {
      class_type: "KSampler",
      inputs: {
        model: ["3", 0],
        positive: ["7", 0],
        negative: ["7", 1],
        latent_image: ["8", 0],
        seed: Math.floor(Math.random() * 2 ** 32),
        steps,
        cfg: 7.5,
        sampler_name: "dpmpp_2m",
        scheduler: "karras",
        denoise: 1.0,
      },
    },
    // VAE Decode
    "10": {
      class_type: "VAEDecode",
      inputs: { samples: ["9", 0], vae: ["3", 2] },
    },
    // Save
    "11": {
      class_type: "SaveImage",
      inputs: { images: ["10", 0], filename_prefix: "ida_render" },
    },
  };
}

export function buildText2ImgWorkflow(params: {
  prompt: string;
  style?: string;
  roomType?: string;
  width?: number;
  height?: number;
  steps?: number;
}): Record<string, unknown> {
  const {
    prompt,
    style = "",
    roomType = "",
    width = 1024,
    height = 768,
    steps = 30,
  } = params;

  const parts = [prompt];
  if (roomType) parts.unshift(roomType);
  if (style) parts.push(`${style} style`);
  parts.push("photorealistic interior design, 8k, ultra detailed, professional photography, natural lighting, architectural visualization");

  const fullPrompt = parts.join(", ");
  const negPrompt = "lowres, bad quality, blurry, cartoon, painting, sketch, watermark, text, deformed, ugly, oversaturated, low detail";

  return {
    "1": {
      class_type: "CheckpointLoaderSimple",
      inputs: { ckpt_name: "juggernautXL_v9.safetensors" },
    },
    "2": {
      class_type: "CLIPTextEncode",
      inputs: { text: fullPrompt, clip: ["1", 1] },
    },
    "3": {
      class_type: "CLIPTextEncode",
      inputs: { text: negPrompt, clip: ["1", 1] },
    },
    "4": {
      class_type: "EmptyLatentImage",
      inputs: { width, height, batch_size: 1 },
    },
    "5": {
      class_type: "KSampler",
      inputs: {
        model: ["1", 0],
        positive: ["2", 0],
        negative: ["3", 0],
        latent_image: ["4", 0],
        seed: Math.floor(Math.random() * 2 ** 32),
        steps,
        cfg: 7.5,
        sampler_name: "dpmpp_2m",
        scheduler: "karras",
        denoise: 1.0,
      },
    },
    "6": {
      class_type: "VAEDecode",
      inputs: { samples: ["5", 0], vae: ["1", 2] },
    },
    "7": {
      class_type: "SaveImage",
      inputs: { images: ["6", 0], filename_prefix: "ida_text2img" },
    },
  };
}

export function buildImg2ImgWorkflow(params: {
  imageBase64: string;
  prompt: string;
  style?: string;
  denoise?: number;
  steps?: number;
}): Record<string, unknown> {
  const {
    imageBase64,
    prompt,
    style = "",
    denoise = 0.55,
    steps = 35,
  } = params;

  const fullPrompt = `${prompt}${style ? `, ${style} style` : ""}, photorealistic interior design, 8k, detailed, professional photography`;
  const negPrompt = "lowres, bad quality, blurry, cartoon, painting, sketch, watermark, text, deformed, ugly";

  return {
    "1": {
      class_type: "LoadImage",
      inputs: { image: imageBase64 },
    },
    "2": {
      class_type: "CheckpointLoaderSimple",
      inputs: { ckpt_name: "juggernautXL_v9.safetensors" },
    },
    "3": {
      class_type: "VAEEncode",
      inputs: { pixels: ["1", 0], vae: ["2", 2] },
    },
    "4": {
      class_type: "CLIPTextEncode",
      inputs: { text: fullPrompt, clip: ["2", 1] },
    },
    "5": {
      class_type: "CLIPTextEncode",
      inputs: { text: negPrompt, clip: ["2", 1] },
    },
    "6": {
      class_type: "KSampler",
      inputs: {
        model: ["2", 0],
        positive: ["4", 0],
        negative: ["5", 0],
        latent_image: ["3", 0],
        seed: Math.floor(Math.random() * 2 ** 32),
        steps,
        cfg: 7.5,
        sampler_name: "dpmpp_2m",
        scheduler: "karras",
        denoise,
      },
    },
    "7": {
      class_type: "VAEDecode",
      inputs: { samples: ["6", 0], vae: ["2", 2] },
    },
    "8": {
      class_type: "SaveImage",
      inputs: { images: ["7", 0], filename_prefix: "ida_img2img" },
    },
  };
}

export function buildUpscaleWorkflow(params: {
  imageBase64: string;
  scale?: number;
}): Record<string, unknown> {
  const { imageBase64, scale = 4 } = params;

  return {
    "1": {
      class_type: "LoadImage",
      inputs: { image: imageBase64 },
    },
    "2": {
      class_type: "UpscaleModelLoader",
      inputs: { model_name: "RealESRGAN_x4plus.pth" },
    },
    "3": {
      class_type: "ImageUpscaleWithModel",
      inputs: { upscale_model: ["2", 0], image: ["1", 0] },
    },
    "4": {
      class_type: "SaveImage",
      inputs: { images: ["3", 0], filename_prefix: "ida_upscale" },
    },
  };
}

export function buildStyleTransferWorkflow(params: {
  imageBase64: string;
  style: string;
  strength?: number;
}): Record<string, unknown> {
  const { imageBase64, style, strength = 0.65 } = params;

  const stylePrompts: Record<string, string> = {
    "Modern Minimalist": "modern minimalist interior, clean lines, neutral palette, open space, natural light, white walls, simple furniture",
    "Wabi-sabi": "wabi-sabi interior, imperfect beauty, natural materials, earth tones, aged wood, handmade ceramics, organic textures",
    "Industrial": "industrial interior design, exposed brick, metal pipes, concrete floor, high ceiling, vintage lighting, raw materials",
    "Scandinavian": "scandinavian interior, hygge, light wood, white walls, cozy textiles, functional design, natural light, minimal decor",
    "Japanese Zen": "japanese zen interior, tatami, shoji screens, bamboo, minimalist, peaceful, natural materials, meditation space",
    "Art Deco": "art deco interior, geometric patterns, gold accents, velvet, marble, glamorous, bold colors, luxury",
    "Mid-Century Modern": "mid-century modern interior, organic shapes, warm wood, retro furniture, iconic design, open plan",
    "Contemporary Luxury": "contemporary luxury interior, high-end materials, designer furniture, statement lighting, premium finishes",
  };

  const fullPrompt = `${stylePrompts[style] || style}, photorealistic, 8k, professional interior photography`;
  const negPrompt = "lowres, bad quality, blurry, cartoon, painting, sketch, watermark, text";

  return {
    "1": {
      class_type: "LoadImage",
      inputs: { image: imageBase64 },
    },
    "2": {
      class_type: "CheckpointLoaderSimple",
      inputs: { ckpt_name: "juggernautXL_v9.safetensors" },
    },
    // Depth detection to preserve room structure
    "3": {
      class_type: "MiDaS-DepthMapPreprocessor",
      inputs: { image: ["1", 0], a: 6.283185307179586, bg_threshold: 0.1, resolution: 1024 },
    },
    "4": {
      class_type: "ControlNetLoader",
      inputs: { control_net_name: "control-lora-depth-rank256.safetensors" },
    },
    "5": {
      class_type: "CLIPTextEncode",
      inputs: { text: fullPrompt, clip: ["2", 1] },
    },
    "6": {
      class_type: "CLIPTextEncode",
      inputs: { text: negPrompt, clip: ["2", 1] },
    },
    "7": {
      class_type: "ControlNetApplyAdvanced",
      inputs: {
        positive: ["5", 0],
        negative: ["6", 0],
        control_net: ["4", 0],
        image: ["3", 0],
        strength: 0.8,
        start_percent: 0,
        end_percent: 1,
      },
    },
    "8": {
      class_type: "VAEEncode",
      inputs: { pixels: ["1", 0], vae: ["2", 2] },
    },
    "9": {
      class_type: "KSampler",
      inputs: {
        model: ["2", 0],
        positive: ["7", 0],
        negative: ["7", 1],
        latent_image: ["8", 0],
        seed: Math.floor(Math.random() * 2 ** 32),
        steps: 35,
        cfg: 7.5,
        sampler_name: "dpmpp_2m",
        scheduler: "karras",
        denoise: strength,
      },
    },
    "10": {
      class_type: "VAEDecode",
      inputs: { samples: ["9", 0], vae: ["2", 2] },
    },
    "11": {
      class_type: "SaveImage",
      inputs: { images: ["10", 0], filename_prefix: "ida_style" },
    },
  };
}
