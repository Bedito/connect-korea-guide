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
  name: "add_favorite",
  title: "Add favorite",
  description: "Add a business to the signed-in user's favorites on 친구Base by business slug.",
  inputSchema: {
    slug: z.string().trim().min(1).describe("Business slug, e.g. 'seoul-dental-clinic'."),
  },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    const token = ctx.getToken();
    const userId = ctx.getUserId();
    if (!ctx.isAuthenticated() || !token || !userId) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(token);
    const { data: biz, error: bizErr } = await supabase
      .from("businesses")
      .select("id, name")
      .eq("slug", slug)
      .maybeSingle();
    if (bizErr) return { content: [{ type: "text", text: bizErr.message }], isError: true };
    if (!biz) return { content: [{ type: "text", text: `No business with slug '${slug}'` }], isError: true };

    const { error } = await supabase
      .from("favorites")
      .upsert({ user_id: userId, business_id: biz.id }, { onConflict: "user_id,business_id" });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Added ${biz.name} to favorites.` }] };
  },
});
