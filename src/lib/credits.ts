export const CREDIT_COSTS: Record<string, number> = {
  sketch2render: 2,
  realistic_render: 2,
  photo_remodel: 3,
  style_transfer: 2,
  upscale: 1,
  text2img: 1,
};

export const PRICING = {
  packs: [
    { id: "pack_50", credits: 50, price: 199, currency: "TWD", label: "50 Points" },
    { id: "pack_150", credits: 150, price: 499, currency: "TWD", label: "150 Points" },
    { id: "pack_500", credits: 500, price: 1499, currency: "TWD", label: "500 Points" },
  ],
  subscriptions: [
    { id: "basic", credits: 100, price: 299, currency: "TWD", label: "Basic", period: "month" },
    { id: "pro", credits: 500, price: 799, currency: "TWD", label: "Pro", period: "month" },
    { id: "studio", credits: 2000, price: 2999, currency: "TWD", label: "Studio", period: "month" },
  ],
} as const;

export function getCreditCost(functionType: string): number {
  return CREDIT_COSTS[functionType] ?? 2;
}

export function formatPrice(amount: number, currency: string = "TWD"): string {
  return new Intl.NumberFormat("zh-TW", { style: "currency", currency }).format(amount);
}
