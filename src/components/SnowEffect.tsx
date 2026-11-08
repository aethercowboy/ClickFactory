import React, { useMemo } from 'react';

interface Snowflake {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  swayDistance: number;
}

export const SnowEffect: React.FC = () => {
  // Generate 48 snowflakes with deterministic distributed properties
  const snowflakes = useMemo<Snowflake[]>(() => {
    const list: Snowflake[] = [];
    for (let i = 0; i < 48; i++) {
      list.push({
        id: i,
        left: ((i * 2.083) % 100),
        size: 3 + ((i * 7) % 7) * 1.2, // 3px to 10.2px
        duration: 5.5 + ((i * 3) % 8) * 1.1, // 5.5s to 13.2s
        delay: -(((i * 5) % 12) * 0.9), // staggered start
        opacity: 0.25 + ((i * 11) % 6) * 0.12, // 0.25 to 0.85
        swayDistance: 15 + ((i * 9) % 25), // 15px to 40px sway
      });
    }
    return list;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden select-none"
    >
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) translateX(0);
          }
          50% {
            transform: translateY(50vh) translateX(var(--sway));
          }
          100% {
            transform: translateY(105vh) translateX(0);
          }
        }
      `}</style>

      {snowflakes.map(flake => (
        <span
          key={flake.id}
          className="absolute rounded-full bg-white block"
          style={
            {
              left: `${flake.left}%`,
              top: '-15px',
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.75)',
              '--sway': `${flake.id % 2 === 0 ? flake.swayDistance : -flake.swayDistance}px`,
              animation: `snowfall ${flake.duration}s linear infinite`,
              animationDelay: `${flake.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
