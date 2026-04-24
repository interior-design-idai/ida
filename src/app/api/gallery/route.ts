import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";

// GET /api/gallery — fetch public gallery
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("category") || "all";
  const search = searchParams.get("search") || "";

  const offset = (page - 1) * limit;

  const supabase = getServiceClient();
  let query = supabase
    .from("generations")
    .select("id, function_type, prompt, output_image_url, credits_used, created_at, users(name)", { count: "exact" })
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.ilike("prompt", `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    items: data,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
