import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { Star } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard — Seoul Compass" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else setReady(true);
  }, [user, loading, navigate]);

  if (!ready || !user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-display text-5xl sm:text-6xl">Your dashboard</h1>
      <p className="mt-2 text-muted-foreground">Manage your reviews, claims, and businesses.</p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <MyBusinesses userId={user.id} />
        <MyClaims userId={user.id} />
      </div>
      <div className="mt-12">
        <MyReviews userId={user.id} />
      </div>
    </div>
  );
}

function MyBusinesses({ userId }: { userId: string }) {
  const { data = [] } = useQuery({
    queryKey: ["dashboard", "businesses", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, slug, status, rating, review_count")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <section>
      <h2 className="text-display text-2xl">Your businesses</h2>
      <ul className="mt-4 space-y-2">
        {data.length === 0 && (
          <li className="rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
            You don't own any listings yet. Find your business and click "Claim".
          </li>
        )}
        {data.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3"
          >
            <div>
              <Link
                to="/business/$slug"
                params={{ slug: b.slug }}
                className="font-medium hover:underline"
              >
                {b.name}
              </Link>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="capitalize">
                  {b.status}
                </Badge>
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-foreground" /> {b.rating} ({b.review_count})
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MyClaims({ userId }: { userId: string }) {
  const { data = [] } = useQuery({
    queryKey: ["dashboard", "claims", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_claims")
        .select("id, status, created_at, message, businesses:business_id ( name, slug )")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <section>
      <h2 className="text-display text-2xl">Your claims</h2>
      <ul className="mt-4 space-y-2">
        {data.length === 0 && (
          <li className="rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
            No claim requests yet.
          </li>
        )}
        {data.map((c) => {
          type Biz = { name: string; slug: string };
          const biz = (Array.isArray(c.businesses) ? c.businesses[0] : c.businesses) as Biz | null;
          return (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3"
            >
              <div>
                {biz && (
                  <Link
                    to="/business/$slug"
                    params={{ slug: biz.slug }}
                    className="font-medium hover:underline"
                  >
                    {biz.name}
                  </Link>
                )}
                {c.message && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{c.message}</p>
                )}
              </div>
              <Badge variant="outline" className="capitalize">
                {c.status}
              </Badge>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function MyReviews({ userId }: { userId: string }) {
  const { data = [] } = useQuery({
    queryKey: ["dashboard", "reviews", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, title, body, created_at, businesses:business_id ( name, slug )")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <section>
      <h2 className="text-display text-2xl">Your reviews</h2>
      <ul className="mt-4 space-y-3">
        {data.length === 0 && (
          <li className="rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
            You haven't reviewed any businesses yet.
          </li>
        )}
        {data.map((r) => {
          type Biz = { name: string; slug: string };
          const biz = (Array.isArray(r.businesses) ? r.businesses[0] : r.businesses) as Biz | null;
          return (
            <li key={r.id} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center justify-between">
                {biz && (
                  <Link
                    to="/business/$slug"
                    params={{ slug: biz.slug }}
                    className="font-medium hover:underline"
                  >
                    {biz.name}
                  </Link>
                )}
                <StarRating value={r.rating} readOnly size={14} />
              </div>
              {r.title && <div className="mt-1 text-sm font-semibold">{r.title}</div>}
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
