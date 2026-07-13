import { supabase } from "@/integrations/supabase/client";

export type BusinessEventType =
  | "view"
  | "profile_visit"
  | "website_click"
  | "phone_click";

const sent = new Set<string>();

export async function trackEvent(businessId: string, eventType: BusinessEventType) {
  if (!businessId) return;
  // Dedupe profile_visit per page load
  if (eventType === "profile_visit") {
    const key = `${businessId}:${eventType}`;
    if (sent.has(key)) return;
    sent.add(key);
  }
  const { data: sess } = await supabase.auth.getSession();
  const user_id = sess.session?.user.id ?? null;
  await supabase.from("business_events").insert({
    business_id: businessId,
    event_type: eventType,
    user_id,
  });
}
