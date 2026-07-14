type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { mark: number; text: string; gap: string }> = {
  sm: { mark: 24, text: "text-sm", gap: "gap-1.5" },
  md: { mark: 32, text: "text-[1.05rem]", gap: "gap-2.5" },
  lg: { mark: 40, text: "text-xl", gap: "gap-3" },
  xl: { mark: 56, text: "text-3xl", gap: "gap-3.5" },
};

export function LogoMark({ size = 32 }: { size?: number }) {
  // Rounded location pin in brand blue with "친" glyph — matches the brand kit
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      {/* Teardrop pin */}
      <path
        d="M32 4C18.7 4 8 14.6 8 27.7c0 9.5 6.3 18.3 12.6 24.4C26.5 57.7 30 60 32 60s5.5-2.3 11.4-7.9C49.7 46 56 37.2 56 27.7 56 14.6 45.3 4 32 4Z"
        fill="url(#pinGrad)"
      />
      {/* Inner circle */}
      <circle cx="32" cy="27" r="14" fill="white" />
      {/* 친 character */}
      <text
        x="32"
        y="27"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="16"
        fontWeight="800"
        fill="#1D4ED8"
        fontFamily="'Noto Sans KR', 'Apple SD Gothic Neo', system-ui, sans-serif"
      >
        친
      </text>
    </svg>
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
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <LogoMark size={s.mark} />
      {showWordmark && (
        <span className={`font-display ${s.text} font-bold tracking-tight leading-none`}>
          <span className="text-primary">친구</span>
          <span className="text-foreground">Base</span>
        </span>
      )}
    </span>
  );
}
