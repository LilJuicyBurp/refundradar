export function RadarLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="RefundRadar logo"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="24" cy="24" r="22" stroke="hsl(160 54% 38%)" strokeWidth="2" opacity="0.3" />
      {/* Middle ring */}
      <circle cx="24" cy="24" r="15" stroke="hsl(160 54% 38%)" strokeWidth="2" opacity="0.5" />
      {/* Inner ring */}
      <circle cx="24" cy="24" r="8" stroke="hsl(160 54% 38%)" strokeWidth="2" opacity="0.8" />
      {/* Radar sweep line */}
      <line x1="24" y1="24" x2="24" y2="2" stroke="hsl(160 54% 38%)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx="24" cy="24" r="3" fill="hsl(160 54% 38%)" />
      {/* Dollar sign */}
      <text
        x="24"
        y="27"
        textAnchor="middle"
        fill="white"
        fontSize="6"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
      >
        $
      </text>
    </svg>
  );
}

export function LogoWithText({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <RadarLogo size={size} />
      <span className="font-semibold text-foreground" style={{ fontSize: size * 0.5 }}>
        Refund<span className="text-primary">Radar</span>
      </span>
    </div>
  );
}
