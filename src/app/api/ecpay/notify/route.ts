import { NextRequest } from "next/server";
import { verifyCheckMacValue } from "@/lib/ecpay";
import { getServiceClient } from "@/lib/supabase";
import { PRICING } from "@/lib/credits";

// ECPay server-to-server payment notification (ReturnURL)
// ECPay expects "1|OK" response on success
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });

  // Verify CheckMacValue
  if (!verifyCheckMacValue(params)) {
    console.error("ECPay CheckMacValue verification failed", params);
    return new Response("0|CheckMacValue Error", { status: 400 });
  }

  const rtnCode = params.RtnCode;
  const tradeNo = params.MerchantTradeNo;

  // RtnCode "1" means payment success
  if (rtnCode !== "1") {
    console.log(`ECPay payment not successful: ${tradeNo}, RtnCode: ${rtnCode}`);
    return new Response("1|OK");
  }

  // Extract userId and packId from CustomField
  const customField = params.CustomField1 || "";
  const [userId, packId] = customField.split("|");

  if (!userId || !packId) {
    console.error("Missing userId or packId in CustomField1", { tradeNo, customField });
    return new Response("1|OK");
  }

  const pack = PRICING.packs.find((p) => p.id === packId);
  if (!pack) {
    console.error("Invalid packId", { tradeNo, packId });
    return new Response("1|OK");
  }

  const supabase = getServiceClient();

  // Check if this trade was already processed (idempotency)
  const { data: existing } = await supabase
    .from("transactions")
    .select("id")
    .eq("description", `ecpay:${tradeNo}`)
    .single();

  if (existing) {
    return new Response("1|OK");
  }

  // Get current user credits
  const { data: user } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (!user) {
    console.error("User not found", { userId, tradeNo });
    return new Response("1|OK");
  }

  // Add credits
  await supabase
    .from("users")
    .update({ credits: user.credits + pack.credits })
    .eq("id", userId);

  // Record transaction
  await supabase.from("transactions").insert({
    user_id: userId,
    type: "purchase",
    amount: pack.credits,
    description: `ecpay:${tradeNo}`,
  });

  return new Response("1|OK");
}
