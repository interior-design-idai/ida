import { NextRequest, NextResponse } from "next/server";

// Client redirect after payment (ClientBackURL)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tradeNo = searchParams.get("tradeNo") || "";

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Redirect to account page with success message
  return NextResponse.redirect(`${baseURL}/account?payment=success&tradeNo=${tradeNo}`);
}
