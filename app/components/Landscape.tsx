/**
 * Ilustración de paisaje: cielo, colinas verdes, camino de tierra,
 * coches eléctricos, molinos de viento y placas solares.
 * Decorativa (aria-hidden); se escala para cubrir su contenedor.
 */

function Car({ x, y, scale = 1, flip = false, color = "#4e8a46" }: { x: number; y: number; scale?: number; flip?: boolean; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <ellipse cx="0" cy="17" rx="44" ry="5" fill="#1f3a2a" opacity="0.18" />
      <path d="M-42 8 Q-42 -4 -30 -6 L-18 -8 Q-8 -22 6 -22 L18 -22 Q30 -22 36 -8 L40 -6 Q44 -4 44 6 L44 10 Q44 14 40 14 L-38 14 Q-42 14 -42 10 Z" fill={color} />
      <path d="M-14 -8 Q-6 -19 5 -19 L16 -19 Q25 -19 30 -8 Z" fill="#2b3d3a" />
      <path d="M8 -19 L8 -8" stroke={color} strokeWidth="2.5" />
      <path d="M-40 2 L44 2" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="2" />
      <circle cx="-24" cy="14" r="8" fill="#26302c" />
      <circle cx="-24" cy="14" r="3.5" fill="#9aa59c" />
      <circle cx="26" cy="14" r="8" fill="#26302c" />
      <circle cx="26" cy="14" r="3.5" fill="#9aa59c" />
      <rect x="38" y="-3" width="5" height="3" rx="1.5" fill="#f6efc9" />
    </g>
  );
}

function Tree({ x, y, s = 1, dark = false }: { x: number; y: number; s?: number; dark?: boolean }) {
  const a = dark ? "#3c6e33" : "#4f8a3c";
  const b = dark ? "#2f5a2a" : "#3f7531";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-6" width="6" height="26" rx="2" fill="#6b4f35" />
      <circle cx="0" cy="-22" r="20" fill={a} />
      <circle cx="-14" cy="-10" r="14" fill={b} />
      <circle cx="14" cy="-12" r="15" fill={b} />
      <circle cx="4" cy="-34" r="12" fill={a} />
      <circle cx="-6" cy="-26" r="7" fill="#ffffff" opacity="0.08" />
    </g>
  );
}

function Turbine({ x, y, s = 1, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-2 0 L-4 90 L4 90 L2 0 Z" fill="#f4f6f1" />
      <g className="jombo-turbine" style={{ animationDelay: `${delay}s` }}>
        {[0, 120, 240].map((r) => (
          <path key={r} d="M0 0 L-3 -4 L0 -46 L3 -4 Z" fill="#fbfcf9" transform={`rotate(${r})`} />
        ))}
        <circle r="4" fill="#dfe5dc" />
      </g>
    </g>
  );
}

function SolarField({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) skewX(-18)`}>
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <g key={`${row}-${col}`} transform={`translate(${col * 30} ${row * 14})`}>
            <rect width="27" height="11" fill="#3b5f8f" stroke="#c9d8e8" strokeWidth="1" />
            <path d="M9 0 V11 M18 0 V11 M0 5.5 H27" stroke="#7fa3c9" strokeWidth="0.8" />
          </g>
        ))
      )}
    </g>
  );
}

export default function Landscape({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 640"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="jl-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ec9ea" />
          <stop offset="0.55" stopColor="#cfe9f5" />
          <stop offset="1" stopColor="#eef6e4" />
        </linearGradient>
        <linearGradient id="jl-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fbb5c" />
          <stop offset="1" stopColor="#4f8f3d" />
        </linearGradient>
        <linearGradient id="jl-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6d6b0" />
          <stop offset="1" stopColor="#d4bd8c" />
        </linearGradient>
      </defs>

      {/* Cielo */}
      <rect width="1440" height="640" fill="url(#jl-sky)" />

      {/* Nubes */}
      <g className="jombo-clouds" fill="#ffffff">
        <g opacity="0.9">
          <ellipse cx="260" cy="110" rx="90" ry="26" />
          <ellipse cx="310" cy="92" rx="60" ry="30" />
          <ellipse cx="210" cy="98" rx="46" ry="22" />
        </g>
        <g opacity="0.75">
          <ellipse cx="820" cy="70" rx="110" ry="22" />
          <ellipse cx="870" cy="54" rx="64" ry="26" />
        </g>
        <g opacity="0.85">
          <ellipse cx="1250" cy="150" rx="100" ry="24" />
          <ellipse cx="1290" cy="134" rx="58" ry="26" />
        </g>
      </g>

      {/* Colinas lejanas */}
      <path d="M0 330 Q180 280 360 312 T720 300 T1080 290 T1440 300 V640 H0 Z" fill="#a9cf8e" />
      <path d="M0 360 Q220 318 430 350 T860 336 T1240 330 T1440 340 V640 H0 Z" fill="#94c27a" />

      {/* Molinos y placas solares sobre las colinas */}
      <Turbine x={1040} y={222} s={0.95} />
      <Turbine x={1110} y={210} s={1.1} delay={-1.3} />
      <Turbine x={1180} y={232} s={0.85} delay={-2.1} />
      <Turbine x={1250} y={218} s={1} delay={-0.7} />
      <SolarField x={330} y={318} s={1} />
      <SolarField x={940} y={330} s={0.9} />

      {/* Granja */}
      <g transform="translate(700 300)">
        <rect x="0" y="0" width="34" height="22" fill="#5e9b57" />
        <path d="M-3 0 L17 -14 L37 0 Z" fill="#477c43" />
        <rect x="40" y="-14" width="12" height="36" rx="5" fill="#cfd8cc" />
        <rect x="56" y="4" width="26" height="18" fill="#6aa65f" />
        <path d="M54 4 L69 -6 L84 4 Z" fill="#4f8a49" />
      </g>

      {/* Colinas medias */}
      <path d="M0 420 Q240 360 520 402 T1040 392 T1440 380 V640 H0 Z" fill="#7cb662" />
      <Tree x={150} y={402} s={1.6} dark />
      <Tree x={232} y={392} s={1.1} />
      <Tree x={612} y={394} s={1.2} />
      <Tree x={1330} y={384} s={1.5} dark />
      <Tree x={1250} y={394} s={1} />

      {/* Camino que serpentea hacia el fondo (más estrecho cuanto más lejos) */}
      <g fill="none" stroke="url(#jl-road)" strokeLinecap="round">
        <path d="M700 330 C640 345 650 365 720 378 C790 392 780 410 690 425" strokeWidth="16" />
        <path d="M690 425 C590 445 560 470 640 490 C700 505 750 520 720 540" strokeWidth="34" />
        <path d="M1440 470 C1300 470 1150 500 1000 480 C900 468 820 480 740 515" strokeWidth="24" />
      </g>

      {/* Coches pequeños al fondo */}
      <Car x={661} y={349} scale={0.28} color="#5c9a52" />
      <Car x={598} y={450} scale={0.45} flip color="#4e8a46" />
      <Car x={1224} y={476} scale={0.5} flip color="#5c9a52" />

      {/* Primer plano */}
      <path d="M0 500 Q300 450 620 488 T1180 478 T1440 470 V640 H0 Z" fill="url(#jl-grass)" />
      {/* Camino principal */}
      <path d="M720 540 C680 570 520 590 380 660" fill="none" stroke="url(#jl-road)" strokeWidth="72" strokeLinecap="round" />
      <path d="M720 540 C680 570 520 590 380 660" fill="none" stroke="#f1e6c8" strokeWidth="3" strokeDasharray="2 22" strokeLinecap="round" opacity="0.7" />

      <Car x={590} y={570} scale={1} color="#4f8a46" />

      {/* Hierba */}
      <g stroke="#3f7a33" strokeWidth="3" strokeLinecap="round" opacity="0.55" fill="none">
        <path d="M40 640 q6 -30 14 -46 M60 640 q-2 -26 -10 -40 M90 640 q4 -34 18 -48" />
        <path d="M1320 640 q6 -30 14 -46 M1350 640 q-2 -26 -10 -40 M1380 640 q4 -34 18 -48 M1410 640 q-4 -24 -14 -36" />
        <path d="M980 640 q4 -22 12 -34 M1004 640 q-2 -20 -8 -30" />
      </g>
    </svg>
  );
}

/** Silueta de colinas para separar secciones (p. ej. encima del footer) */
export function HillsDivider({ className = "", color = "var(--brand-dark)" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M0 80 V48 Q180 10 380 38 T760 30 T1120 22 T1440 40 V80 Z" fill={color} />
    </svg>
  );
}
