export function SeoulSkyline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 300"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYEnd meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0" />
          <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="bldgFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="bldgMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="bldgNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1E3A8A" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Sun */}
      <circle cx="880" cy="90" r="46" fill="#FDE68A" opacity="0.55" />
      <circle cx="880" cy="90" r="30" fill="#FCD34D" opacity="0.7" />

      {/* Sky wash */}
      <rect x="0" y="0" width="1200" height="300" fill="url(#sky)" />

      {/* Distant hills (Namsan silhouette) */}
      <path
        d="M0 220 Q 200 160 380 200 T 700 190 T 1000 175 T 1200 200 L 1200 300 L 0 300 Z"
        fill="url(#bldgFar)"
      />

      {/* N Seoul Tower on hill */}
      <g opacity="0.55">
        <line x1="640" y1="150" x2="640" y2="200" stroke="#1E40AF" strokeWidth="2" />
        <circle cx="640" cy="150" r="6" fill="#1E40AF" />
        <path d="M636 150 L 644 150 L 642 142 L 638 142 Z" fill="#1E40AF" />
      </g>

      {/* Mid-ground buildings */}
      <g fill="url(#bldgMid)">
        <rect x="60" y="180" width="50" height="120" />
        <rect x="120" y="150" width="40" height="150" />
        <rect x="170" y="170" width="55" height="130" />
        <rect x="240" y="130" width="35" height="170" />
        <rect x="285" y="160" width="60" height="140" />
        <rect x="360" y="140" width="45" height="160" />
        <rect x="420" y="170" width="50" height="130" />
        {/* 63 Building */}
        <path d="M485 100 L 520 100 L 528 300 L 477 300 Z" />
        <rect x="540" y="160" width="45" height="140" />
        <rect x="600" y="140" width="50" height="160" />
        <rect x="720" y="150" width="55" height="150" />
        <rect x="790" y="170" width="45" height="130" />
        <rect x="850" y="140" width="55" height="160" />
        <rect x="920" y="160" width="45" height="140" />
        <rect x="980" y="130" width="55" height="170" />
        <rect x="1050" y="150" width="45" height="150" />
        <rect x="1110" y="170" width="55" height="130" />
      </g>

      {/* Lotte World Tower — tapered iconic peak */}
      <g fill="url(#bldgNear)">
        <path d="M670 60 L 695 60 L 710 300 L 655 300 Z" />
        <path d="M676 60 L 689 60 L 682 40 Z" />
      </g>

      {/* Near-ground buildings darker */}
      <g fill="url(#bldgNear)">
        <rect x="0" y="220" width="70" height="80" />
        <rect x="200" y="215" width="50" height="85" />
        <rect x="330" y="210" width="60" height="90" />
        <rect x="450" y="215" width="55" height="85" />
        <rect x="560" y="205" width="65" height="95" />
        <rect x="760" y="210" width="55" height="90" />
        <rect x="890" y="215" width="60" height="85" />
        <rect x="1020" y="210" width="55" height="90" />
        <rect x="1140" y="220" width="60" height="80" />
      </g>

      {/* Windows — tiny warm dots */}
      <g fill="#FEF3C7" opacity="0.7">
        {Array.from({ length: 60 }).map((_, i) => (
          <rect
            key={i}
            x={40 + (i * 19) % 1140}
            y={180 + ((i * 37) % 90)}
            width="2"
            height="3"
          />
        ))}
      </g>
    </svg>
  );
}
