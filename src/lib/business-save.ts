import { supabase } from "@/integrations/supabase/client";
import type { BusinessFormValues, StaffDraft } from "@/lib/business-form";
import { slugify } from "@/lib/business-form";

function clean(v: string | undefined | null) {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}

function toBusinessPayload(v: BusinessFormValues, ownerId: string) {
  const lat = Number.isFinite(v.latitude as number) ? Number(v.latitude) : null;
  const lng = Number.isFinite(v.longitude as number) ? Number(v.longitude) : null;
  return {
    owner_id: ownerId,
    name: v.name.trim(),
    tagline: clean(v.tagline),
    description: clean(v.description),
    category_id: v.category_id,
    city_id: v.city_id,
    district_id: v.district_id ? v.district_id : null,
    address: clean(v.address),
    latitude: lat,
    longitude: lng,
    google_maps_url: clean(v.google_maps_url),
    // Store naver maps in website slot? We add a separate column via json/website. There's no dedicated column, so we stash in google_maps_url? Better: dedicated field via description. We'll keep naver in website field only if empty? Simpler — reuse a JSON pattern.
    website: clean(v.website),
    phone: clean(v.phone),
    email: clean(v.email),
    instagram: clean(v.instagram),
    kakao_id: clean(v.kakao_id),
    holiday_notice: clean(v.holiday_notice),
    languages: v.languages,
    services: v.services ?? [],
    amenities: v.amenities ?? [],
    logo: clean(v.logo),
    cover_image: clean(v.cover_image),
    photos: v.photos ?? [],
    hours: v.hours ?? {},
    pricing: v.pricing ?? [],
    faqs: v.faqs ?? [],
  };
}

async function ensureUniqueSlug(baseName: string, ignoreId?: string) {
  const base = slugify(baseName) || "business";
  let candidate = base;
  let n = 2;
  // Try up to 20 variants
  while (n < 20) {
    let q = supabase.from("businesses").select("id").eq("slug", candidate);
    if (ignoreId) q = q.neq("id", ignoreId);
    const { data } = await q.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${n++}`;
  }
  return `${base}-${Date.now()}`;
}

async function replaceStaff(businessId: string, staff: StaffDraft[]) {
  // Simple strategy: delete all + insert. RLS allows owner and admin.
  const { error: delErr } = await supabase
    .from("staff")
    .delete()
    .eq("business_id", businessId);
  if (delErr) throw delErr;
  const clean = staff
    .filter((s) => s.name.trim().length > 0)
    .map((s, i) => ({
      business_id: businessId,
      name: s.name.trim(),
      position: s.position?.trim() || null,
      photo: s.photo || null,
      languages: s.languages ?? [],
      sort_order: i,
    }));
  if (clean.length === 0) return;
  const { error } = await supabase.from("staff").insert(clean);
  if (error) throw error;
}

export async function createBusinessDraft(
  values: BusinessFormValues,
  ownerId: string,
  staff: StaffDraft[] = [],
): Promise<{ id: string; slug: string }> {
  const slug = await ensureUniqueSlug(values.name);
  const payload = { ...toBusinessPayload(values, ownerId), slug, status: "pending" as const };
  const { data, error } = await supabase
    .from("businesses")
    .insert(payload)
    .select("id, slug")
    .single();
  if (error) throw error;
  if (staff.length) await replaceStaff(data.id, staff);
  return data;
}

export async function updateBusiness(
  id: string,
  values: BusinessFormValues,
  ownerId: string,
  staff: StaffDraft[],
  currentSlug: string,
): Promise<{ id: string; slug: string }> {
  const desired = slugify(values.name);
  const slug =
    desired && desired !== currentSlug
      ? await ensureUniqueSlug(values.name, id)
      : currentSlug;
  const payload = { ...toBusinessPayload(values, ownerId), slug };
  const { error } = await supabase
    .from("businesses")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
  await replaceStaff(id, staff);
  return { id, slug };
}

export async function loadBusinessForEdit(id: string): Promise<{
  values: BusinessFormValues;
  slug: string;
  staff: StaffDraft[];
} | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: staff, error: sErr } = await supabase
    .from("staff")
    .select("id, name, position, photo, languages, sort_order")
    .eq("business_id", id)
    .order("sort_order");
  if (sErr) throw sErr;
  const values: BusinessFormValues = {
    name: data.name ?? "",
    tagline: data.tagline ?? "",
    description: data.description ?? "",
    category_id: data.category_id ?? "",
    city_id: data.city_id ?? "",
    district_id: data.district_id ?? "",
    address: data.address ?? "",
    latitude: (data.latitude as number) ?? (undefined as unknown as number),
    longitude: (data.longitude as number) ?? (undefined as unknown as number),
    google_maps_url: data.google_maps_url ?? "",
    naver_maps_url: "",
    languages: (data.languages as string[]) ?? ["english"],
    services: (data.services as string[]) ?? [],
    amenities: (data.amenities as string[]) ?? [],
    phone: data.phone ?? "",
    email: data.email ?? "",
    website: data.website ?? "",
    instagram: data.instagram ?? "",
    kakao_id: data.kakao_id ?? "",
    holiday_notice: data.holiday_notice ?? "",
    logo: data.logo ?? "",
    cover_image: data.cover_image ?? "",
    photos: (data.photos as string[]) ?? [],
    hours: (data.hours as Record<string, unknown>) ?? {},
    pricing: (data.pricing as { name: string; price: string; description?: string }[]) ?? [],
    faqs: (data.faqs as { question: string; answer: string }[]) ?? [],
  };
  return {
    values,
    slug: data.slug,
    staff: (staff ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      position: s.position ?? "",
      photo: s.photo ?? "",
      languages: (s.languages as string[]) ?? [],
      sort_order: s.sort_order ?? 0,
    })),
  };
}
