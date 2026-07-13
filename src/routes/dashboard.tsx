import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import {
  Star,
  Eye,
  Users,
  Globe,
  Phone,
  MessageSquare,
  Calendar,
  MessageCircle,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard — Connect Korea Guide" },
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
      <p className="mt-2 text-muted-foreground">
        Track your listings, reviews, messages and appointment requests.
      </p>

      <div className="mt-12">
        <MyBusinesses userId={user.id} />
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <MyClaims userId={user.id} />
        <MyReviews userId={user.id} />
      </div>
    </div>
  );
}

type OwnedBusiness = {
  id: string;
  name: string;
  slug: string;
  status: string;
  rating: number;
  review_count: number;
};

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
      return data as OwnedBusiness[];
    },
  });

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-display text-3xl">Your businesses</h2>
        <Link
          to="/register-business"
          className="inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm hover:bg-accent"
        >
          + List a new business
        </Link>
      </div>
      {data.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
          You don't own any listings yet.{" "}
          <Link to="/register-business" className="underline">List your business</Link>, or find an existing one and click "Claim".
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {data.map((b) => (
            <BusinessDashboardCard key={b.id} business={b} />
          ))}
        </div>
      )}
    </section>
  );
}

function BusinessDashboardCard({ business: b }: { business: OwnedBusiness }) {
  const { data: metrics } = useQuery({
    queryKey: ["dashboard", "metrics", b.id],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from("business_events")
        .select("event_type, user_id")
        .eq("business_id", b.id);
      if (error) throw error;

      let views = 0;
      let websiteClicks = 0;
      let phoneClicks = 0;
      const visitors = new Set<string>();
      for (const e of events ?? []) {
        if (e.event_type === "profile_visit") {
          views += 1;
          visitors.add(e.user_id ?? `anon-${views}`);
        }
        if (e.event_type === "website_click") websiteClicks += 1;
        if (e.event_type === "phone_click") phoneClicks += 1;
      }

      const [{ count: unreadMessages }, { count: pendingAppts }] = await Promise.all([
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("business_id", b.id)
          .is("read_at", null),
        supabase
          .from("appointment_requests")
          .select("id", { count: "exact", head: true })
          .eq("business_id", b.id)
          .eq("status", "pending"),
      ]);

      return {
        views,
        profileVisits: visitors.size,
        websiteClicks,
        phoneClicks,
        unreadMessages: unreadMessages ?? 0,
        pendingAppts: pendingAppts ?? 0,
      };
    },
  });

  const m = metrics ?? {
    views: 0,
    profileVisits: 0,
    websiteClicks: 0,
    phoneClicks: 0,
    unreadMessages: 0,
    pendingAppts: 0,
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/business/$slug"
            params={{ slug: b.slug }}
            className="text-display text-2xl hover:underline"
          >
            {b.name}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="capitalize">
              {b.status}
            </Badge>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-foreground" />
              {Number(b.rating).toFixed(1)} avg
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Eye} label="Total views" value={m.views} />
        <Stat icon={Users} label="Profile visits" value={m.profileVisits} />
        <Stat icon={Globe} label="Website clicks" value={m.websiteClicks} />
        <Stat icon={Phone} label="Phone clicks" value={m.phoneClicks} />
        <Stat icon={Star} label="Reviews" value={b.review_count} />
        <Stat icon={Star} label="Avg rating" value={Number(b.rating).toFixed(1)} />
        <Stat
          icon={MessageSquare}
          label="Unread messages"
          value={m.unreadMessages}
          highlight={m.unreadMessages > 0}
        />
        <Stat
          icon={Calendar}
          label="Appointment requests"
          value={m.pendingAppts}
          hint="Coming soon"
          highlight={m.pendingAppts > 0}
        />
      </div>

      <div className="mt-6">
        <MessagesInbox businessId={b.id} />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-foreground/40 bg-secondary" : "border-border/60 bg-background"
      }`}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{hint}</div>}
    </div>
  );
}

function MessagesInbox({ businessId }: { businessId: string }) {
  const { data = [], refetch } = useQuery({
    queryKey: ["dashboard", "messages", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_name, sender_email, body, read_at, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (data.length === 0) {
    return (
      <details className="group rounded-xl border border-dashed border-border/60 px-4 py-3 text-sm">
        <summary className="cursor-pointer text-muted-foreground">Messages inbox (0)</summary>
        <p className="mt-2 text-xs text-muted-foreground">No messages yet.</p>
      </details>
    );
  }

  const markRead = async (id: string) => {
    await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", id);
    refetch();
  };

  return (
    <details className="rounded-xl border border-border/60 bg-background">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
        <MessageCircle className="mr-1.5 inline h-4 w-4" /> Messages inbox ({data.length})
      </summary>
      <ul className="divide-y divide-border/60">
        {data.map((msg) => (
          <li key={msg.id} className="px-4 py-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {msg.sender_name || msg.sender_email || "Anonymous"}
              </span>
              <span>{new Date(msg.created_at).toLocaleDateString()}</span>
            </div>
            <p className="mt-1 whitespace-pre-line text-sm">{msg.body}</p>
            {!msg.read_at && (
              <button
                type="button"
                onClick={() => markRead(msg.id)}
                className="mt-2 text-xs underline underline-offset-4"
              >
                Mark as read
              </button>
            )}
          </li>
        ))}
      </ul>
    </details>
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
