import logoAsset from "@/assets/friendbase-logo.png.asset.json";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { height: number; markOnly: number }> = {
  sm: { height: 28, markOnly: 30 },
  md: { height: 38, markOnly: 40 },
  lg: { height: 52, markOnly: 52 },
  xl: { height: 72, markOnly: 72 },
};

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src={logoAsset.url}
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
        src={logoAsset.url}
        alt="친구Base"
        style={{ height, width: "auto", objectFit: "contain" }}
        className="select-none"
        draggable={false}
      />
    </span>
  );
}
