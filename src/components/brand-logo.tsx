import logoAsset from "@/assets/main-logo-clean.png";

type Size = "sm" | "md" | "lg" | "xl";

// Responsive height in rem: [mobile, sm+]
const sizeMap: Record<Size, { mobile: string; desktop: string }> = {
  sm: { mobile: "2.25rem", desktop: "2.5rem" },
  md: { mobile: "2.75rem", desktop: "3.25rem" },
  lg: { mobile: "3.5rem", desktop: "4.25rem" },
  xl: { mobile: "4.5rem", desktop: "5.5rem" },
};

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <img
      src={logoAsset}
      alt="친구Base"
      style={{ height: size, width: "auto", objectFit: "contain", objectPosition: "left center" }}
      className="max-w-full select-none"
      draggable={false}
    />
  );
}

export function BrandLogo({
  size = "md",
  className = "",
}: {
  size?: Size;
  showWordmark?: boolean;
  className?: string;
}) {
  const s = sizeMap[size];
  return (
    <span
      className={`inline-flex min-w-0 items-center ${className}`}
      style={{ ["--logo-h-mobile" as string]: s.mobile, ["--logo-h-desktop" as string]: s.desktop }}
    >
      <img
        src={logoAsset}
        alt="친구Base"
        className="h-[var(--logo-h-mobile)] w-auto max-w-full select-none object-contain sm:h-[var(--logo-h-desktop)]"
        draggable={false}
      />
    </span>
  );
}

