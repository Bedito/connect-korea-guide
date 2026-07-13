import { Link } from "@tanstack/react-router";
import { MapPin, Star, BadgeCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOpenNow } from "@/hooks/use-open-now";

export interface BusinessCardData {
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
  price_level: number | null;
  categories?: { name: string } | null;
  cities?: { name: string } | null;
  districts?: { name: string } | null;
}

export function BusinessCard({ business, size = "md" }: { business: BusinessCardData; size?: "sm" | "md" | "lg" }) {
  const aspect = size === "lg" ? "aspect-[4/3]" : "aspect-[5/4]";
  const open = useOpenNow(business.hours);

  return (
    <div className="group flex flex-col">
      <Link to="/business/$slug" params={{ slug: business.slug }} className="block">
        <div className={cn("relative overflow-hidden rounded-xl bg-muted", aspect)}>
          {business.cover_image ? (
            <img
              src={business.cover_image}
              alt={business.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}

          {business.verified && (
            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified
            </div>
          )}

          {open !== null && (
            <div
              className={cn(
                "absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur",
                open ? "bg-emerald-500/90 text-white" : "bg-background/90 text-muted-foreground",
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {open ? "Open now" : "Closed"}
            </div>
          )}

          {business.logo && (
            <div className="absolute -bottom-5 left-4 h-12 w-12 overflow-hidden rounded-lg border-2 border-background bg-background shadow-sm">
              <img src={business.logo} alt={`${business.name} logo`} className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      </Link>

      <div className={cn("mt-3 space-y-1.5", business.logo && "pl-16 -mt-2 min-h-[3.5rem] pt-2")}>
        <div className="flex items-start justify-between gap-3">
          <Link to="/business/$slug" params={{ slug: business.slug }}>
            <h3 className="text-display text-xl leading-tight hover:underline">{business.name}</h3>
          </Link>
          <div className="flex shrink-0 items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
            <span className="font-medium">{business.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({business.review_count})</span>
          </div>
        </div>

        {business.categories?.name && (
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {business.categories.name}
          </p>
        )}

        {business.tagline && (
          <p className="line-clamp-1 text-sm text-muted-foreground">{business.tagline}</p>
        )}

        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
          <span className="line-clamp-1">
            {business.address ??
              [business.districts?.name, business.cities?.name].filter(Boolean).join(", ")}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {business.languages.slice(0, 4).map((lang) => (
            <Badge
              key={lang}
              variant="secondary"
              className="h-5 rounded-sm px-1.5 text-[10px] font-medium tracking-wide"
            >
              {lang}
            </Badge>
          ))}
          {business.price_level !== null && business.price_level > 0 && (
            <span className="text-xs text-muted-foreground">{"₩".repeat(business.price_level)}</span>
          )}
        </div>

        <div className="pt-3">
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link to="/business/$slug" params={{ slug: business.slug }}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
