import logoAsset from "@/assets/main-logo.png";

type Size = "sm" | "md" | "lg" | "xl";

// Responsive height in rem: [mobile, sm+]
const sizeMap: Record<Size, { mobile: string; desktop: string }> = {
  sm: { mobile: "1.75rem", desktop: "2rem" },   // 28 / 32
  md: { mobile: "2.25rem", desktop: "3rem" },   // 36 / 48
  lg: { mobile: "2.75rem", desktop: "3.5rem" }, // 44 / 56
  xl: { mobile: "3.25rem", desktop: "4.5rem" }, // 52 / 72
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

