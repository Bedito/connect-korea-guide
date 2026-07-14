import logoMark from "@/assets/logo-mark.png";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { mark: string; text: string; gap: string }> = {
  sm: { mark: "h-6 w-6", text: "text-sm", gap: "gap-1.5" },
  md: { mark: "h-8 w-8", text: "text-[1.05rem]", gap: "gap-2.5" },
  lg: { mark: "h-10 w-10", text: "text-xl", gap: "gap-3" },
  xl: { mark: "h-14 w-14", text: "text-3xl", gap: "gap-3.5" },
};

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
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <img
        src={logoMark}
        alt="친구Base logo"
        width={64}
        height={64}
        className={`${s.mark} object-contain`}
        loading="eager"
        decoding="async"
      />
      {showWordmark && (
        <span className={`font-display ${s.text} font-bold tracking-tight leading-none`}>
          <span className="text-primary">친구</span>
          <span className="text-foreground">Base</span>
        </span>
      )}
    </span>
  );
}
