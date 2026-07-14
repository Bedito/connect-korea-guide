import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusinessCard } from "@/components/business-card";
import {
  categoriesQuery,
  citiesQuery,
  cityCountsQuery,
  featuredBusinessesQuery,
  recentBusinessesQuery,
  topRatedBusinessesQuery,
} from "@/lib/queries";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
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
        category: category || undefined,
        city: city || undefined,
      },
    });
  };

  const featuredList = featured.data?.slice(0, 4) ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 grid-bg opacity-60" aria-hidden />
        <div
          className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-accent/50 via-background to-transparent"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur transition hover:border-primary/40 hover:text-foreground"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
              New · 500+ verified businesses across Korea
              <ArrowRight className="h-3 w-3" />
            </Link>

            <h1 className="mt-8 font-display text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-6xl md:text-[5rem]">
              The trusted directory
              <br />
              for foreigners in Korea.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Discover English-friendly doctors, real estate agents, lawyers, salons and more —
              verified, reviewed, and made for the international community.
            </p>

            {/* Search bar */}
            <form
              onSubmit={onSearch}
              className="mx-auto mt-10 grid max-w-3xl gap-1 rounded-2xl border border-border bg-card p-1.5 shadow-elevated md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center md:gap-0"
            >
              <div className="flex flex-1 items-center gap-2 rounded-xl px-3 md:rounded-none md:border-r md:border-border">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Business, service, or keyword"
                  className="h-11 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl px-3 md:rounded-none md:border-r md:border-border">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 w-full bg-transparent text-sm outline-none"
                  aria-label="Category"
                >
                  <option value="">All categories</option>
                  {categories.data?.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 rounded-xl px-3">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-11 w-full bg-transparent text-sm outline-none"
                  aria-label="City"
                >
                  <option value="">Anywhere</option>
                  {cities.data?.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-11 rounded-xl px-6 shadow-brand-glow md:ml-1"
              >
                Search
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
              <span className="opacity-80">Popular:</span>
              {["English dentist in Gangnam", "Real estate near Hongdae", "Vet in Busan"].map(
                (ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setQ(ex);
                      navigate({ to: "/browse", search: { q: ex } });
                    }}
                    className="rounded-full border border-border bg-card px-2.5 py-1 font-medium text-foreground/80 transition hover:border-primary/40 hover:text-foreground"
                  >
                    {ex}
                  </button>
                ),
              )}
            </div>

            {/* Trust stats */}
            <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card/60 py-4 text-center backdrop-blur">
              <Stat value="500+" label="Verified listings" />
              <Stat value="20+" label="Categories" />
              <Stat value="4.8★" label="Average rating" />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Browse"
          title="Explore categories"
          description="Every service you need, curated for the international community."
          action={{ label: "See all", to: "/browse" }}
        />

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.data?.map((cat) => (
            <Link
              key={cat.id}
              to="/browse"
              search={{ category: cat.slug }}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg transition group-hover:bg-primary/10">
                {categoryEmoji(cat.slug)}
              </span>
              <span className="text-sm font-semibold leading-tight text-foreground">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured — Bento */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Featured"
          title="Handpicked businesses"
          description="Editor-curated favorites across Korea, from independent studios to trusted specialists."
          action={{ label: "Explore all", to: "/browse" }}
        />
        {featuredList.length > 0 && (
          <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:grid-rows-2">
            <FeaturedHero business={featuredList[0]} />
            {featuredList[1] && (
              <div className="lg:col-start-2 lg:row-start-1">
                <BusinessCard business={featuredList[1] as never} />
              </div>
            )}
            {featuredList[2] && (
              <div className="lg:col-start-3 lg:row-start-1">
                <BusinessCard business={featuredList[2] as never} />
              </div>
            )}
            {featuredList[3] && (
              <div className="lg:col-span-2 lg:col-start-2 lg:row-start-2">
                <BusinessCard business={featuredList[3] as never} />
              </div>
            )}
          </div>
        )}

      </section>

      {/* Recently added */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="New" title="Recently added" />
        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {recent.data?.slice(0, 4).map((b) => (
            <BusinessCard key={b.id} business={b as never} />
          ))}
        </div>
      </section>

      {/* Top Rated */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Highest rated"
          title="Top rated in Korea"
          action={{ label: "See all", to: "/browse" }}
        />
        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {topRated.data?.slice(0, 4).map((b) => (
            <BusinessCard key={b.id} business={b as never} />
          ))}
        </div>
      </section>

      {/* Browse by City */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Locations" title="Browse by city" />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cityCounts.data?.map((c, i) => (
            <Link
              key={c.id}
              to="/browse"
              search={{ city: c.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={CITY_IMAGES[c.slug] ?? CITY_FALLBACKS[i % CITY_FALLBACKS.length]}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">{c.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.count} {c.count === 1 ? "listing" : "listings"}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why — Bento cards */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
            <span className="text-eyebrow">Why us</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-5xl">
              Built for the international community in Korea.
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Every listing is vetted for language access, transparency, and expat friendliness — so
              you can book with confidence.
            </p>
            <Link
              to="/browse"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
            >
              Start browsing <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {WHY_ITEMS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-foreground text-background">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.4), transparent 45%), radial-gradient(circle at 80% 60%, rgba(6, 182, 212, 0.35), transparent 45%)",
            }}
            aria-hidden
          />
          <div className="relative grid gap-8 p-10 sm:p-14 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-background/20 bg-background/10 px-2.5 py-1 text-xs font-medium backdrop-blur">
                <Sparkles className="h-3 w-3" /> For business owners
              </span>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-5xl">
                Get discovered by Korea's international community.
              </h2>
              <p className="mt-4 max-w-lg text-background/70">
                List your business, respond to reviews, and reach thousands of foreigners searching
                for English-friendly services every month.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end">
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground shadow-brand-glow hover:bg-primary-hover sm:w-auto"
                >
                  List your business
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full text-background hover:bg-background/10 sm:w-auto"
                >
                  Business dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-4">
      <div className="font-display text-2xl font-bold tracking-tight text-foreground">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
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

function FeaturedHero({
  business,
}: {
  business: {
    slug: string;
    name: string;
    tagline: string | null;
    cover_image: string | null;
    rating: number;
    review_count: number;
    verified: boolean;
    categories?: { name: string } | null;
    cities?: { name: string } | null;
  };
}) {
  return (
    <Link
      to="/business/$slug"
      params={{ slug: business.slug }}
      className="group relative flex overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-elevated lg:col-span-1 lg:row-span-2 lg:min-h-[520px]"
    >
      <div className="absolute inset-0 bg-muted">
        {business.cover_image && (
          <img
            src={business.cover_image}
            alt={business.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent opacity-90" />
      </div>
      <div className="relative mt-auto flex w-full flex-col gap-3 p-6 text-background sm:p-8">
        {business.verified && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-xs font-medium text-foreground">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
        )}
        <div className="text-xs uppercase tracking-widest text-background/70">
          {business.categories?.name}
          {business.cities?.name && ` · ${business.cities.name}`}
        </div>
        <h3 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {business.name}
        </h3>
        {business.tagline && (
          <p className="line-clamp-2 max-w-md text-sm text-background/80">{business.tagline}</p>
        )}
        <div className="mt-1 flex items-center gap-1.5 text-sm">
          <Star className="h-3.5 w-3.5 fill-background text-background" />
          <span className="font-semibold">{business.rating.toFixed(1)}</span>
          <span className="text-background/70">({business.review_count})</span>
        </div>
      </div>
    </Link>
  );
}

const WHY_ITEMS = [
  {
    icon: Languages,
    title: "English-friendly",
    description: "Every listing declares languages spoken so you know before you go.",
  },
  {
    icon: BadgeCheck,
    title: "Verified listings",
    description: "Businesses are vetted by our team before appearing on the platform.",
  },
  {
    icon: Star,
    title: "Real reviews",
    description: "Honest feedback from foreigners who've actually used the service.",
  },
  {
    icon: ShieldCheck,
    title: "Made for expats",
    description: "Built by the international community, for the international community.",
  },
] as const;

const CITY_IMAGES: Record<string, string> = {
  seoul: "https://images.unsplash.com/photo-1538485399081-7c8ed7d6f5df?w=800&q=80",
  busan: "https://images.unsplash.com/photo-1601733036253-f6a924e94918?w=800&q=80",
  incheon: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
  daegu: "https://images.unsplash.com/photo-1546874177-9e664107314e?w=800&q=80",
  daejeon: "https://images.unsplash.com/photo-1595528862909-f16bfcbd0a5f?w=800&q=80",
  gwangju: "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=800&q=80",
  jeju: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
};

const CITY_FALLBACKS = [
  "https://images.unsplash.com/photo-1538485399081-7c8ed7d6f5df?w=800&q=80",
  "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=800&q=80",
  "https://images.unsplash.com/photo-1601733036253-f6a924e94918?w=800&q=80",
];

function categoryEmoji(slug: string) {
  const map: Record<string, string> = {
    doctors: "🩺",
    dentists: "🦷",
    hospitals: "🏥",
    "real-estate": "🏠",
    lawyers: "⚖️",
    immigration: "✈️",
    tax: "🧾",
    insurance: "🛡️",
    "hair-salons": "💇",
    beauty: "✨",
    vets: "🐾",
    "auto-repair": "🔧",
    "driving-schools": "🚗",
    translation: "🗣️",
    accountants: "📊",
    schools: "🎓",
    tutors: "📚",
    restaurants: "🍜",
  };
  return map[slug] ?? "•";
}
