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
  Instagram,
  MessageCircle,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  businessBySlugQuery,
  staffByBusinessQuery,
  nearbyBusinessesQuery,
  isOpenNow,
} from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ReviewsSection } from "@/components/reviews-section";
import { ClaimBusinessDialog } from "@/components/claim-business-dialog";
import { BusinessCard } from "@/components/business-card";
import { trackEvent } from "@/lib/track";

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
        { title: `${b.name} — Connect Korea Guide` },
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

const DAYS: Array<{ key: string; label: string }> = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

type HoursEntry = {
  open?: string;
  close?: string;
  closed?: boolean;
  lunch_start?: string;
  lunch_end?: string;
};

type PricingItem = { service?: string; price?: string };
type FaqItem = { question?: string; answer?: string };

function BusinessDetail() {
  const { slug } = Route.useParams();
  const { data: b } = useQuery(businessBySlugQuery(slug));
  const { user } = useAuth();
  const qc = useQueryClient();
  const [isFav, setIsFav] = useState(false);

  const { data: staff = [] } = useQuery(staffByBusinessQuery(b?.id));
  const { data: nearby = [] } = useQuery({
    ...nearbyBusinessesQuery({
      businessId: b?.id ?? "",
      categoryId: b?.category_id ?? null,
      cityId: b?.city_id ?? null,
    }),
    enabled: !!b?.id,
  });

  useEffect(() => {
    if (b?.id) trackEvent(b.id, "profile_visit");
  }, [b?.id]);

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

  const hours = (b.hours ?? {}) as Record<string, HoursEntry | undefined>;
  const pricing = Array.isArray(b.pricing) ? (b.pricing as PricingItem[]) : [];
  const faqs = Array.isArray(b.faqs) ? (b.faqs as FaqItem[]) : [];
  const videos = (b.videos ?? []) as string[];
  const photos = (b.photos ?? []) as string[];
  const open = isOpenNow(b.hours);
  const naverUrl = b.address
    ? `https://map.naver.com/v5/search/${encodeURIComponent(b.address)}`
    : null;
  const googleUrl =
    b.google_maps_url ??
    (b.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}` : null);
  const instagramUrl = b.instagram
    ? b.instagram.startsWith("http")
      ? b.instagram
      : `https://instagram.com/${b.instagram.replace(/^@/, "")}`
    : null;

  return (
    <div>
      {/* Cover */}
      <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden bg-muted sm:h-[52vh]">
        {b.cover_image && (
          <img src={b.cover_image} alt={b.name} className="h-full w-full object-cover" />
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
            <div className="flex min-w-0 flex-1 items-start gap-5">
              {b.logo && (
                <img
                  src={b.logo}
                  alt={`${b.name} logo`}
                  className="h-20 w-20 shrink-0 rounded-2xl border border-border/60 bg-background object-cover shadow-sm"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {b.categories?.name && <span>{b.categories.name}</span>}
                  {b.districts?.name && (
                    <>
                      <span>·</span>
                      <span>
                        {b.districts.name}, {b.cities?.name}
                      </span>
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
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      open
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" /> {open ? "Open now" : "Closed"}
                  </span>
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
          <div className="space-y-12">
            {/* About */}
            <section>
              <h2 className="text-display text-3xl">About</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground/85">
                {b.description || "No description yet."}
              </p>
              {b.languages.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Languages spoken
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {b.languages.map((l) => (
                      <Badge key={l} variant="outline" className="h-6 rounded-sm px-2 text-xs">
                        {l}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Gallery */}
            {(photos.length > 0 || videos.length > 0) && (
              <section>
                <h2 className="text-display text-3xl">Gallery</h2>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {photos.map((p, i) => (
                    <a
                      key={`p-${i}`}
                      href={p}
                      target="_blank"
                      rel="noreferrer"
                      className="aspect-square overflow-hidden rounded-lg bg-muted"
                    >
                      <img
                        src={p}
                        alt={`${b.name} photo ${i + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </a>
                  ))}
                  {videos.map((v, i) => (
                    <a
                      key={`v-${i}`}
                      href={v}
                      target="_blank"
                      rel="noreferrer"
                      className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-muted"
                    >
                      <video src={v} className="h-full w-full object-cover" muted preload="metadata" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-8 w-8 fill-white text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Services */}
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

            {/* Pricing */}
            {pricing.length > 0 && (
              <section>
                <h2 className="text-display text-3xl">Pricing</h2>
                <div className="mt-4 divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
                  {pricing.map((row, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm">{row.service}</span>
                      <span className="text-sm font-medium">{row.price}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Prices are indicative and may vary. Please confirm with the business.
                </p>
              </section>
            )}

            {/* Staff */}
            {staff.length > 0 && (
              <section>
                <h2 className="text-display text-3xl">Staff</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {staff.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4"
                    >
                      {s.photo ? (
                        <img
                          src={s.photo}
                          alt={s.name}
                          className="h-14 w-14 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                          {s.name.slice(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium">{s.name}</p>
                        {s.position && (
                          <p className="text-sm text-muted-foreground">{s.position}</p>
                        )}
                        {s.languages && s.languages.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {s.languages.map((l: string) => (
                              <Badge
                                key={l}
                                variant="outline"
                                className="h-5 rounded-sm px-1.5 text-[10px]"
                              >
                                {l}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
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

            {/* Reviews */}
            <ReviewsSection businessId={b.id} isOwner={!!user && b.owner_id === user.id} />

            {/* FAQ */}
            {faqs.length > 0 && (
              <section>
                <h2 className="text-display text-3xl">FAQ</h2>
                <div className="mt-4 space-y-3">
                  {faqs.map((f, i) => (
                    <details
                      key={i}
                      className="group rounded-xl border border-border/60 bg-card p-4"
                    >
                      <summary className="cursor-pointer list-none font-medium">
                        {f.question}
                      </summary>
                      <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                        {f.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Contact */}
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
                {b.email && (
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <a href={`mailto:${b.email}`} className="hover:underline">
                      {b.email}
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
                {instagramUrl && (
                  <li className="flex items-start gap-3">
                    <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {b.instagram}
                    </a>
                  </li>
                )}
                {b.kakao_id && (
                  <li className="flex items-start gap-3">
                    <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <a
                      href={`https://pf.kakao.com/${b.kakao_id.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      KakaoTalk: {b.kakao_id}
                    </a>
                  </li>
                )}
              </ul>
              {(naverUrl || googleUrl) && (
                <div className="mt-4 grid gap-2">
                  {naverUrl && (
                    <a
                      href={naverUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-lg border border-border/60 bg-muted px-3 py-2 text-sm font-medium transition hover:border-foreground/40"
                    >
                      <MapPin className="mr-2 h-4 w-4" /> Open in Naver Map
                    </a>
                  )}
                  {googleUrl && (
                    <a
                      href={googleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-lg border border-border/60 bg-muted px-3 py-2 text-sm font-medium transition hover:border-foreground/40"
                    >
                      <MapPin className="mr-2 h-4 w-4" /> Open in Google Maps
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Hours */}
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h3 className="flex items-center gap-2 text-display text-xl">
                <Clock className="h-4 w-4" /> Business hours
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                {DAYS.map(({ key, label }) => {
                  const h = hours[key];
                  const closed = !h || h.closed || !h.open || !h.close;
                  return (
                    <li key={key} className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">{label}</span>
                      {closed ? (
                        <span className="text-muted-foreground">Closed</span>
                      ) : (
                        <span className="text-right">
                          {h!.open}–{h!.close}
                          {h!.lunch_start && h!.lunch_end && (
                            <span className="block text-xs text-muted-foreground">
                              Lunch {h!.lunch_start}–{h!.lunch_end}
                            </span>
                          )}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {b.holiday_notice && (
                <div className="mt-4 rounded-lg border border-dashed border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Holiday notice: </span>
                  {b.holiday_notice}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Nearby */}
        {nearby.length > 0 && (
          <section className="mt-16">
            <div className="flex items-end justify-between">
              <h2 className="text-display text-3xl">Nearby & similar</h2>
              <Link to="/browse" className="text-sm underline underline-offset-4">
                See more
              </Link>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {nearby.map((n) => (
                <BusinessCard key={n.id} business={n} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
