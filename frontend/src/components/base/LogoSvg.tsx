import React from "react";
import { T } from "@/components/ThemeTokens";

export const LogoSvg = ({ size = 36, color }: { size?: number, color?: string }) => {
  // If no explicit color is provided, use the theme's text color.
  // In light theme, T.text1 is typically black.
  // In dark theme, T.text1 is typically white.
  const fillColor = color || "var(--text-1)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="330 200 350 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      <g fill={fillColor}>
        {/* The Document/Book back fold (left edge) */}
        <path d="M380 240 C350 240 340 250 340 270 L340 540 C340 560 350 570 370 570 C410 570 450 560 460 540 C460 520 450 510 430 510 L380 510 L380 270 L430 270 C450 270 460 260 460 240 C460 220 450 210 430 210 Z" />

        {/* The Document/Book front face (middle block) */}
        <path d="M460 240 L460 540 L380 540 L380 270 Z" fill="var(--bg-surface)" />
        <path d="M430 240 L460 240 L460 540 C460 560 450 570 430 570 Z" />

        {/* Horizontal lines inside the document */}
        <rect x="385" y="360" width="55" height="12" rx="6" transform="rotate(12 385 360)" />
        <rect x="385" y="395" width="55" height="12" rx="6" transform="rotate(12 385 395)" />
        <rect x="385" y="430" width="55" height="12" rx="6" transform="rotate(12 385 430)" />

        {/* The thick diagonal forming the N */}
        <polygon points="430,240 590,440 610,470 475,275" />

        {/* Network graph nodes */}
        <circle cx="640" cy="285" r="24" />
        <circle cx="645" cy="410" r="20" />
        <circle cx="645" cy="545" r="20" />
        <circle cx="565" cy="475" r="20" />
        <circle cx="505" cy="565" r="20" />

        {/* Network graph edges */}
        <path d="M625 295 L560 350 M642 305 L645 390 M645 430 L645 525 M578 460 L630 420 M578 488 L630 532 M552 462 L525 435 M520 550 L555 490" stroke={fillColor} strokeWidth="10" strokeLinecap="round" />
      </g>
    </svg>
  );
};
