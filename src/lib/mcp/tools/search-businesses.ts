import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function supabaseForUser(token: string) {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "search_businesses",
  title: "Search businesses",
  description:
    "Search published businesses on 친구Base by name, tagline, or description. Optionally filter by category slug (e.g. 'doctors', 'real-estate').",
  inputSchema: {
    query: z.string().trim().min(1).describe("Text to search in business name/tagline/description."),
    category: z.string().trim().optional().describe("Optional category slug filter."),
    limit: z.number().int().min(1).max(25).optional().describe("Max results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx.getToken());
    let q = supabase
      .from("businesses")
      .select("id, name, slug, tagline, description, verified, rating, review_count, categories:category_id(slug,name)")
      .eq("status", "published")
      .or(`name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%`)
      .order("verified", { ascending: false })
      .order("rating", { ascending: false })
      .limit(limit ?? 10);

    if (category) {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).maybeSingle();
      if (cat?.id) q = q.eq("category_id", cat.id);
    }

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { businesses: data ?? [] },
    };
  },
});
