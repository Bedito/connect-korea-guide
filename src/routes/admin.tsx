import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Seoul Compass" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else setChecked(true);
  }, [user, loading, navigate]);

  if (!checked) return null;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-display text-4xl">Admins only</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You don't have admin access. If this is a mistake, contact the team.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-display text-5xl sm:text-6xl">Admin</h1>
      <p className="mt-2 text-muted-foreground">
        Moderate listings, claims, and reviews.
      </p>

      <div className="mt-12 space-y-16">
        <PendingClaims />
        <PendingBusinesses />
        <RecentReviews />
      </div>
    </div>
  );
}

function PendingClaims() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "claims"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_claims")
        .select("id, status, message, proof_url, created_at, user_id, business_id, businesses:business_id ( name, slug )")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const decide = useMutation({
    mutationFn: async ({
      claimId,
      businessId,
      userId,
      approve,
    }: {
      claimId: string;
      businessId: string;
      userId: string;
      approve: boolean;
    }) => {
      const { error: e1 } = await supabase
        .from("business_claims")
        .update({ status: approve ? "approved" : "rejected" })
        .eq("id", claimId);
      if (e1) throw e1;
      if (approve) {
        const { error: e2 } = await supabase
          .from("businesses")
          .update({ owner_id: userId, verified: true })
          .eq("id", businessId);
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      toast("Claim updated");
      qc.invalidateQueries({ queryKey: ["admin", "claims"] });
    },
    onError: (e: Error) => toast(e.message),
  });

  return (
    <section>
      <h2 className="text-display text-2xl">Business claims</h2>
      <ul className="mt-4 space-y-3">
        {data.length === 0 && (
          <li className="rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
            No claims yet.
          </li>
        )}
        {data.map((c) => {
          type Biz = { name: string; slug: string };
          const biz = (Array.isArray(c.businesses) ? c.businesses[0] : c.businesses) as Biz | null;
          return (
            <li key={c.id} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  {biz && (
                    <Link
                      to="/business/$slug"
                      params={{ slug: biz.slug }}
                      className="font-medium hover:underline"
                    >
                      {biz.name}
                    </Link>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">User: {c.user_id}</div>
                  {c.message && <p className="mt-2 text-sm">{c.message}</p>}
                  {c.proof_url && (
                    <a
                      href={c.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-xs underline underline-offset-4"
                    >
                      Proof: {c.proof_url}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {c.status}
                  </Badge>
                  {c.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          decide.mutate({
                            claimId: c.id,
                            businessId: c.business_id,
                            userId: c.user_id,
                            approve: true,
                          })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          decide.mutate({
                            claimId: c.id,
                            businessId: c.business_id,
                            userId: c.user_id,
                            approve: false,
                          })
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PendingBusinesses() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, slug, status, verified, featured, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  type BizPatch = { status?: string; featured?: boolean; verified?: boolean };
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: BizPatch }) => {
      const { error } = await supabase.from("businesses").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast("Business updated");
      qc.invalidateQueries({ queryKey: ["admin", "businesses"] });
    },
    onError: (e: Error) => toast(e.message),
  });

  return (
    <section>
      <h2 className="text-display text-2xl">Businesses</h2>
      <ul className="mt-4 space-y-2">
        {data.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3"
          >
            <div>
              <Link
                to="/business/$slug"
                params={{ slug: b.slug }}
                className="font-medium hover:underline"
              >
                {b.name}
              </Link>
              <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="capitalize">
                  {b.status}
                </Badge>
                {b.verified && <Badge variant="secondary">Verified</Badge>}
                {b.featured && <Badge>Featured</Badge>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {b.status !== "approved" && (
                <Button
                  size="sm"
                  onClick={() => update.mutate({ id: b.id, patch: { status: "approved" } })}
                >
                  Approve
                </Button>
              )}
              {b.status === "approved" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => update.mutate({ id: b.id, patch: { status: "pending" } })}
                >
                  Unpublish
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => update.mutate({ id: b.id, patch: { featured: !b.featured } })}
              >
                {b.featured ? "Unfeature" : "Feature"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => update.mutate({ id: b.id, patch: { verified: !b.verified } })}
              >
                {b.verified ? "Unverify" : "Verify"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RecentReviews() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, title, body, status, created_at, business_id, businesses:business_id ( name, slug )")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast("Review updated");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
  });

  return (
    <section>
      <h2 className="text-display text-2xl">Recent reviews</h2>
      <ul className="mt-4 space-y-3">
        {data.map((r) => {
          type Biz = { name: string; slug: string };
          const biz = (Array.isArray(r.businesses) ? r.businesses[0] : r.businesses) as Biz | null;
          return (
            <li key={r.id} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
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
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {r.rating}★ · {r.status}
                  </div>
                  {r.title && <div className="mt-1 font-semibold">{r.title}</div>}
                  <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toggle.mutate({
                      id: r.id,
                      status: r.status === "approved" ? "hidden" : "approved",
                    })
                  }
                >
                  {r.status === "approved" ? "Hide" : "Restore"}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
