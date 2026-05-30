import { SVGProps } from "react";

interface UniaoBagLogoProps extends SVGProps<SVGSVGElement> {
  variant?: "light" | "dark" | "colored";
  onlyIcon?: boolean;
  className?: string;
}

export default function UniaoBagLogo({ variant = "light", onlyIcon = false, ...props }: UniaoBagLogoProps) {
  // Determine colors based on variant
  // In a dark theme (main app), "light" text color (white) works best.
  const textColor = variant === "light" ? "#FFFFFF" : "#1F2937";
  const subtitleColor = variant === "light" ? "rgba(255, 255, 255, 0.6)" : "#4B5563";
  const strokeColor = variant === "light" ? "#FFFFFF" : "#111827";

  return (
    <svg
      viewBox={onlyIcon ? "25 100 425 240" : "0 0 500 500"}
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      {...props}
    >
      {/* 1. BLUE SWIRL GRAPHIC */}
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0094d9" />
          <stop offset="100%" stopColor="#0072bc" />
        </linearGradient>
      </defs>

      {/* Outer elegant oval swirl */}
      <path
        d="M 450,150 C 350,110 180,110 80,170 C -10,224 20,290 140,310 C 270,331 430,290 470,230 C 490,200 480,170 450,150 Z"
        fill="none"
        stroke="url(#blueGradient)"
        strokeWidth="18"
        strokeLinecap="round"
        opacity="0.9"
      />
      
      {/* Secondary accent swirl stroke for dynamic feel */}
      <path
        d="M 420,165 C 330,130 190,130 100,185 C 40,221 60,265 140,282 C 240,303 380,270 420,220"
        fill="none"
        stroke="url(#blueGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* 2. BIG BAG CENTER PIECE */}
      {/* Shadow under the bag */}
      <ellipse cx="250" cy="275" rx="75" ry="15" fill="black" opacity="0.3" />

      {/* Big Bag Main Body (Perspective Cube) */}
      {/* Front Face */}
      <path
        d="M 195,190 L 305,190 L 305,260 L 195,260 Z"
        fill="#FFFFFF"
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* Top Face (Perspective) */}
      <path
        d="M 195,190 L 250,165 L 360,165 L 305,190 Z"
        fill="#F3F4F6"
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* Right Side Face */}
      <path
        d="M 305,190 L 360,165 L 360,235 L 305,260 Z"
        fill="#E5E7EB"
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* UB Label Square on Front Face */}
      <rect
        x="215"
        y="205"
        width="45"
        height="40"
        rx="4"
        fill="#111827"
        stroke={strokeColor}
        strokeWidth="3"
      />
      
      {/* "UB" text inside the label */}
      <text
        x="237"
        y="232"
        fill="#FFFFFF"
        fontFamily="'Inter', 'Space Grotesk', sans-serif"
        fontWeight="900"
        fontSize="22"
        textAnchor="middle"
        letterSpacing="-1"
      >
        UB
      </text>

      {/* Big Bag Loops */}
      {/* Left Loop */}
      <path
        d="M 195,190 C 190,160 215,160 215,190"
        fill="none"
        stroke="url(#blueGradient)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Right Loop */}
      <path
        d="M 305,190 C 300,160 325,160 325,190"
        fill="none"
        stroke="url(#blueGradient)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Back Right Loop */}
      <path
        d="M 360,165 C 355,135 375,135 375,165"
        fill="none"
        stroke="url(#blueGradient)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Cup top filling inlet */}
      <path
        d="M 268,165 L 268,145 C 268,140 288,140 288,145 L 288,165"
        fill="#E5E7EB"
        stroke={strokeColor}
        strokeWidth="5"
      />

      {/* 3. BRAND TYPOGRAPHY (Only if not in onlyIcon mode) */}
      {!onlyIcon && (
        <>
          {/* UNIÃO BAG */}
          <text
            x="250"
            y="380"
            fill={textColor}
            fontFamily="'Inter', 'Space Grotesk', sans-serif"
            fontWeight="900"
            fontSize="48"
            textAnchor="middle"
            letterSpacing="3"
          >
            UNIÃO BAG
          </text>

          {/* Divider line in original brand color */}
          <line
            x1="100"
            y1="405"
            x2="400"
            y2="405"
            stroke="#0094d9"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* BIG BAGS E SACARIAS */}
          <text
            x="250"
            y="445"
            fill={subtitleColor}
            fontFamily="'Inter', 'Space Grotesk', sans-serif"
            fontWeight="700"
            fontSize="24"
            textAnchor="middle"
            letterSpacing="6"
          >
            BIG BAGS E SACARIAS
          </text>
        </>
      )}
    </svg>
  );
}
