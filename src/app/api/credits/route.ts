import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";

// GET /api/credits?userId=xxx — get credit balance
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return Response.json({ error: "userId required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ credits: data.credits });
}

// POST /api/credits — consume or add credits
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, amount, type, description } = body;

  if (!userId || !amount || !type) {
    return Response.json({ error: "userId, amount, type required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Check balance for consumption
  if (type === "consume") {
    const { data: user } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (!user || user.credits < amount) {
      return Response.json({ error: "Insufficient credits" }, { status: 402 });
    }
  }

  // Update balance
  const delta = type === "consume" ? -amount : amount;
  const { error: updateError } = await supabase.rpc("update_credits", {
    p_user_id: userId,
    p_delta: delta,
  });

  if (updateError) {
    // Fallback: direct update if RPC doesn't exist yet
    const { data: user } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (user) {
      await supabase
        .from("users")
        .update({ credits: user.credits + delta })
        .eq("id", userId);
    }
  }

  // Record transaction
  await supabase.from("transactions").insert({
    user_id: userId,
    type,
    amount,
    description: description || `${type} ${amount} credits`,
  });

  return Response.json({ success: true });
}
