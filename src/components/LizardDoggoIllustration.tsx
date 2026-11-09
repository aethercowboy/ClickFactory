import React, { useState } from 'react';

interface LizardDoggoIllustrationProps {
  happiness: number; // 0 to 100
  isPetting?: boolean;
  onPetClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  hasItem?: boolean;
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export const LizardDoggoIllustration: React.FC<LizardDoggoIllustrationProps> = ({
  happiness,
  isPetting = false,
  onPetClick,
  size = 'md',
  hasItem = false,
}) => {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);

  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onPetClick) {
      onPetClick();
      // Spawn 3 floating hearts around click position
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const newHearts: HeartParticle[] = Array.from({ length: 3 }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        x: clickX + (Math.random() - 0.5) * 40,
        y: clickY + (Math.random() - 0.5) * 20,
        scale: 0.8 + Math.random() * 0.6,
        rotation: (Math.random() - 0.5) * 40,
      }));

      setHearts(prev => [...prev.slice(-12), ...newHearts]);

      setTimeout(() => {
        setHearts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)));
      }, 1000);
    }
  };

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48',
    lg: 'w-64 h-64 sm:w-72 sm:h-72',
  }[size];

  // Faster tail wag when happier
  const tailDuration = happiness > 70 ? '0.35s' : happiness > 30 ? '0.7s' : '1.2s';
  const earWiggle = isPetting ? 'animate-bounce' : happiness > 50 ? 'animate-pulse' : '';

  return (
    <div
      onClick={handlePointerDown}
      className={`relative select-none flex items-center justify-center cursor-pointer transition-transform active:scale-95 group ${sizeClasses}`}
      title="Click to pet the Lizard Doggo!"
    >
      {/* Floating Hearts */}
      {hearts.map(h => (
        <div
          key={h.id}
          className="absolute pointer-events-none z-20 text-rose-500 font-bold transition-all duration-1000 ease-out"
          style={{
            left: `${h.x}px`,
            top: `${h.y}px`,
            transform: `translate(-50%, -100%) scale(${h.scale}) rotate(${h.rotation}deg)`,
            opacity: 0,
            animation: 'floatUp 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
          }}
        >
          <svg className="w-6 h-6 fill-rose-500 drop-shadow-md" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}

      {/* Doggo SVG */}
      <svg
        viewBox="0 0 320 300"
        className="w-full h-full filter drop-shadow-lg transition-transform group-hover:scale-105 duration-200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="doggoBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" /> {/* Amber 500 */}
            <stop offset="60%" stopColor="#d97706" /> {/* Amber 600 */}
            <stop offset="100%" stopColor="#b45309" /> {/* Amber 700 */}
          </linearGradient>
          <linearGradient id="doggoBelly" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <linearGradient id="doggoFin" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" /> {/* Teal scales */}
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <radialGradient id="eyeGlow" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        </defs>

        <style>
          {`
            @keyframes tailWag {
              0% { transform: rotate(0deg); }
              50% { transform: rotate(18deg); }
              100% { transform: rotate(0deg); }
            }
            @keyframes floatUp {
              0% { opacity: 1; transform: translate(-50%, 0) scale(0.6); }
              60% { opacity: 0.9; }
              100% { opacity: 0; transform: translate(-50%, -60px) scale(1.3); }
            }
            @keyframes earFlap {
              0% { transform: rotate(0deg); }
              50% { transform: rotate(-8deg); }
              100% { transform: rotate(0deg); }
            }
          `}
        </style>

        {/* Tail (wagging) */}
        <g
          style={{
            transformOrigin: '210px 190px',
            animation: `tailWag ${tailDuration} ease-in-out infinite`,
          }}
        >
          <path
            d="M210 190 C 240 180, 275 160, 285 130 C 275 145, 255 175, 215 195 Z"
            fill="url(#doggoBody)"
          />
          {/* Tail tip teal scales */}
          <path
            d="M265 145 C 275 135, 285 130, 285 130 C 285 135, 275 155, 260 160 Z"
            fill="url(#doggoFin)"
          />
        </g>

        {/* Back Legs */}
        <ellipse cx="205" cy="225" rx="26" ry="32" fill="#b45309" />
        <ellipse cx="215" cy="245" rx="16" ry="10" fill="#92400e" />

        {/* Body Main */}
        <ellipse cx="160" cy="195" rx="65" ry="52" fill="url(#doggoBody)" />

        {/* Pale Underbelly */}
        <path
          d="M125 195 C 125 235, 195 235, 195 195 C 190 180, 130 180, 125 195 Z"
          fill="url(#doggoBelly)"
        />

        {/* Back scales / decorative spikes */}
        <polygon points="175,145 183,135 190,146" fill="#0d9488" />
        <polygon points="192,148 200,140 207,151" fill="#0d9488" />

        {/* Front Left Leg */}
        <ellipse cx="120" cy="235" rx="16" ry="24" fill="url(#doggoBody)" />
        <ellipse cx="116" cy="252" rx="14" ry="8" fill="#b45309" />

        {/* Front Right Leg */}
        <ellipse cx="152" cy="235" rx="16" ry="24" fill="url(#doggoBody)" />
        <ellipse cx="156" cy="252" rx="14" ry="8" fill="#b45309" />

        {/* Left Ear-Fin (floppy reptile fan) */}
        <g
          className={earWiggle}
          style={{
            transformOrigin: '70px 105px',
            animation: 'earFlap 2.5s ease-in-out infinite',
          }}
        >
          <path
            d="M75 105 C 50 85, 30 110, 35 145 C 50 140, 70 125, 75 105 Z"
            fill="url(#doggoFin)"
            opacity="0.95"
          />
          <path
            d="M72 110 C 55 98, 45 115, 48 135"
            stroke="#5eead4"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Head */}
        <ellipse cx="105" cy="125" rx="46" ry="40" fill="url(#doggoBody)" />

        {/* Right Ear-Fin */}
        <g
          className={earWiggle}
          style={{
            transformOrigin: '140px 100px',
            animation: 'earFlap 2.2s ease-in-out infinite reverse',
          }}
        >
          <path
            d="M135 100 C 160 80, 180 105, 175 140 C 160 135, 140 120, 135 100 Z"
            fill="url(#doggoFin)"
            opacity="0.95"
          />
          <path
            d="M138 105 C 155 93, 165 110, 162 130"
            stroke="#5eead4"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Snout */}
        <path
          d="M80 135 C 80 155, 130 155, 130 135 C 130 125, 80 125, 80 135 Z"
          fill="#fef3c7"
        />

        {/* Nose */}
        <ellipse cx="105" cy="132" rx="7" ry="5" fill="#451a03" />

        {/* Mouth & Blep Tongue */}
        <path
          d="M97 142 Q 105 147 113 142"
          stroke="#78350f"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Pink tongue sticking out if happy or petted */}
        {(happiness > 40 || isPetting) && (
          <path
            d="M102 144 C 102 153, 108 153, 108 144 Z"
            fill="#f43f5e"
            className="animate-pulse"
          />
        )}

        {/* Eyes (Huge, expressive alien doggo eyes) */}
        {/* Left Eye */}
        <g>
          <circle cx="82" cy="112" r="14" fill="#020617" />
          <circle cx="82" cy="112" r="13" fill="url(#eyeGlow)" />
          {/* Big highlight */}
          <circle cx="78" cy="107" r="4.5" fill="#ffffff" />
          {/* Small highlight */}
          <circle cx="85" cy="116" r="2" fill="#ffffff" />
        </g>

        {/* Right Eye */}
        <g>
          <circle cx="128" cy="112" r="14" fill="#020617" />
          <circle cx="128" cy="112" r="13" fill="url(#eyeGlow)" />
          {/* Big highlight */}
          <circle cx="124" cy="107" r="4.5" fill="#ffffff" />
          {/* Small highlight */}
          <circle cx="131" cy="116" r="2" fill="#ffffff" />
        </g>

        {/* Cheeks Blush */}
        <circle cx="68" cy="130" r="8" fill="#fb7185" opacity={happiness > 50 ? 0.6 : 0.25} />
        <circle cx="142" cy="130" r="8" fill="#fb7185" opacity={happiness > 50 ? 0.6 : 0.25} />

        {/* FICSIT Pioneer Mini Collar */}
        <path
          d="M85 160 C 105 172, 125 172, 145 160"
          stroke="#f97316"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Collar Bell / Tag */}
        <circle cx="115" cy="172" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />

        {/* Backpack Pouch (where retrieved items are kept) */}
        <g transform="translate(165, 175)">
          <rect
            x="0"
            y="0"
            width="34"
            height="26"
            rx="5"
            fill="#334155"
            stroke="#f97316"
            strokeWidth="2"
          />
          <line x1="0" y1="10" x2="34" y2="10" stroke="#f97316" strokeWidth="1.5" />
          {hasItem && (
            <circle cx="17" cy="18" r="4" fill="#22c55e" className="animate-ping" />
          )}
        </g>
      </svg>
    </div>
  );
};
