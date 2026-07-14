import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — 친구Base" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || roleLoading || !user) return null;
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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-display text-4xl sm:text-5xl">Admin</h1>
      <p className="mt-2 text-muted-foreground">
        Manage users, listings, taxonomy, reviews, reports and homepage curation.
      </p>

      <Tabs defaultValue="overview" className="mt-10">
        <TabsList className="flex flex-wrap h-auto justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="claims">Verification</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="overview"><Overview /></TabsContent>
          <TabsContent value="users"><UsersPanel /></TabsContent>
          <TabsContent value="businesses"><BusinessesPanel /></TabsContent>
          <TabsContent value="featured"><FeaturedPanel /></TabsContent>
          <TabsContent value="claims"><ClaimsPanel /></TabsContent>
          <TabsContent value="reviews"><ReviewsPanel /></TabsContent>
          <TabsContent value="reports"><ReportsPanel /></TabsContent>
          <TabsContent value="categories"><CategoriesPanel /></TabsContent>
          <TabsContent value="cities"><CitiesPanel /></TabsContent>
          <TabsContent value="homepage"><HomepagePanel /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

/* ---------------- Overview ---------------- */
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function Overview() {
  const { data } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const counts = await Promise.all([
        supabase.from("businesses").select("*", { count: "exact", head: true }),
        supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("business_claims").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      return {
        businesses: counts[0].count ?? 0,
        pendingBiz: counts[1].count ?? 0,
        reviews: counts[2].count ?? 0,
        openReports: counts[3].count ?? 0,
        pendingClaims: counts[4].count ?? 0,
        users: counts[5].count ?? 0,
      };
    },
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Stat label="Users" value={data?.users ?? "—"} />
      <Stat label="Businesses" value={data?.businesses ?? "—"} />
      <Stat label="Pending listings" value={data?.pendingBiz ?? "—"} />
      <Stat label="Reviews" value={data?.reviews ?? "—"} />
      <Stat label="Open reports" value={data?.openReports ?? "—"} />
      <Stat label="Pending claims" value={data?.pendingClaims ?? "—"} />
    </div>
  );
}

/* ---------------- Users ---------------- */
function UsersPanel() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data = [] } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap = new Map<string, string[]>();
      (roles ?? []).forEach((r) => {
        const arr = roleMap.get(r.user_id) ?? [];
        arr.push(r.role);
        roleMap.set(r.user_id, arr);
      });
      return (profiles ?? []).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [] }));
    },
  });

  const toggleAdmin = useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      if (makeAdmin) {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
        if (error && !error.message.includes("duplicate")) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast("Role updated");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e: Error) => toast(e.message),
  });

  const filtered = data.filter((u) =>
    !q || (u.display_name ?? "").toLowerCase().includes(q.toLowerCase()) || u.id.includes(q)
  );

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <Input placeholder="Search by name or id…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <span className="text-sm text-muted-foreground">{filtered.length} users</span>
      </div>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => {
              const isAdm = u.roles.includes("admin");
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.display_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.id.slice(0, 8)}…</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length === 0 && <Badge variant="outline">user</Badge>}
                      {u.roles.map((r) => (
                        <Badge key={r} variant={r === "admin" ? "default" : "outline"}>{r}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={isAdm ? "outline" : "default"}
                      onClick={() => toggleAdmin.mutate({ userId: u.id, makeAdmin: !isAdm })}
                    >
                      {isAdm ? "Remove admin" : "Make admin"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

/* ---------------- Businesses ---------------- */
function BusinessesPanel() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data = [] } = useQuery({
    queryKey: ["admin", "businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, slug, status, verified, featured, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  type Patch = { status?: "approved" | "pending" | "rejected"; featured?: boolean; verified?: boolean };
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Patch }) => {
      const { error } = await supabase.from("businesses").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast("Business updated");
      qc.invalidateQueries({ queryKey: ["admin", "businesses"] });
    },
    onError: (e: Error) => toast(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("businesses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast("Business deleted");
      qc.invalidateQueries({ queryKey: ["admin", "businesses"] });
    },
    onError: (e: Error) => toast(e.message),
  });

  const filtered = data.filter(
    (b) =>
      (statusFilter === "all" || b.status === statusFilter) &&
      (!q || b.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <div className="flex gap-1">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              onClick={() => setStatusFilter(s)}
              className="capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
        <span className="ml-auto text-sm text-muted-foreground">{filtered.length}</span>
      </div>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <Link to="/business/$slug" params={{ slug: b.slug }} className="font-medium hover:underline">
                    {b.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="capitalize">{b.status}</Badge>
                    {b.verified && <Badge variant="secondary">Verified</Badge>}
                    {b.featured && <Badge>Featured</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {b.status !== "approved" && (
                      <Button size="sm" onClick={() => update.mutate({ id: b.id, patch: { status: "approved" } })}>
                        Approve
                      </Button>
                    )}
                    {b.status === "approved" && (
                      <Button size="sm" variant="outline" onClick={() => update.mutate({ id: b.id, patch: { status: "pending" } })}>
                        Unpublish
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => update.mutate({ id: b.id, patch: { featured: !b.featured } })}>
                      {b.featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => update.mutate({ id: b.id, patch: { verified: !b.verified } })}>
                      {b.verified ? "Unverify" : "Verify"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Delete ${b.name}? This cannot be undone.`)) del.mutate(b.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

/* ---------------- Featured ---------------- */
function FeaturedPanel() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, slug, featured, rating, review_count")
        .eq("status", "approved")
        .order("featured", { ascending: false })
        .order("rating", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase.from("businesses").update({ featured }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "featured"] });
    },
    onError: (e: Error) => toast(e.message),
  });

  return (
    <section>
      <p className="mb-4 text-sm text-muted-foreground">
        Toggle which businesses appear in Featured spots across the homepage.
      </p>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Featured</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <Link to="/business/$slug" params={{ slug: b.slug }} className="font-medium hover:underline">
                    {b.name}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {b.rating?.toFixed(1) ?? "—"} · {b.review_count} reviews
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={!!b.featured}
                    onCheckedChange={(v) => toggle.mutate({ id: b.id, featured: v })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

/* ---------------- Verification Claims ---------------- */
function ClaimsPanel() {
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
    mutationFn: async ({ claimId, businessId, userId, approve }: {
      claimId: string; businessId: string; userId: string; approve: boolean;
    }) => {
      const { error: e1 } = await supabase.from("business_claims").update({ status: approve ? "approved" : "rejected" }).eq("id", claimId);
      if (e1) throw e1;
      if (approve) {
        const { error: e2 } = await supabase.from("businesses").update({ owner_id: userId, verified: true }).eq("id", businessId);
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
      <ul className="space-y-3">
        {data.length === 0 && (
          <li className="rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
            No verification requests yet.
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
                    <Link to="/business/$slug" params={{ slug: biz.slug }} className="font-medium hover:underline">
                      {biz.name}
                    </Link>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">User: {c.user_id.slice(0, 12)}…</div>
                  {c.message && <p className="mt-2 text-sm">{c.message}</p>}
                  {c.proof_url && (
                    <a href={c.proof_url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs underline underline-offset-4">
                      Proof: {c.proof_url}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{c.status}</Badge>
                  {c.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => decide.mutate({ claimId: c.id, businessId: c.business_id, userId: c.user_id, approve: true })}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => decide.mutate({ claimId: c.id, businessId: c.business_id, userId: c.user_id, approve: false })}>
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

/* ---------------- Reviews ---------------- */
function ReviewsPanel() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, title, body, status, created_at, business_id, businesses:business_id ( name, slug )")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast("Review deleted");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
  });

  return (
    <section>
      <ul className="space-y-3">
        {data.map((r) => {
          type Biz = { name: string; slug: string };
          const biz = (Array.isArray(r.businesses) ? r.businesses[0] : r.businesses) as Biz | null;
          return (
            <li key={r.id} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {biz && (
                    <Link to="/business/$slug" params={{ slug: biz.slug }} className="font-medium hover:underline">
                      {biz.name}
                    </Link>
                  )}
                  <div className="mt-0.5 text-xs text-muted-foreground">{r.rating}★ · {r.status}</div>
                  {r.title && <div className="mt-1 font-semibold">{r.title}</div>}
                  <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: r.id, status: r.status === "approved" ? "hidden" : "approved" })}>
                    {r.status === "approved" ? "Hide" : "Restore"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete this review?")) del.mutate(r.id); }}>
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------------- Reports ---------------- */
function ReportsPanel() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("open");
  const { data = [] } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, reason, details, status, created_at, user_id, business_id, businesses:business_id ( name, slug )")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("reports").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reports"] }),
  });

  const filtered = data.filter((r) => filter === "all" || r.status === filter);

  return (
    <section>
      <div className="mb-4 flex gap-1">
        {["open", "resolved", "dismissed", "all"].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="capitalize">
            {s}
          </Button>
        ))}
      </div>
      <ul className="space-y-3">
        {filtered.length === 0 && (
          <li className="rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">Nothing here.</li>
        )}
        {filtered.map((r) => {
          type Biz = { name: string; slug: string };
          const biz = (Array.isArray(r.businesses) ? r.businesses[0] : r.businesses) as Biz | null;
          return (
            <li key={r.id} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  {biz && (
                    <Link to="/business/$slug" params={{ slug: biz.slug }} className="font-medium hover:underline">
                      {biz.name}
                    </Link>
                  )}
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    <Badge variant="outline" className="capitalize mr-2">{r.reason.replace(/_/g, " ")}</Badge>
                    <Badge variant="outline" className="capitalize">{r.status}</Badge>
                  </div>
                  {r.details && <p className="mt-2 text-sm">{r.details}</p>}
                </div>
                <div className="flex gap-1">
                  {r.status === "open" && (
                    <>
                      <Button size="sm" onClick={() => setStatus.mutate({ id: r.id, status: "resolved" })}>Resolve</Button>
                      <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: r.id, status: "dismissed" })}>Dismiss</Button>
                    </>
                  )}
                  {r.status !== "open" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: r.id, status: "open" })}>Reopen</Button>
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

/* ---------------- Categories ---------------- */
function CategoriesPanel() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", slug: "", icon: "", sort_order: 0 });
  const { data = [] } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("categories").insert({
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
        icon: form.icon || null,
        sort_order: form.sort_order,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast("Category created");
      setForm({ name: "", slug: "", icon: "", sort_order: 0 });
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (e: Error) => toast(e.message),
  });

  type CatPatch = { name?: string; slug?: string; icon?: string | null; sort_order?: number };
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: CatPatch }) => {
      const { error } = await supabase.from("categories").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
    onError: (e: Error) => toast(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
    onError: (e: Error) => toast(e.message),
  });

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h3 className="font-medium mb-3">Add category</h3>
        <div className="grid gap-2 sm:grid-cols-4">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input placeholder="icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <Input placeholder="sort" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
        </div>
        <Button className="mt-3" disabled={!form.name} onClick={() => create.mutate()}>Create</Button>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Sort</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Input defaultValue={c.name} onBlur={(e) => e.target.value !== c.name && update.mutate({ id: c.id, patch: { name: e.target.value } })} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.slug}</TableCell>
                <TableCell>
                  <Input className="w-16" defaultValue={c.icon ?? ""} onBlur={(e) => e.target.value !== (c.icon ?? "") && update.mutate({ id: c.id, patch: { icon: e.target.value || null } })} />
                </TableCell>
                <TableCell>
                  <Input className="w-20" type="number" defaultValue={c.sort_order} onBlur={(e) => Number(e.target.value) !== c.sort_order && update.mutate({ id: c.id, patch: { sort_order: Number(e.target.value) } })} />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete category "${c.name}"?`)) del.mutate(c.id); }}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

/* ---------------- Cities ---------------- */
function CitiesPanel() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", slug: "" });
  const { data = [] } = useQuery({
    queryKey: ["admin", "cities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cities").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cities").insert({
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast("City created");
      setForm({ name: "", slug: "" });
      qc.invalidateQueries({ queryKey: ["admin", "cities"] });
    },
    onError: (e: Error) => toast(e.message),
  });

  type CityPatch = { name?: string; slug?: string };
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: CityPatch }) => {
      const { error } = await supabase.from("cities").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cities"] }),
    onError: (e: Error) => toast(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cities"] }),
    onError: (e: Error) => toast(e.message),
  });

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h3 className="font-medium mb-3">Add city</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </div>
        <Button className="mt-3" disabled={!form.name} onClick={() => create.mutate()}>Create</Button>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Input defaultValue={c.name} onBlur={(e) => e.target.value !== c.name && update.mutate({ id: c.id, patch: { name: e.target.value } })} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete "${c.name}"?`)) del.mutate(c.id); }}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

/* ---------------- Homepage Sections ---------------- */
type HomepageSection = {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  section_type: string;
  business_ids: string[];
  category_slug: string | null;
  city_slug: string | null;
  sort_order: number;
  enabled: boolean;
};

function HomepagePanel() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const [creating, setCreating] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["admin", "homepage"],
    queryFn: async () => {
      const { data, error } = await supabase.from("homepage_sections").select("*").order("sort_order");
      if (error) throw error;
      return data as HomepageSection[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homepage_sections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "homepage"] }),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from("homepage_sections").update({ enabled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "homepage"] }),
  });

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Curate the homepage. Each section renders as a titled block on the homepage.</p>
        <Button onClick={() => setCreating(true)}>Add section</Button>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Filter</TableHead>
              <TableHead>Sort</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">No sections yet.</TableCell></TableRow>
            )}
            {data.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.key}</div>
                </TableCell>
                <TableCell><Badge variant="outline">{s.section_type}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {s.category_slug && <div>cat: {s.category_slug}</div>}
                  {s.city_slug && <div>city: {s.city_slug}</div>}
                  {s.business_ids.length > 0 && <div>{s.business_ids.length} pinned</div>}
                </TableCell>
                <TableCell>{s.sort_order}</TableCell>
                <TableCell>
                  <Switch checked={s.enabled} onCheckedChange={(v) => toggle.mutate({ id: s.id, enabled: v })} />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setEditing(s)}>Edit</Button>
                  <Button size="sm" variant="outline" className="ml-1" onClick={() => { if (confirm(`Delete "${s.title}"?`)) del.mutate(s.id); }}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {(creating || editing) && (
        <HomepageSectionDialog
          section={editing}
          open={true}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["admin", "homepage"] }); setEditing(null); setCreating(false); }}
        />
      )}
    </section>
  );
}

function HomepageSectionDialog({
  section, open, onClose, onSaved,
}: {
  section: HomepageSection | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    key: section?.key ?? "",
    title: section?.title ?? "",
    subtitle: section?.subtitle ?? "",
    section_type: section?.section_type ?? "featured",
    business_ids: (section?.business_ids ?? []).join(","),
    category_slug: section?.category_slug ?? "",
    city_slug: section?.city_slug ?? "",
    sort_order: section?.sort_order ?? 0,
    enabled: section?.enabled ?? true,
  });

  const save = async () => {
    const payload = {
      key: form.key || form.title.toLowerCase().replace(/\s+/g, "-"),
      title: form.title,
      subtitle: form.subtitle || null,
      section_type: form.section_type,
      business_ids: form.business_ids.split(",").map((s) => s.trim()).filter(Boolean),
      category_slug: form.category_slug || null,
      city_slug: form.city_slug || null,
      sort_order: form.sort_order,
      enabled: form.enabled,
    };
    const { error } = section
      ? await supabase.from("homepage_sections").update(payload).eq("id", section.id)
      : await supabase.from("homepage_sections").insert(payload);
    if (error) { toast(error.message); return; }
    toast("Saved");
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{section ? "Edit section" : "New section"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="Key (slug, optional)" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} />
          <Textarea placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-muted-foreground">Type
              <select
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={form.section_type}
                onChange={(e) => setForm({ ...form, section_type: e.target.value })}
              >
                <option value="featured">featured</option>
                <option value="recent">recent</option>
                <option value="top_rated">top_rated</option>
                <option value="category">category</option>
                <option value="city">city</option>
                <option value="pinned">pinned</option>
              </select>
            </label>
            <label className="text-xs text-muted-foreground">Sort order
              <Input type="number" className="mt-1" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </label>
          </div>
          <Input placeholder="Category slug (optional)" value={form.category_slug} onChange={(e) => setForm({ ...form, category_slug: e.target.value })} />
          <Input placeholder="City slug (optional)" value={form.city_slug} onChange={(e) => setForm({ ...form, city_slug: e.target.value })} />
          <Textarea placeholder="Pinned business IDs (comma-separated)" value={form.business_ids} onChange={(e) => setForm({ ...form, business_ids: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
            Enabled
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!form.title} onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
