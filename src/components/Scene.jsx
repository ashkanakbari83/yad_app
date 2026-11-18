import { mulberry32 } from '../lib/rng.js';

/** Cheap static SVG backdrops, one per world. All three share the same design language. */
export default function Scene({ world = 'ch3', dim = false }) {
  const rng = mulberry32(world.charCodeAt(2) * 97);
  const sparks = Array.from({ length: 22 }, () => ({ x: rng() * 960, y: 20 + rng() * 330, r: 1.4 + rng() * 2.6, o: 0.35 + rng() * 0.6 }));
  return (
    <svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-hidden style={dim ? { opacity: 0.55 } : undefined}>
      <defs>
        <radialGradient id={`glow-${world}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={world === 'ch2' ? 160 : 780} cy="120" r="90" fill={`url(#glow-${world})`} opacity="0.55" />
      <circle cx={world === 'ch2' ? 160 : 780} cy="120" r="38" fill="#fff" opacity="0.85" />
      {sparks.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />)}
      {world === 'ch1' && <Crystals />}
      {world === 'ch2' && <Meadow />}
      {world === 'ch3' && <Forest rng={rng} />}
    </svg>
  );
}

function Crystals() {
  const tri = (x, h, w, c, o = 1) => <polygon points={`${x},540 ${x + w / 2},${540 - h} ${x + w},540`} fill={c} opacity={o} />;
  return (
    <g>
      <path d="M0 400 L120 300 L230 380 L360 260 L500 390 L640 280 L780 380 L900 300 L960 350 L960 540 L0 540Z" fill="#1d2a6b" opacity="0.65" />
      <path d="M0 450 L140 380 L260 440 L420 350 L560 440 L720 370 L860 440 L960 400 L960 540 L0 540Z" fill="#16215a" />
      {tri(90, 170, 60, '#7be0ff', 0.9)}{tri(150, 120, 44, '#bdf0ff', 0.9)}{tri(520, 210, 76, '#7be0ff', 0.85)}
      {tri(600, 140, 50, '#c7f2ff', 0.9)}{tri(820, 180, 64, '#7be0ff', 0.9)}{tri(300, 110, 40, '#a8e8ff', 0.8)}
    </g>
  );
}

function Meadow() {
  const pie = (cx, cy, r, slices, lit, key) => {
    const out = [];
    for (let i = 0; i < slices; i++) {
      const a0 = (i / slices) * Math.PI * 2 - Math.PI / 2;
      const a1 = ((i + 1) / slices) * Math.PI * 2 - Math.PI / 2;
      const d = `M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}Z`;
      out.push(<path key={`${key}${i}`} d={d} fill={i < lit ? '#ffd24d' : '#fff7d1'} stroke="#e0a200" strokeWidth="2.5" strokeLinejoin="round" />);
    }
    return out;
  };
  return (
    <g>
      <path d="M0 400 C160 340 300 420 480 370 C660 320 800 400 960 350 L960 540 L0 540Z" fill="#2fa588" opacity="0.7" />
      <path d="M0 450 C200 410 340 480 520 440 C700 400 840 470 960 430 L960 540 L0 540Z" fill="#1e8a70" />
      {pie(150, 420, 46, 4, 3, 'a')}{pie(360, 452, 36, 6, 2, 'b')}{pie(790, 405, 52, 8, 5, 'c')}
    </g>
  );
}

function Forest({ rng }) {
  const trees = [60, 190, 330, 540, 690, 830, 920];
  return (
    <g>
      <path d="M0 420 C120 360 260 430 400 390 C560 345 700 420 960 370 L960 540 L0 540Z" fill="#2a1760" opacity="0.8" />
      {trees.map((x, i) => {
        const h = 120 + ((i * 37) % 60);
        return (
          <g key={x}>
            <rect x={x - 7} y={470 - h * 0.45} width="14" height={h * 0.5} rx="6" fill="#1d1048" />
            <circle cx={x} cy={470 - h * 0.6} r={h * 0.42} fill="#3a1d86" />
            <circle cx={x - h * 0.24} cy={470 - h * 0.45} r={h * 0.3} fill="#4a28a0" />
            <circle cx={x + h * 0.26} cy={470 - h * 0.45} r={h * 0.28} fill="#42239a" />
          </g>
        );
      })}
      <path d="M0 480 C200 450 360 500 560 470 C740 445 860 495 960 470 L960 540 L0 540Z" fill="#241250" />
      {[110, 260, 430, 610, 770, 880].map((x, i) => {
        const y = 170 + ((i * 53) % 120);
        return (
          <g key={x}>
            <circle cx={x} cy={y} r="30" fill="#ffd66e" opacity="0.28" />
            <path d={`M${x} ${y - 46}V${y - 20}`} stroke="#6a4a2a" strokeWidth="3" />
            <rect x={x - 11} y={y - 22} width="22" height="30" rx="9" fill="#ffc857" stroke="#c88400" strokeWidth="2.5" />
          </g>
        );
      })}
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={30 + rng() * 900} cy={300 + rng() * 150} r={2 + rng() * 2} fill="#fff3b8" opacity="0.9" />
      ))}
    </g>
  );
}
