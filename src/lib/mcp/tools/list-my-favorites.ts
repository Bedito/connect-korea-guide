import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import type { Database } from "@/integrations/supabase/types";

function supabaseForUser(token: string) {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_my_favorites",
  title: "List my favorites",
  description: "List the signed-in user's favorite businesses on 친구Base.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const token = ctx.getToken();
    const userId = ctx.getUserId();
    if (!ctx.isAuthenticated() || !token || !userId) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(token);
    const { data, error } = await supabase
      .from("favorites")
      .select("business_id, created_at, businesses:business_id(id, name, slug, tagline, verified)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { favorites: data ?? [] },
    };
  },
});
