import React from 'react';

interface RebellLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pulse?: boolean;
}

export const RebellLogo: React.FC<RebellLogoProps> = ({ size = 'md', pulse = true }) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  };

  return (
    <div className={`relative ${sizeMap[size]} flex items-center justify-center select-none group`}>
      {/* Outer Rotating Energy Ring */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite] opacity-80"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="url(#cyanFuchsiaGrad)"
          strokeWidth="1.5"
          strokeDasharray="18 10 32 8"
        />
        <circle
          cx="50"
          cy="50"
          r="41"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="0.8"
          strokeDasharray="6 6"
          opacity="0.6"
        />
      </svg>

      {/* Counter-Rotating Tech Ring */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full animate-[spin_16s_linear_infinite_reverse] opacity-60"
      >
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="#ec4899"
          strokeWidth="1"
          strokeDasharray="12 24"
        />
      </svg>

      {/* Ambient Neon Flare */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-cyan-500/30 via-fuchsia-500/25 to-cyan-400/30 blur-lg animate-pulse" />

      {/* Cyber Core Emblem (The Badass VoidRebellion Crest) */}
      <svg
        viewBox="0 0 100 100"
        className="relative z-10 w-4/5 h-4/5 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
      >
        <defs>
          <linearGradient id="cyanFuchsiaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>

        {/* Outer Angular Hex Shield */}
        <polygon
          points="50,6 88,28 88,72 50,94 12,72 12,28"
          fill="#060612"
          stroke="url(#cyanFuchsiaGrad)"
          strokeWidth="2.5"
        />

        {/* Inner Diamond Geometry */}
        <polygon
          points="50,16 78,32 78,68 50,84 22,68 22,32"
          fill="#0a0a1f"
          stroke="#22d3ee"
          strokeWidth="1"
          opacity="0.7"
        />

        {/* Stylized Rebell "R" & Lightning Sword */}
        {/* Left Vertical Cyber Blade */}
        <path
          d="M32 26 L42 26 L42 74 L32 74 Z"
          fill="url(#bladeGrad)"
        />

        {/* Right Upper Cyber Loop */}
        <path
          d="M42 26 L58 26 C68 26 72 32 72 40 C72 48 66 52 56 52 L42 52 Z"
          fill="url(#bladeGrad)"
        />
        {/* Cutout for loop */}
        <path
          d="M48 34 L56 34 C60 34 64 36 64 40 C64 44 60 46 56 46 L48 46 Z"
          fill="#0a0a1f"
        />

        {/* Lower Energy Slash (The Rebel Kick) */}
        <polygon
          points="46,50 60,50 74,74 62,74 52,58 46,58"
          fill="#38bdf8"
        />

        {/* Glowing Center Core Spark */}
        <circle cx="50" cy="50" r="3.5" fill="#ffffff" className="animate-ping" />
        <circle cx="50" cy="50" r="2.5" fill="#ec4899" />
      </svg>
    </div>
  );
};
