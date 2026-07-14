type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { mark: number; text: string; gap: string }> = {
  sm: { mark: 24, text: "text-sm", gap: "gap-1.5" },
  md: { mark: 32, text: "text-[1.05rem]", gap: "gap-2.5" },
  lg: { mark: 40, text: "text-xl", gap: "gap-3" },
  xl: { mark: 56, text: "text-3xl", gap: "gap-3.5" },
};

export function LogoMark({ size = 32 }: { size?: number }) {
  // Outline location pin in brand blue→cyan gradient with "친" glyph and two dots on top — matches the brand kit
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
        <linearGradient id="pinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="60%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      {/* Outline teardrop pin */}
      <path
        d="M32 8C20.4 8 11 17.1 11 28.3c0 8.1 5.3 15.6 10.7 21.1C27.1 54.9 30.4 57 32 57s4.9-2.1 10.3-7.6C47.7 43.9 53 36.4 53 28.3 53 17.1 43.6 8 32 8Z"
        stroke="url(#pinGrad)"
        strokeWidth="4"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Two cyan dots on top */}
      <circle cx="36" cy="6.5" r="2.6" fill="#22D3EE" />
      <circle cx="42.5" cy="9" r="2" fill="#22D3EE" />
      {/* 친 character */}
      <text
        x="32"
        y="30"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="22"
        fontWeight="800"
        fill="#2563EB"
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
