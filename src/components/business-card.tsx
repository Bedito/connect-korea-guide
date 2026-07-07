import { Link } from "@tanstack/react-router";
import { MapPin, Star, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BusinessCardData {
  slug: string;
  name: string;
  tagline: string | null;
  cover_image: string | null;
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

  return (
    <Link
      to="/business/$slug"
      params={{ slug: business.slug }}
      className="group block"
    >
      <div className={cn("relative overflow-hidden rounded-xl bg-muted", aspect)}>
        {business.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
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
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-display text-xl leading-tight">{business.name}</h3>
          <div className="flex shrink-0 items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
            <span className="font-medium">{business.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({business.review_count})</span>
          </div>
        </div>
        {business.tagline && (
          <p className="line-clamp-1 text-sm text-muted-foreground">{business.tagline}</p>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>
            {business.districts?.name ? `${business.districts.name}, ` : ""}
            {business.cities?.name ?? ""}
          </span>
          {business.categories?.name && (
            <>
              <span>·</span>
              <span>{business.categories.name}</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {business.languages.slice(0, 4).map((lang) => (
            <Badge key={lang} variant="secondary" className="h-5 rounded-sm px-1.5 text-[10px] font-medium tracking-wide">
              {lang}
            </Badge>
          ))}
          {business.price_level !== null && business.price_level > 0 && (
            <span className="text-xs text-muted-foreground">
              {"₩".repeat(business.price_level)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
