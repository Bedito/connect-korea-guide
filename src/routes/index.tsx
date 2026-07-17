import seoulImg from "@/assets/seoul.jpg";
import busanImg from "@/assets/busan.jpg";
import daejeonImg from "@/assets/daejon.jpg";
import gwangjuImg from "@/assets/gwangju.jpg";
import jejuImg from "@/assets/jeju.jpg";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  MapPin,
  Star,
  BadgeCheck,
  ShieldCheck,
  Languages,
  Sparkles,
  Bookmark,
  Clock,
  Stethoscope,
  Scale,
  Home,
  Calculator,
  Scissors,
  GraduationCap,
  Car,
  Smile as ToothIcon,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusinessCard } from "@/components/business-card";
import { SeoulSkyline } from "@/components/seoul-skyline";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOpenNow } from "@/hooks/use-open-now";
import { cn } from "@/lib/utils";
import {
  categoriesQuery,
  citiesQuery,
  cityCountsQuery,
  featuredBusinessesQuery,
  recentBusinessesQuery,
  topRatedBusinessesQuery,
} from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "친구Base — Trusted English-Friendly Services in Korea" },
      {
        name: "description",
        content:
          "친구Base connects foreigners in Korea with trusted, English-friendly doctors, dentists, real estate agents, lawyers, salons and more. Verified listings, real reviews.",
      },
      { property: "og:title", content: "친구Base — Trusted English-Friendly Services in Korea" },
      {
        property: "og:description",
        content:
          "친구Base connects foreigners in Korea with trusted, English-friendly doctors, dentists, real estate agents, lawyers, salons and more. Verified listings, real reviews.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://connect-korea-guide.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://connect-korea-guide.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "친구Base",
              alternateName: "ChinguBase",
              url: "https://connect-korea-guide.lovable.app/",
              logo: "https://connect-korea-guide.lovable.app/apple-touch-icon.png",
            },
            {
              "@type": "WebSite",
              name: "친구Base",
              url: "https://connect-korea-guide.lovable.app/",
              description:
                "The verified directory for foreigners in Korea — trusted, English-friendly local services.",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://connect-korea-guide.lovable.app/browse?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: HomePage,
});

const POPULAR_CATEGORIES: { labelKey: string; slug: string; icon: LucideIcon }[] = [
  { labelKey: "categories.medical", slug: "doctors", icon: Stethoscope },
  { labelKey: "categories.dental", slug: "dentists", icon: ToothIcon },
  { labelKey: "categories.legal", slug: "lawyers", icon: Scale },
  { labelKey: "categories.realEstate", slug: "real-estate", icon: Home },
  { labelKey: "categories.accounting", slug: "accountants", icon: Calculator },
  { labelKey: "categories.beauty", slug: "beauty", icon: Scissors },
  { labelKey: "categories.education", slug: "schools", icon: GraduationCap },
  { labelKey: "categories.automotive", slug: "auto-repair", icon: Car },
];

const POPULAR_CHIP_KEYS = [
  "home.chips.dentistGangnam",
  "home.chips.realEstateHongdae",
  "home.chips.immigrationLawyer",
  "home.chips.vetBusan",
  "home.chips.internationalSchool",
];

function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  const categories = useQuery(categoriesQuery);
  const cities = useQuery(citiesQuery);
  const cityCounts = useQuery(cityCountsQuery);
  const featured = useQuery(featuredBusinessesQuery);
  const recent = useQuery(recentBusinessesQuery);
  const topRated = useQuery(topRatedBusinessesQuery);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/browse",
      search: {
        q: q || undefined,
        city: city || undefined,
      },
    });
  };

  const featuredList = featured.data?.slice(0, 6) ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.06] via-background to-background"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[280px] opacity-70"
          aria-hidden
        >
          <SeoulSkyline className="h-full w-full" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-40 pt-20 sm:px-6 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("home.trustBadge")}
            </span>

            <h1 className="mt-8 font-display text-5xl font-bold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-6xl md:text-[5.5rem]">
              {t("home.headlineA")}
              <br />
              {t("home.headlineB")} <span className="text-primary">{t("home.headlineC")}</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {t("home.subtitle")}
            </p>

            {/* Floating Airbnb-style search box */}
            <form
              onSubmit={onSearch}
              className="mx-auto mt-12 flex max-w-3xl flex-col items-stretch gap-1 rounded-[22px] border border-border/70 bg-card/95 p-2 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.25),0_8px_24px_-12px_rgba(15,23,42,0.12)] backdrop-blur-md ring-1 ring-black/[0.02] md:flex-row md:items-center md:rounded-full md:p-2"
            >
              <div className="flex flex-1 items-center gap-3 rounded-[18px] px-5 py-2 transition hover:bg-muted/50 md:rounded-full">
                <Search className="h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1 text-left">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground/70">
                    {t("home.searchLabel")}
                  </label>
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("home.searchPlaceholder")}
                    className="h-6 border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
                    aria-label={t("home.searchLabel")}
                  />
                </div>
              </div>

              <div className="hidden h-10 w-px bg-border md:block" />

              <div className="flex flex-1 items-center gap-3 rounded-[18px] px-5 py-2 transition hover:bg-muted/50 md:rounded-full">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1 text-left">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground/70">
                    {t("home.locationLabel")}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-6 w-full bg-transparent text-sm text-foreground outline-none"
                    aria-label={t("home.locationLabel")}
                  >
                    <option value="">{t("home.anywhere")}</option>
                    {cities.data?.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-14 gap-2 rounded-[18px] px-8 text-base font-semibold shadow-brand-glow md:rounded-full"
              >
                <Search className="h-4 w-4" />
                {t("home.searchBtn")}
              </Button>
            </form>

            {/* Popular chips */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("home.popular")}
              </span>
              {POPULAR_CHIP_KEYS.map((key) => {
                const label = t(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => navigate({ to: "/browse", search: { q: label } })}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-md"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("home.browseEyebrow")}
          title={t("home.browseTitle")}
          description={t("home.browseDesc")}
        />

        <div className="mt-14 grid auto-rows-fr grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {POPULAR_CATEGORIES.map((cat) => {
            const label = t(cat.labelKey);
            return (
              <Link
                key={cat.slug}
                to="/browse"
                search={{ category: cat.slug }}
                className="group relative flex h-full flex-col rounded-[18px] border border-border/70 bg-card p-5 pr-10 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-20px_rgba(37,99,235,0.25)] sm:flex-row sm:items-center sm:gap-5 sm:p-6"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground sm:h-14 sm:w-14">
                  <cat.icon strokeWidth={1.5} className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
                <div className="mt-3 min-w-0 flex-1 sm:mt-0">
                  <div className="font-display text-base font-semibold leading-tight tracking-tight text-foreground break-words sm:text-lg">
                    {label}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground break-words">
                    {t("home.explore")} {label.toLowerCase()}
                  </div>
                </div>
                <ArrowUpRight className="absolute right-4 top-4 h-5 w-5 shrink-0 text-muted-foreground/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary sm:static" />
              </Link>
            );
          })}

          <Link
            to="/browse"
            className="group relative flex h-full flex-col rounded-[18px] border border-dashed border-border bg-transparent p-5 pr-10 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-[0_20px_40px_-20px_rgba(37,99,235,0.25)] sm:flex-row sm:items-center sm:gap-5 sm:p-6"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary sm:h-14 sm:w-14">
              <MoreHorizontal strokeWidth={1.5} className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <div className="mt-3 min-w-0 flex-1 sm:mt-0">
              <div className="font-display text-base font-semibold leading-tight tracking-tight text-foreground break-words sm:text-lg">
                {t("home.more")}
              </div>
              <div className="mt-1 text-xs text-muted-foreground break-words">
                {t("home.seeAllCategories")}
              </div>
            </div>
            <ArrowUpRight className="absolute right-4 top-4 h-5 w-5 shrink-0 text-muted-foreground/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary sm:static" />
          </Link>
        </div>
      </section>


      {/* Featured — premium cards */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("home.featuredEyebrow")}
          title={t("home.featuredTitle")}
          description={t("home.featuredDesc")}
          action={{ label: t("home.exploreAll"), to: "/browse" }}
        />
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredList.map((b) => (
            <PremiumBusinessCard key={b.id} business={b as never} />
          ))}
        </div>
      </section>

      {/* Recently added */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t("home.newEyebrow")} title={t("home.newTitle")} />
        <div className="mt-12 grid auto-rows-fr gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {recent.data?.slice(0, 4).map((b) => (
            <BusinessCard key={b.id} business={b as never} />
          ))}
        </div>
      </section>

      {/* Top Rated */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("home.topEyebrow")}
          title={t("home.topTitle")}
          action={{ label: t("home.seeAll"), to: "/browse" }}
        />
        <div className="mt-12 grid auto-rows-fr gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {topRated.data?.slice(0, 4).map((b) => (
            <BusinessCard key={b.id} business={b as never} />
          ))}
        </div>
      </section>

      {/* Browse by City */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t("home.locationsEyebrow")} title={t("home.locationsTitle")} />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cityCounts.data?.map((c, i) => (
            <Link
              key={c.id}
              to="/browse"
              search={{ city: c.slug }}
              className="group relative overflow-hidden rounded-[18px] border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(37,99,235,0.25)]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={CITY_IMAGES[c.slug] ?? CITY_FALLBACKS[i % CITY_FALLBACKS.length]}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between p-5">
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">{c.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.count} {c.count === 1 ? t("home.listing") : t("home.listings")}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-[24px] border border-border bg-card p-10 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <span className="text-eyebrow">{t("home.whyEyebrow")}</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-5xl">
              {t("home.whyTitle")}
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              {t("home.whyDesc")}
            </p>
            <Link
              to="/browse"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
            >
              {t("home.startBrowsing")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {WHY_ITEMS.map((item) => (
              <div
                key={item.titleKey}
                className="rounded-[18px] border border-border bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-20px_rgba(37,99,235,0.2)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                  <item.icon strokeWidth={1.5} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
                  {t(item.titleKey)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t(item.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[24px] bg-foreground text-background">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.6), transparent 45%), radial-gradient(circle at 80% 60%, rgba(37, 99, 235, 0.5), transparent 45%)",
            }}
            aria-hidden
          />
          <div className="relative grid gap-8 p-10 sm:p-14 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-background/20 bg-background/10 px-2.5 py-1 text-xs font-medium backdrop-blur">
                <Sparkles className="h-3 w-3" /> {t("home.ctaTag")}
              </span>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-5xl">
                {t("home.ctaTitle")}
              </h2>
              <p className="mt-4 max-w-lg text-background/70">
                {t("home.ctaDesc")}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end">
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground shadow-brand-glow hover:bg-primary-hover sm:w-auto"
                >
                  {t("home.listBusiness")}
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full text-background hover:bg-background/10 sm:w-auto"
                >
                  {t("home.businessDashboard")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        <span className="text-eyebrow">{eyebrow}</span>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          to={action.to}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          {action.label} <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

/** Premium featured business card */
function PremiumBusinessCard({
  business,
}: {
  business: {
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    cover_image: string | null;
    logo: string | null;
    address: string | null;
    hours: unknown;
    rating: number;
    review_count: number;
    verified: boolean;
    languages: string[];
    categories?: { name: string } | null;
    cities?: { name: string } | null;
    districts?: { name: string } | null;
  };
}) {
  const { t } = useTranslation();
  const open = useOpenNow(business.hours);
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const hasEnglish = business.languages?.some((l) =>
    l.toLowerCase().includes("english") || l.toLowerCase() === "en",
  );

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast(t("business.signInToSave"));
      return;
    }
    if (saved) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("business_id", business.id);
      setSaved(false);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, business_id: business.id });
      setSaved(true);
      toast.success(t("business.saved"));
    }
    qc.invalidateQueries({ queryKey: ["favorites"] });
  };

  const location = [business.districts?.name, business.cities?.name].filter(Boolean).join(", ") ||
    business.address;

  return (
    <Link
      to="/business/$slug"
      params={{ slug: business.slug }}
      className="group relative flex flex-col overflow-hidden rounded-[18px] border border-border/70 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-[0_28px_60px_-24px_rgba(37,99,235,0.28),0_10px_24px_-16px_rgba(15,23,42,0.15)]"
    >
      {/* Cover */}
      <div className="relative aspect-[16/11] overflow-hidden bg-muted">
        {business.cover_image ? (
          <img
            src={business.cover_image}
            alt={business.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            {t("business.noImage")}
          </div>
        )}

        {/* Verified badge */}
        {business.verified && (
          <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5" />
            {t("business.verified")}
          </div>
        )}

        {/* Bookmark */}
        <button
          type="button"
          onClick={toggleSave}
          aria-label={saved ? t("business.removeBookmark") : t("business.save")}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm backdrop-blur transition-all duration-200 hover:scale-110 hover:text-primary"
        >
          <Bookmark
            className={cn("h-4 w-4 transition", saved && "fill-primary text-primary")}
            strokeWidth={1.75}
          />
        </button>

        {/* Logo overlay */}
        {business.logo && (
          <div className="absolute -bottom-5 left-5 h-14 w-14 overflow-hidden rounded-2xl border-2 border-background bg-background shadow-[0_8px_20px_-8px_rgba(15,23,42,0.25)]">
            <img
              src={business.logo}
              alt={`${business.name} logo`}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Body */}
      <div className={cn("flex flex-1 flex-col gap-3 p-6", business.logo && "pt-8")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {business.categories?.name && (
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {business.categories.name}
              </div>
            )}
            <h3 className="mt-1 font-display text-xl font-semibold leading-tight tracking-tight text-foreground group-hover:text-primary">
              {business.name}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="font-semibold">{business.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({business.review_count})</span>
          </div>
        </div>

        {business.tagline && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {business.tagline}
          </p>
        )}

        {/* Meta chips */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          {hasEnglish && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
              <Languages className="h-3 w-3" />
              {t("business.englishAvailable")}
            </span>
          )}
          {open !== null && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                open
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Clock className="h-3 w-3" />
              {open ? t("business.openNow") : t("business.closed")}
            </span>
          )}
        </div>

        {location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

const WHY_ITEMS = [
  { icon: Languages, titleKey: "home.why.englishTitle", descKey: "home.why.englishDesc" },
  { icon: BadgeCheck, titleKey: "home.why.verifiedTitle", descKey: "home.why.verifiedDesc" },
  { icon: Star, titleKey: "home.why.reviewsTitle", descKey: "home.why.reviewsDesc" },
  { icon: ShieldCheck, titleKey: "home.why.expatsTitle", descKey: "home.why.expatsDesc" },
] as const;

const CITY_IMAGES: Record<string, string> = {
  seoul: seoulImg,
  busan: busanImg,
  incheon: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
  daegu: "https://images.unsplash.com/photo-1546874177-9e664107314e?w=800&q=80",
  daejeon: daejeonImg,
  gwangju: gwangjuImg,
  jeju: jejuImg,
};

const CITY_FALLBACKS = [
  "https://images.unsplash.com/photo-1538485399081-7c8ed7d6f5df?w=800&q=80",
  "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=800&q=80",
  "https://images.unsplash.com/photo-1601733036253-f6a924e94918?w=800&q=80",
];
