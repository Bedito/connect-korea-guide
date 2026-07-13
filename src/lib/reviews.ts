import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReviewRow {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string;
  photos: string[] | null;
  owner_reply: string | null;
  owner_reply_at: string | null;
  created_at: string;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
}

export function businessReviewsQuery(businessId: string) {
  return queryOptions({
    queryKey: ["reviews", "business", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id, business_id, user_id, rating, title, body, photos, owner_reply, owner_reply_at, created_at",
        )
        .eq("business_id", businessId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as Omit<ReviewRow, "profiles">[];
      if (rows.length === 0) return [] as ReviewRow[];
      const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      return rows.map((r) => ({
        ...r,
        profiles: map.get(r.user_id)
          ? {
              display_name: map.get(r.user_id)!.display_name,
              avatar_url: map.get(r.user_id)!.avatar_url,
            }
          : null,
      })) as ReviewRow[];
    },
  });
}

export function myReviewForBusinessQuery(businessId: string, userId: string | undefined) {
  return queryOptions({
    queryKey: ["reviews", "mine", businessId, userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, title, body, photos")
        .eq("business_id", businessId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
