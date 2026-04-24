import { NextRequest } from "next/server";
import { buildCheckoutFormData, getPaymentURL } from "@/lib/ecpay";
import { PRICING } from "@/lib/credits";

export async function POST(request: NextRequest) {
  const { packId, userId } = await request.json();

  if (!packId || !userId) {
    return Response.json({ error: "packId and userId required" }, { status: 400 });
  }

  const pack = PRICING.packs.find((p) => p.id === packId);
  if (!pack) {
    return Response.json({ error: "Invalid pack" }, { status: 400 });
  }

  // Generate unique trade number (max 20 chars for ECPay)
  const tradeNo = `IDAI${Date.now().toString(36).toUpperCase()}`;

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const formData = buildCheckoutFormData({
    tradeNo,
    totalAmount: pack.price,
    tradeDesc: "IDAI AI Render Platform",
    itemName: `IDAI ${pack.label} - ${pack.credits} Points`,
    returnURL: `${baseURL}/api/ecpay/notify`,
    clientBackURL: `${baseURL}/api/ecpay/return?tradeNo=${tradeNo}`,
    customField1: `${userId}|${packId}`,
  });

  return Response.json({
    formData,
    paymentURL: getPaymentURL(),
    tradeNo,
  });
}
