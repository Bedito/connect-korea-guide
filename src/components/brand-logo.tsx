import logoAsset from "@/assets/main-logo.png";

type Size = "sm" | "md" | "lg" | "xl";

// Responsive height in rem: [mobile, sm+]
const sizeMap: Record<Size, { mobile: string; desktop: string }> = {
  sm: { mobile: "2.25rem", desktop: "2.5rem" },  // 36 / 40
  md: { mobile: "3rem", desktop: "3.75rem" },    // 48 / 60
  lg: { mobile: "3.5rem", desktop: "4.5rem" },   // 56 / 72
  xl: { mobile: "4rem", desktop: "5.5rem" },     // 64 / 88
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
      className={`inline-flex items-center ${className}`}
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

