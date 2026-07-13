import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Phone,
  Globe,
  Mail,
  Star,
  BadgeCheck,
  Heart,
  Share2,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { businessBySlugQuery } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ReviewsSection } from "@/components/reviews-section";
import { ClaimBusinessDialog } from "@/components/claim-business-dialog";

export const Route = createFileRoute("/business/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(businessBySlugQuery(params.slug));
    if (!data) throw notFound();
    return { business: data };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const b = loaderData.business;
    return {
      meta: [
        { title: `${b.name} — Seoul Compass` },
        { name: "description", content: b.tagline ?? b.description?.slice(0, 160) ?? "" },
        { property: "og:title", content: b.name },
        { property: "og:description", content: b.tagline ?? "" },
        ...(b.cover_image ? [{ property: "og:image", content: b.cover_image }] : []),
      ],
    };
  },
  component: BusinessDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-display text-5xl">Not found</h1>
      <p className="mt-3 text-muted-foreground">This business may have been removed.</p>
      <Link to="/browse" className="mt-6 inline-block underline underline-offset-4">
        Back to browse
      </Link>
    </div>
  ),
});

function BusinessDetail() {
  const { slug } = Route.useParams();
  const { data: b } = useQuery(businessBySlugQuery(slug));
  const { user } = useAuth();
  const qc = useQueryClient();
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (!user || !b) return;
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("business_id", b.id)
      .maybeSingle()
      .then(({ data }) => setIsFav(!!data));
  }, [user, b]);

  const toggleFav = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("not signed in");
      if (!b) return;
      if (isFav) {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("business_id", b.id);
        setIsFav(false);
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, business_id: b.id });
        setIsFav(true);
      }
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: () => {
      toast("Please sign in to save favorites.");
    },
  });

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: b?.name, url });
      } catch {
        /* dismissed */
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard");
    }
  };

  if (!b) return null;

  return (
    <div>
      {/* Cover */}
      <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden bg-muted sm:h-[52vh]">
        {b.cover_image && (
          <img
            src={b.cover_image}
            alt={b.name}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
        <div className="absolute left-0 top-0 p-4 sm:p-6">
          <Link to="/browse">
            <Button variant="secondary" size="sm" className="rounded-full">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Browse
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="-mt-24 rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {b.categories?.name && <span>{b.categories.name}</span>}
                {b.districts?.name && (
                  <>
                    <span>·</span>
                    <span>{b.districts.name}, {b.cities?.name}</span>
                  </>
                )}
              </div>
              <h1 className="text-display mt-2 text-5xl sm:text-6xl">{b.name}</h1>
              {b.tagline && (
                <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{b.tagline}</p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-foreground text-foreground" />
                  <span className="font-semibold">{b.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({b.review_count} reviews)
                  </span>
                </div>
                {b.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {b.languages.map((l) => (
                    <Badge key={l} variant="outline" className="h-6 rounded-sm px-1.5 text-[11px]">
                      {l}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleFav.mutate()}
                aria-label="Favorite"
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-foreground" : ""}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={share} aria-label="Share">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {!b.owner_id && (
            <div className="mt-6 flex items-center justify-between rounded-xl border border-dashed border-border/70 bg-muted/40 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Do you run this business?</span>
              <ClaimBusinessDialog businessId={b.id} businessName={b.name} />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-10">
            <section>
              <h2 className="text-display text-3xl">About</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground/85">
                {b.description || "No description yet."}
              </p>
            </section>

            {b.services.length > 0 && (
              <section>
                <h2 className="text-display text-3xl">Services</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {b.services.map((s) => (
                    <Badge key={s} variant="secondary" className="h-8 rounded-full px-3 text-sm">
                      {s}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {b.amenities.length > 0 && (
              <section>
                <h2 className="text-display text-3xl">Good to know</h2>
                <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {b.amenities.map((a) => (
                    <li
                      key={a}
                      className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                      {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <ReviewsSection businessId={b.id} isOwner={!!user && b.owner_id === user.id} />
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h3 className="text-display text-xl">Contact & location</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {b.address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{b.address}</span>
                  </li>
                )}
                {b.phone && (
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <a href={`tel:${b.phone}`} className="hover:underline">
                      {b.phone}
                    </a>
                  </li>
                )}
                {b.website && (
                  <li className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <a
                      href={b.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all hover:underline"
                    >
                      {b.website.replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                )}
                {b.email && (
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <a href={`mailto:${b.email}`} className="hover:underline">
                      {b.email}
                    </a>
                  </li>
                )}
              </ul>
              {b.address && (
                <a
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(b.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex aspect-[4/3] items-center justify-center rounded-xl border border-border/60 bg-muted text-sm text-muted-foreground transition hover:border-foreground/40"
                >
                  <MapPin className="mr-2 h-4 w-4" /> Open in Naver Map
                </a>
              )}
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h3 className="flex items-center gap-2 text-display text-xl">
                <Clock className="h-4 w-4" /> Hours
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Business hours coming soon. Please contact the business to confirm availability.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
