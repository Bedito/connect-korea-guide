import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BUSINESS_SELECT = `
  id, slug, name, tagline, description, address, phone, website, email,
  cover_image, logo, photos, languages, services, amenities, hours,
  price_level, rating, review_count, verified, featured, latitude, longitude, owner_id,
  categories:category_id ( id, name, slug, icon ),
  cities:city_id ( id, name, slug ),
  districts:district_id ( id, name, slug )
`;

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data;
  },
});

export const citiesQuery = queryOptions({
  queryKey: ["cities"],
  queryFn: async () => {
    const { data, error } = await supabase.from("cities").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

export const featuredBusinessesQuery = queryOptions({
  queryKey: ["businesses", "featured"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select(BUSINESS_SELECT)
      .eq("status", "approved")
      .eq("featured", true)
      .order("rating", { ascending: false })
      .limit(8);
    if (error) throw error;
    return data;
  },
});

export const topRatedBusinessesQuery = queryOptions({
  queryKey: ["businesses", "top-rated"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select(BUSINESS_SELECT)
      .eq("status", "approved")
      .gte("review_count", 1)
      .order("rating", { ascending: false })
      .order("review_count", { ascending: false })
      .limit(8);
    if (error) throw error;
    return data;
  },
});

export const cityCountsQuery = queryOptions({
  queryKey: ["cities", "counts"],
  queryFn: async () => {
    const { data: cities, error: cErr } = await supabase.from("cities").select("*").order("name");
    if (cErr) throw cErr;
    const { data: bs, error: bErr } = await supabase
      .from("businesses")
      .select("city_id")
      .eq("status", "approved");
    if (bErr) throw bErr;
    const counts = new Map<string, number>();
    for (const b of bs ?? []) {
      if (b.city_id) counts.set(b.city_id, (counts.get(b.city_id) ?? 0) + 1);
    }
    return (cities ?? []).map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }));
  },
});

export const recentBusinessesQuery = queryOptions({
  queryKey: ["businesses", "recent"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select(BUSINESS_SELECT)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw error;
    return data;
  },
});

export const districtsByCityQuery = (citySlug: string | undefined) =>
  queryOptions({
    queryKey: ["districts", citySlug ?? "all"],
    queryFn: async () => {
      let q = supabase.from("districts").select("id, name, slug, city_id, cities:city_id(slug)").order("name");
      const { data, error } = await q;
      if (error) throw error;
      if (!citySlug) return data;
      return (data ?? []).filter((d: { cities: { slug: string } | null }) => d.cities?.slug === citySlug);
    },
  });

export type SortKey = "recommended" | "rating" | "reviews" | "newest" | "distance";

export interface BrowseFilters {
  q?: string;
  category?: string;
  city?: string;
  district?: string;
  languages?: string[];
  verified?: boolean;
  openNow?: boolean;
  parking?: boolean;
  online?: boolean;
  emergency?: boolean;
  reservation?: boolean;
  sort?: SortKey;
}

const AMENITY_FLAGS: Record<string, string> = {
  parking: "parking",
  online: "online_consultation",
  emergency: "emergency_service",
  reservation: "reservation_required",
};

export function isOpenNow(hours: unknown): boolean {
  if (!hours || typeof hours !== "object") return true;
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const now = new Date();
  const key = days[now.getDay()];
  const h = (hours as Record<string, { open?: string; close?: string; closed?: boolean } | undefined>)[key];
  if (!h || h.closed || !h.open || !h.close) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = h.open.split(":").map(Number);
  const [ch, cm] = h.close.split(":").map(Number);
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}

export function browseQuery(filters: BrowseFilters) {
  return queryOptions({
    queryKey: ["businesses", "browse", filters],
    queryFn: async () => {
      let query = supabase
        .from("businesses")
        .select(BUSINESS_SELECT)
        .eq("status", "approved");

      if (filters.q) {
        query = query.or(
          `name.ilike.%${filters.q}%,tagline.ilike.%${filters.q}%,description.ilike.%${filters.q}%,address.ilike.%${filters.q}%`,
        );
      }
      if (filters.category) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", filters.category)
          .maybeSingle();
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (filters.city) {
        const { data: c } = await supabase
          .from("cities")
          .select("id")
          .eq("slug", filters.city)
          .maybeSingle();
        if (c) query = query.eq("city_id", c.id);
      }
      if (filters.district) {
        const { data: d } = await supabase
          .from("districts")
          .select("id")
          .eq("slug", filters.district)
          .maybeSingle();
        if (d) query = query.eq("district_id", d.id);
      }
      if (filters.languages && filters.languages.length > 0) {
        query = query.contains("languages", filters.languages);
      }
      if (filters.verified) query = query.eq("verified", true);

      for (const [key, flag] of Object.entries(AMENITY_FLAGS)) {
        if (filters[key as keyof BrowseFilters]) {
          query = query.contains("amenities", [flag]);
        }
      }

      switch (filters.sort) {
        case "rating":
          query = query.order("rating", { ascending: false }).order("review_count", { ascending: false });
          break;
        case "reviews":
          query = query.order("review_count", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "distance":
        case "recommended":
        default:
          query = query.order("featured", { ascending: false }).order("rating", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      let rows = data ?? [];
      if (filters.openNow) rows = rows.filter((b) => isOpenNow(b.hours));
      return rows;
    },
  });
}


export function businessBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["business", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select(BUSINESS_SELECT)
        .eq("slug", slug)
        .eq("status", "approved")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
