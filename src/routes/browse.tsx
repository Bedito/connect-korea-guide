import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Search, MapPin, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusinessCard } from "@/components/business-card";
import {
  browseQuery,
  categoriesQuery,
  citiesQuery,
} from "@/lib/queries";

const searchSchema = z.object({
  q: fallback(z.string().optional(), undefined),
  category: fallback(z.string().optional(), undefined),
  city: fallback(z.string().optional(), undefined),
  language: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/browse")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Browse services — Seoul Compass" },
      {
        name: "description",
        content:
          "Search English-speaking businesses in Korea by category, city, and language. Doctors, dentists, real estate, salons, and more.",
      },
    ],
  }),
  component: BrowsePage,
});

const LANGS = ["EN", "KR", "JP", "ZH", "FR", "TR"];

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/browse" });
  const categories = useQuery(categoriesQuery);
  const cities = useQuery(citiesQuery);
  const results = useQuery(browseQuery(search));

  const setParam = (key: keyof typeof search, value: string | undefined) => {
    navigate({ search: (prev) => ({ ...prev, [key]: value || undefined }) });
  };

  const activeCount = [search.q, search.category, search.city, search.language].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Search input row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/70 bg-card px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            defaultValue={search.q ?? ""}
            placeholder="Search businesses, services, keywords..."
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value);
            }}
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <select
            value={search.city ?? ""}
            onChange={(e) => setParam("city", e.target.value)}
            className="h-11 min-w-[10rem] bg-transparent text-sm outline-none"
          >
            <option value="">Anywhere</option>
            {cities.data?.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setParam("category", undefined)}
          className={pillClass(!search.category)}
        >
          All
        </button>
        {categories.data?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setParam("category", cat.slug)}
            className={pillClass(search.category === cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Language filter */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        <span>Speaks:</span>
        {LANGS.map((lang) => (
          <button
            key={lang}
            onClick={() => setParam("language", search.language === lang ? undefined : lang)}
            className={pillClass(search.language === lang, "compact")}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Results header */}
      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl sm:text-4xl">
            {search.category
              ? categories.data?.find((c) => c.slug === search.category)?.name ?? "Browse"
              : "All services"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {results.isLoading
              ? "Searching…"
              : `${results.data?.length ?? 0} result${results.data?.length === 1 ? "" : "s"}`}
            {activeCount > 0 && (
              <>
                {" "}
                ·{" "}
                <button
                  onClick={() =>
                    navigate({
                      search: { q: undefined, category: undefined, city: undefined, language: undefined },
                    })
                  }
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  clear filters
                </button>
              </>
            )}
          </p>
        </div>
        {activeCount > 0 && (
          <div className="hidden gap-1.5 sm:flex">
            {search.q && <Badge variant="secondary">"{search.q}"</Badge>}
            {search.city && <Badge variant="secondary">{search.city}</Badge>}
            {search.language && <Badge variant="secondary">{search.language}</Badge>}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.data?.map((b) => (
          <BusinessCard key={b.id} business={b as never} />
        ))}
      </div>

      {results.data && results.data.length === 0 && (
        <div className="mt-16 rounded-2xl border border-dashed border-border/70 p-12 text-center">
          <h3 className="text-display text-2xl">No matches</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting filters or searching a broader area.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() =>
              navigate({
                search: { q: undefined, category: undefined, city: undefined, language: undefined },
              })
            }
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

function pillClass(active: boolean, size: "compact" | "default" = "default") {
  const base =
    size === "compact"
      ? "h-7 rounded-full px-2.5 text-[11px] font-medium tracking-wide"
      : "h-9 rounded-full px-4 text-sm";
  return `${base} border transition ${
    active
      ? "border-foreground bg-foreground text-background"
      : "border-border/60 bg-card hover:border-foreground/40"
  }`;
}
