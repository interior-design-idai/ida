import Replicate from "replicate";

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export const MODELS = {
  sketch2render: "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
  flux_pro: "black-forest-labs/flux-1.1-pro",
  img2img: "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
  upscale: "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
  text2img: "black-forest-labs/flux-schnell",
} as const;

export const CREDIT_COSTS: Record<string, number> = {
  sketch2render: 2,
  realistic_render: 2,
  photo_remodel: 3,
  style_transfer: 2,
  upscale: 1,
  text2img: 1,
};
