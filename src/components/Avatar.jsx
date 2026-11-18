import { COLORS } from '../data/avatarItems.js';

const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};
const HAT_DY = { blob: 0, cat: 2, dragon: 0, star: -24 };
const FACE_DY = { blob: 0, cat: 0, dragon: 0, star: 4 };
const INK = '#2a2d5a';

function Back({ kind }) {
  if (kind === 'cape') {
    return (
      <g>
        <path d="M60 112 C40 150 28 190 24 218 L176 218 C172 190 160 150 140 112Z" fill="#e0457b" />
        <path d="M70 118 C58 150 52 185 50 218 L150 218 C148 185 142 150 130 118Z" fill="#ff6f9e" opacity=".55" />
      </g>
    );
  }
  if (kind === 'wings') {
    return (
      <g fill="#fff" stroke="#c8ccf5" strokeWidth="3">
        <ellipse cx="32" cy="118" rx="34" ry="15" transform="rotate(-32 32 118)" />
        <ellipse cx="38" cy="148" rx="26" ry="11" transform="rotate(-8 38 148)" />
        <ellipse cx="168" cy="118" rx="34" ry="15" transform="rotate(32 168 118)" />
        <ellipse cx="162" cy="148" rx="26" ry="11" transform="rotate(8 162 148)" />
      </g>
    );
  }
  return null;
}

function Body({ base, c, d, l }) {
  const limbs = (
    <g fill={d}>
      <ellipse cx="72" cy="196" rx="21" ry="12" /><ellipse cx="128" cy="196" rx="21" ry="12" />
      <ellipse cx="38" cy="146" rx="13" ry="20" transform="rotate(18 38 146)" />
      <ellipse cx="162" cy="146" rx="13" ry="20" transform="rotate(-18 162 146)" />
    </g>
  );
  if (base === 'star') {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 76 : 42;
      const a = (-90 + i * 36) * (Math.PI / 180);
      pts.push(`${(100 + r * Math.cos(a)).toFixed(1)},${(130 + r * Math.sin(a)).toFixed(1)}`);
    }
    return (
      <g>
        <polygon points={pts.join(' ')} fill={c} stroke={c} strokeWidth="16" strokeLinejoin="round" />
        <ellipse cx="100" cy="146" rx="30" ry="24" fill={l} opacity=".55" />
      </g>
    );
  }
  return (
    <g>
      {base === 'dragon' && <path d="M150 176 C182 176 192 150 184 128" fill="none" stroke={d} strokeWidth="16" strokeLinecap="round" />}
      {limbs}
      {base === 'cat' && (
        <g>
          <polygon points="46,100 54,44 96,76" fill={c} stroke={c} strokeWidth="8" strokeLinejoin="round" />
          <polygon points="154,100 146,44 104,76" fill={c} stroke={c} strokeWidth="8" strokeLinejoin="round" />
          <polygon points="58,84 61,60 82,76" fill="#ffb3cf" /><polygon points="142,84 139,60 118,76" fill="#ffb3cf" />
        </g>
      )}
      {base === 'dragon' && (
        <g fill="#ffe08a" stroke="#e0b030" strokeWidth="3" strokeLinejoin="round">
          <polygon points="64,84 56,46 86,74" /><polygon points="136,84 144,46 114,74" />
        </g>
      )}
      <ellipse cx="100" cy="134" rx="66" ry="62" fill={c} />
      <ellipse cx="100" cy="158" rx="40" ry="30" fill={l} opacity=".55" />
      {base === 'dragon' && (
        <g fill={d} opacity=".5"><circle cx="64" cy="100" r="5" /><circle cx="136" cy="100" r="5" /><circle cx="100" cy="82" r="4" /></g>
      )}
    </g>
  );
}

function Eyes({ kind, mood, dy }) {
  const y = 124 + dy;
  const look = mood === 'think' ? { x: -3, y: -3 } : { x: 0, y: 1 };
  if (kind === 'happy' && mood !== 'oops') {
    return (
      <g fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round">
        <path d={`M68 ${y + 2} Q80 ${y - 12} 92 ${y + 2}`} /><path d={`M108 ${y + 2} Q120 ${y - 12} 132 ${y + 2}`} />
      </g>
    );
  }
  const eye = (cx) => (
    <g key={cx}>
      {kind === 'star' ? (
        <>
          <circle cx={cx} cy={y} r="12" fill={INK} />
          <path d={`M${cx - 4} ${y - 5}l1.6 3.2 3.4.5-2.5 2.4.6 3.5-3.1-1.7-3.1 1.7.6-3.5-2.5-2.4 3.4-.5z`} fill="#fff" transform={`translate(${cx - cx + 3},0)`} />
          <circle cx={cx - 4} cy={y + 5} r="2" fill="#fff" opacity=".8" />
        </>
      ) : (
        <>
          <circle cx={cx} cy={y} r="13" fill="#fff" stroke={INK} strokeWidth="2.5" />
          <circle cx={cx + look.x} cy={y + look.y} r="7.5" fill={INK} />
          <circle cx={cx + look.x - 2.5} cy={y + look.y - 3} r="2.6" fill="#fff" />
        </>
      )}
    </g>
  );
  return <g>{eye(80)}{eye(120)}</g>;
}

function Mouth({ mood, dy }) {
  const y = 148 + dy;
  if (mood === 'happy') {
    return (
      <g>
        <path d={`M82 ${y - 3} Q100 ${y + 28} 118 ${y - 3} Z`} fill="#5a2a4a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="100" cy={y + 12} rx="9" ry="5.5" fill="#ff8aa8" />
      </g>
    );
  }
  if (mood === 'oops') return <path d={`M86 ${y + 8} Q100 ${y - 4} 114 ${y + 8}`} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />;
  if (mood === 'think') return <ellipse cx="104" cy={y + 5} rx="6" ry="7" fill="#5a2a4a" stroke={INK} strokeWidth="3" />;
  return <path d={`M84 ${y} Q100 ${y + 14} 116 ${y}`} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />;
}

function Hat({ kind }) {
  switch (kind) {
    case 'sprout':
      return (
        <g>
          <path d="M100 84 C100 74 100 68 100 58" stroke="#2f9e44" strokeWidth="6" strokeLinecap="round" fill="none" />
          <ellipse cx="86" cy="56" rx="16" ry="8.5" fill="#51cf66" transform="rotate(-28 86 56)" stroke="#2f9e44" strokeWidth="2.5" />
          <ellipse cx="114" cy="56" rx="16" ry="8.5" fill="#69db7c" transform="rotate(28 114 56)" stroke="#2f9e44" strokeWidth="2.5" />
        </g>
      );
    case 'cap':
      return (
        <g>
          <path d="M60 88 Q60 48 100 48 Q140 48 140 88 Z" fill="#4c6fff" stroke="#3550d6" strokeWidth="3" strokeLinejoin="round" />
          <path d="M116 84 Q166 78 162 94 Q132 96 112 90Z" fill="#3550d6" />
          <circle cx="100" cy="48" r="5" fill="#ffc93c" />
        </g>
      );
    case 'flower':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={100 + 16 * Math.cos((a * Math.PI) / 180)} cy={66 + 16 * Math.sin((a * Math.PI) / 180)} r="11" fill="#ff8fb8" stroke="#e0507f" strokeWidth="2" />
          ))}
          <circle cx="100" cy="66" r="10" fill="#ffd43b" stroke="#e09a00" strokeWidth="2" />
        </g>
      );
    case 'wizard':
      return (
        <g>
          <path d="M62 90 L100 14 L138 90 Z" fill="#6b4cff" stroke="#4a30c8" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="100" cy="90" rx="50" ry="10" fill="#5a3de0" stroke="#4a30c8" strokeWidth="3" />
          <rect x="76" y="74" width="48" height="9" fill="#ffc93c" />
          <path d="M96 50l2 4 4.4.6-3.2 3 .8 4.4-4-2.1-4 2.1.8-4.4-3.2-3 4.4-.6z" fill="#ffe28a" />
          <circle cx="112" cy="38" r="2.5" fill="#ffe28a" /><circle cx="90" cy="64" r="2" fill="#ffe28a" />
        </g>
      );
    case 'crown':
      return (
        <g>
          <path d="M64 88 L68 52 L88 72 L100 44 L112 72 L132 52 L136 88 Z" fill="#ffc93c" stroke="#d99700" strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="100" cy="64" r="5" fill="#ff5c8a" /><circle cx="80" cy="76" r="3.6" fill="#4c9aff" /><circle cx="120" cy="76" r="3.6" fill="#35c57a" />
        </g>
      );
    default:
      return null;
  }
}

function FaceAcc({ kind, dy }) {
  if (kind === 'glasses') {
    const y = 124 + dy;
    return (
      <g fill="rgba(255,255,255,.28)" stroke={INK} strokeWidth="4">
        <circle cx="80" cy={y} r="17" /><circle cx="120" cy={y} r="17" />
        <path d={`M97 ${y}h6`} fill="none" /><path d={`M63 ${y - 2}L54 ${y - 8}M137 ${y - 2}L146 ${y - 8}`} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (kind === 'bowtie') {
    return (
      <g fill="#ff5c8a" stroke="#d93a6a" strokeWidth="3" strokeLinejoin="round">
        <path d="M100 184 L74 170 L74 198Z" /><path d="M100 184 L126 170 L126 198Z" /><circle cx="100" cy="184" r="8" />
      </g>
    );
  }
  if (kind === 'scarf') {
    return (
      <g>
        <path d="M54 172 Q100 194 146 172 L148 190 Q100 212 52 190Z" fill="#ff7a59" stroke="#d9553a" strokeWidth="3" strokeLinejoin="round" />
        <path d="M128 192 L142 224 L120 226 L116 196Z" fill="#ff9a7d" stroke="#d9553a" strokeWidth="3" strokeLinejoin="round" />
        <path d="M70 182v10M90 188v10M110 188v10" stroke="#ffd0c2" strokeWidth="3.5" strokeLinecap="round" opacity=".8" />
      </g>
    );
  }
  return null;
}

/** Modular avatar: base + color + eyes + hat + face accessory + back accessory, with moods. */
export default function Avatar({ avatar, mood = 'idle', size = 160, animate = true, className = '' }) {
  const col = COLORS.find((c) => c.id === avatar.color)?.hex || COLORS[0].hex;
  const c = col;
  const d = shade(col, -0.2);
  const l = shade(col, 0.55);
  const base = avatar.base || 'blob';
  const fdy = FACE_DY[base] ?? 0;
  const cls = `avatar ${animate ? `av-${mood}` : ''} ${className}`;
  return (
    <svg viewBox="0 0 200 232" width={size} height={size * 1.16} className={cls} role="img" aria-label="شخصیت تو">
      <ellipse cx="100" cy="218" rx="58" ry="8" fill="#14102e" opacity=".2" />
      <g className="av-body">
        <Back kind={avatar.back} />
        <Body base={base} c={c} d={d} l={l} />
        <g transform={mood === 'oops' ? 'rotate(-3 100 130)' : undefined}>
          <circle cx="66" cy={146 + fdy} r="8" fill="#ff7eb6" opacity=".45" /><circle cx="134" cy={146 + fdy} r="8" fill="#ff7eb6" opacity=".45" />
          <Eyes kind={avatar.eyes} mood={mood} dy={fdy} />
          <Mouth mood={mood} dy={fdy} />
          {mood === 'oops' && <path d="M70 104l14 5M130 104l-14 5" stroke={INK} strokeWidth="4" strokeLinecap="round" />}
          <FaceAcc kind={avatar.acc === 'glasses' ? 'glasses' : 'none'} dy={fdy} />
        </g>
        {(avatar.acc === 'bowtie' || avatar.acc === 'scarf') && <FaceAcc kind={avatar.acc} dy={fdy} />}
        <g transform={`translate(0 ${HAT_DY[base] ?? 0})`}><Hat kind={avatar.hat} /></g>
      </g>
    </svg>
  );
}

/** Small lit orb that gives hints. */
export function Firefly({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="firefly" aria-hidden>
      <defs>
        <radialGradient id="ffg" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fffbe0" /><stop offset="0.5" stopColor="#ffe28a" /><stop offset="1" stopColor="#ffc93c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="36" r="28" fill="url(#ffg)" className="ff-orb" />
      <ellipse cx="22" cy="22" rx="11" ry="6.5" fill="#fff" opacity=".85" className="ff-wing" transform="rotate(-30 22 22)" />
      <ellipse cx="42" cy="22" rx="11" ry="6.5" fill="#fff" opacity=".85" className="ff-wing" transform="rotate(30 42 22)" />
      <circle cx="32" cy="36" r="10" fill="#ffd54a" stroke="#e0a200" strokeWidth="2" />
      <circle cx="28.5" cy="34" r="1.8" fill="#4a3300" /><circle cx="35.5" cy="34" r="1.8" fill="#4a3300" />
      <path d="M28.5 39q3.5 3 7 0" stroke="#4a3300" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}
