import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { BusinessCard } from "@/components/business-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Your favorites — 친구Base" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user, loading } = useAuth();

  const q = useQuery({
    enabled: !!user,
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select(
          `id, businesses:business_id (
            id, slug, name, tagline, cover_image, rating, review_count, verified, languages, price_level,
            categories:category_id (name), cities:city_id (name), districts:district_id (name)
          )`,
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (loading) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
        <h1 className="text-display mt-4 text-4xl">Sign in to see your favorites</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Save businesses to easily find them later.
        </p>
        <Link to="/auth" className="mt-6 inline-block">
          <Button size="lg">Sign in</Button>
        </Link>
      </div>
    );
  }

  const items = (q.data ?? []).map((f) => f.businesses).filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-display text-5xl">Your favorites</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {items.length} saved business{items.length === 1 ? "" : "es"}
      </p>

      {items.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border/70 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            You haven't saved any businesses yet.
          </p>
          <Link to="/browse" className="mt-4 inline-block">
            <Button variant="outline">Start browsing</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(
            (b) => b && <BusinessCard key={b.id} business={b as never} />,
          )}
        </div>
      )}
    </div>
  );
}
