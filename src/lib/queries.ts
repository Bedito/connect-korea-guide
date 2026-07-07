import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BUSINESS_SELECT = `
  id, slug, name, tagline, description, address, phone, website, email,
  cover_image, logo, photos, languages, services, amenities, hours,
  price_level, rating, review_count, verified, featured, latitude, longitude,
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

export interface BrowseFilters {
  q?: string;
  category?: string;
  city?: string;
  language?: string;
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
          `name.ilike.%${filters.q}%,tagline.ilike.%${filters.q}%,description.ilike.%${filters.q}%`,
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
      if (filters.language) {
        query = query.contains("languages", [filters.language]);
      }
      query = query.order("featured", { ascending: false }).order("rating", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
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
