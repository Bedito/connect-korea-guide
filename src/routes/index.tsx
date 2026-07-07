import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Search, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusinessCard } from "@/components/business-card";
import {
  categoriesQuery,
  citiesQuery,
  featuredBusinessesQuery,
  recentBusinessesQuery,
} from "@/lib/queries";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  const categories = useQuery(categoriesQuery);
  const cities = useQuery(citiesQuery);
  const featured = useQuery(featuredBusinessesQuery);
  const recent = useQuery(recentBusinessesQuery);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/browse",
      search: { q: q || undefined, city: city || undefined },
    });
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-paper-warm/70 via-background to-background"
          aria-hidden
        />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                <Sparkles className="h-3 w-3" />
                <span>Made for foreigners living in Korea</span>
              </div>
              <h1 className="text-display mt-6 text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem]">
                Find the right business,
                <br />
                <span className="italic text-muted-foreground">without the language barrier.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                A trusted directory of English-friendly doctors, dentists, real estate agents,
                lawyers, salons, and more — verified and reviewed by the expat community.
              </p>

              {/* Search bar */}
              <form
                onSubmit={onSearch}
                className="mt-8 flex flex-col gap-2 rounded-2xl border border-border/70 bg-card p-2 shadow-sm sm:flex-row sm:items-center sm:gap-0"
              >
                <div className="flex flex-1 items-center gap-2 border-b border-border/60 px-3 sm:border-b-0 sm:border-r">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="English dentist, real estate in Gangnam..."
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="flex items-center gap-2 px-3">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-10 w-full min-w-[9rem] bg-transparent text-sm outline-none sm:w-auto"
                  >
                    <option value="">Anywhere in Korea</option>
                    {cities.data?.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" size="lg" className="sm:ml-2">
                  Search
                </Button>
              </form>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span>Try:</span>
                {["English dentist in Gangnam", "Real estate near Hongdae", "Vet in Busan"].map(
                  (ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => {
                        setQ(ex);
                        navigate({ to: "/browse", search: { q: ex } });
                      }}
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      {ex}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1538485399081-7c8ed7d6f5df?w=800&q=80"
                  alt="Seoul cityscape"
                  className="aspect-[3/4] w-full rounded-2xl object-cover"
                  loading="lazy"
                />
                <div className="space-y-4 pt-10">
                  <img
                    src="https://images.unsplash.com/photo-1580155327874-d2b0b3f8f45c?w=800&q=80"
                    alt="Café interior"
                    className="aspect-square w-full rounded-2xl object-cover"
                    loading="lazy"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"
                    alt="Modern office"
                    className="aspect-[4/5] w-full rounded-2xl object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Browse</p>
            <h2 className="text-display mt-2 text-4xl sm:text-5xl">Every service you'll need</h2>
          </div>
          <Link
            to="/browse"
            className="hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            See all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.data?.map((cat) => (
            <Link
              key={cat.id}
              to="/browse"
              search={{ category: cat.slug }}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border/60 bg-card p-4 transition hover:border-foreground/30 hover:shadow-sm"
            >
              <span className="text-2xl">{categoryEmoji(cat.slug)}</span>
              <span className="text-sm font-medium leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Featured</p>
            <h2 className="text-display mt-2 text-4xl sm:text-5xl">Community favorites</h2>
          </div>
          <Link
            to="/browse"
            className="hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            Explore all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {featured.data?.map((b) => (
            <BusinessCard key={b.id} business={b as never} />
          ))}
        </div>
      </section>

      {/* Recently added */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">New</p>
            <h2 className="text-display mt-2 text-4xl sm:text-5xl">Recently added</h2>
          </div>
        </div>
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {recent.data?.slice(0, 4).map((b) => (
            <BusinessCard key={b.id} business={b as never} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-8 max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-primary text-primary-foreground">
          <div className="grid gap-8 p-10 sm:p-14 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-70">For business owners</p>
              <h2 className="text-display mt-3 text-4xl sm:text-5xl">
                Get discovered by Korea's international community.
              </h2>
              <p className="mt-4 max-w-lg text-primary-foreground/70">
                List your business, respond to reviews, and reach thousands of foreigners searching
                for English-friendly services every month.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end">
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Create an account
                </Button>
              </Link>
              <Link to="/browse">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                >
                  Browse directory
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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
