import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusinessCard } from "@/components/business-card";
import {
  browseQuery,
  categoriesQuery,
  citiesQuery,
  districtsByCityQuery,
  type SortKey,
} from "@/lib/queries";

const searchSchema = z.object({
  q: fallback(z.string().optional(), undefined),
  category: fallback(z.string().optional(), undefined),
  city: fallback(z.string().optional(), undefined),
  district: fallback(z.string().optional(), undefined),
  languages: fallback(z.string().array(), []).default([]),
  verified: fallback(z.boolean(), false).default(false),
  openNow: fallback(z.boolean(), false).default(false),
  parking: fallback(z.boolean(), false).default(false),
  online: fallback(z.boolean(), false).default(false),
  emergency: fallback(z.boolean(), false).default(false),
  reservation: fallback(z.boolean(), false).default(false),
  sort: fallback(z.string(), "recommended").default("recommended"),
});

export const Route = createFileRoute("/browse")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Browse services — Seoul Compass" },
      {
        name: "description",
        content:
          "Search English-speaking businesses in Korea. Filter by category, city, district, language, and services.",
      },
    ],
  }),
  component: BrowsePage,
});

const LANGUAGES: { code: string; label: string }[] = [
  { code: "EN", label: "English" },
  { code: "KR", label: "Korean" },
  { code: "JP", label: "Japanese" },
  { code: "ZH", label: "Chinese" },
  { code: "FR", label: "French" },
  { code: "ES", label: "Spanish" },
];

const TOGGLES: { key: ToggleKey; label: string }[] = [
  { key: "verified", label: "Verified only" },
  { key: "openNow", label: "Open now" },
  { key: "parking", label: "Parking available" },
  { key: "online", label: "Online consultation" },
  { key: "emergency", label: "Emergency service" },
  { key: "reservation", label: "Reservation required" },
];

type ToggleKey = "verified" | "openNow" | "parking" | "online" | "emergency" | "reservation";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Highest rated" },
  { value: "reviews", label: "Most reviewed" },
  { value: "newest", label: "Newest" },
  { value: "distance", label: "Distance" },
];

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/browse" });
  const categories = useQuery(categoriesQuery);
  const cities = useQuery(citiesQuery);
  const districts = useQuery(districtsByCityQuery(search.city));
  const sortKey = (SORTS.find((s) => s.value === search.sort)?.value ?? "recommended") as SortKey;
  const results = useQuery(
    browseQuery({
      q: search.q,
      category: search.category,
      city: search.city,
      district: search.district,
      languages: search.languages,
      verified: search.verified,
      openNow: search.openNow,
      parking: search.parking,
      online: search.online,
      emergency: search.emergency,
      reservation: search.reservation,
      sort: sortKey,
    }),
  );

  type SearchState = typeof search;
  const setParam = <K extends keyof SearchState>(key: K, value: SearchState[K] | undefined) => {
    navigate({ search: (prev: SearchState) => ({ ...prev, [key]: value }) as SearchState });
  };

  const toggleLang = (code: string) => {
    const set = new Set(search.languages);
    if (set.has(code)) set.delete(code);
    else set.add(code);
    setParam("languages", Array.from(set));
  };

  const resetAll = () =>
    navigate({
      search: {
        q: undefined,
        category: undefined,
        city: undefined,
        district: undefined,
        languages: [],
        verified: false,
        openNow: false,
        parking: false,
        online: false,
        emergency: false,
        reservation: false,
        sort: "recommended",
      },
    });

  const activeCount =
    (search.q ? 1 : 0) +
    (search.category ? 1 : 0) +
    (search.city ? 1 : 0) +
    (search.district ? 1 : 0) +
    search.languages.length +
    TOGGLES.filter((t) => search[t.key]).length;

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
              if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value || undefined);
            }}
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <select
            value={search.city ?? ""}
            onChange={(e) => {
              setParam("city", e.target.value || undefined);
              setParam("district", undefined);
            }}
            className="h-11 min-w-[9rem] bg-transparent text-sm outline-none"
          >
            <option value="">Anywhere</option>
            {cities.data?.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3">
          <select
            value={search.district ?? ""}
            onChange={(e) => setParam("district", e.target.value || undefined)}
            disabled={!search.city}
            className="h-11 min-w-[9rem] bg-transparent text-sm outline-none disabled:opacity-50"
          >
            <option value="">All districts</option>
            {districts.data?.map((d) => (
              <option key={d.id} value={d.slug}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
          <select
            value={sortKey}
            onChange={(e) => setParam("sort", e.target.value as SortKey)}
            className="h-11 min-w-[9rem] bg-transparent text-sm outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
        {/* Sidebar filters */}
        <aside className="space-y-8">
          <FilterGroup title="Categories">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setParam("category", undefined)}
                className={pillClass(!search.category, "compact")}
              >
                All
              </button>
              {categories.data?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setParam("category", cat.slug)}
                  className={pillClass(search.category === cat.slug, "compact")}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Languages spoken">
            <div className="space-y-2">
              {LANGUAGES.map((l) => (
                <label key={l.code} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={search.languages.includes(l.code)}
                    onChange={() => toggleLang(l.code)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span>{l.label}</span>
                </label>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Features">
            <div className="space-y-2">
              {TOGGLES.map((t) => (
                <label key={t.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(search[t.key])}
                    onChange={(e) => setParam(t.key, e.target.checked as never)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </FilterGroup>

          {activeCount > 0 && (
            <Button variant="outline" size="sm" onClick={resetAll} className="w-full">
              <X className="mr-1 h-3 w-3" /> Clear all filters
            </Button>
          )}
        </aside>

        {/* Results */}
        <div>
          <div className="flex items-end justify-between gap-4">
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
                {sortKey === "distance" && (
                  <> · <span className="italic">distance requires location (soon)</span></>
                )}
              </p>
            </div>
          </div>

          {activeCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {search.q && (
                <ActiveChip label={`"${search.q}"`} onClear={() => setParam("q", undefined)} />
              )}
              {search.city && (
                <ActiveChip
                  label={cities.data?.find((c) => c.slug === search.city)?.name ?? search.city}
                  onClear={() => { setParam("city", undefined); setParam("district", undefined); }}
                />
              )}
              {search.district && (
                <ActiveChip
                  label={districts.data?.find((d) => d.slug === search.district)?.name ?? search.district}
                  onClear={() => setParam("district", undefined)}
                />
              )}
              {search.languages.map((l: string) => (
                <ActiveChip key={l} label={LANGUAGES.find((x) => x.code === l)?.label ?? l} onClear={() => toggleLang(l)} />
              ))}
              {TOGGLES.filter((t) => search[t.key]).map((t) => (
                <ActiveChip key={t.key} label={t.label} onClear={() => setParam(t.key, false as never)} />
              ))}
            </div>
          )}

          <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
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
              <Button variant="outline" className="mt-4" onClick={resetAll}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ActiveChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1">
      {label}
      <button onClick={onClear} className="ml-1 rounded-full p-0.5 hover:bg-foreground/10" aria-label={`Remove ${label}`}>
        <X className="h-3 w-3" />
      </button>
    </Badge>
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
