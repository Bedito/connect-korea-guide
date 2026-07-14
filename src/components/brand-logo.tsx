import logoAsset from "@/assets/main-logo.png";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { height: number; markOnly: number }> = {
  sm: { height: 150, markOnly: 150 },
  md: { height: 130, markOnly: 140 },
  lg: { height: 150, markOnly: 150 },
  xl: { height: 150, markOnly: 150 },
};

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <img
      src={logoAsset}
      alt="친구Base"
      style={{ height: size, width: "auto", objectFit: "contain", objectPosition: "left center" }}
      className="select-none"
      draggable={false}
    />
  );
}

export function BrandLogo({
  size = "md",
  showWordmark = true,
  className = "",
}: {
  size?: Size;
  showWordmark?: boolean;
  className?: string;
}) {
  const s = sizeMap[size];
  const height = showWordmark ? s.height : s.markOnly;
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src={logoAsset}
        alt="친구Base"
        style={{ height, width: "auto", objectFit: "contain" }}
        className="select-none"
        draggable={false}
      />
    </span>
  );
}
