export const Coin = (p) => (
  <svg viewBox="0 0 32 32" {...p}>
    <circle cx="16" cy="16" r="14" fill="#ffb800" /><circle cx="16" cy="16" r="14" fill="none" stroke="#c88400" strokeWidth="2" />
    <circle cx="16" cy="16" r="9" fill="#ffd54a" stroke="#e09a00" strokeWidth="1.5" />
    <path d="M12.5 11.5h7M16 11.5v9" stroke="#b87300" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);
export const Star = ({ on = true, ...p }) => (
  <svg viewBox="0 0 32 32" {...p}>
    <path d="M16 3l3.8 8 8.7 1.2-6.3 6.1 1.5 8.7L16 22.8 8.3 27l1.5-8.7L3.5 12.2 12.2 11z"
      fill={on ? '#ffc93c' : 'rgba(255,255,255,.35)'} stroke={on ? '#e09a00' : 'rgba(31,35,80,.25)'}
      strokeWidth="2" strokeLinejoin="round" />
  </svg>
);
export const Lock = (p) => (
  <svg viewBox="0 0 24 24" {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor" />
    <path d="M8 10.5V8a4 4 0 018 0v2.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);
export const Gear = (p) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path fill="currentColor" d="M12 8.6a3.4 3.4 0 100 6.8 3.4 3.4 0 000-6.8zm8.2 4.7l1.7 1.3-1.9 3.3-2-.8a7.5 7.5 0 01-1.7 1l-.3 2.1h-3.8l-.3-2.1a7.5 7.5 0 01-1.7-1l-2 .8-1.9-3.3 1.7-1.3a7.8 7.8 0 010-2l-1.7-1.3 1.9-3.3 2 .8a7.5 7.5 0 011.7-1l.3-2.1h3.8l.3 2.1a7.5 7.5 0 011.7 1l2-.8 1.9 3.3-1.7 1.3a7.8 7.8 0 010 2z" />
  </svg>
);
export const Back = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Close = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" /></svg>
);
export const Check = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Play = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
);
export const Backspace = (p) => (
  <svg viewBox="0 0 28 24" {...p}>
    <path d="M9 3h15a2 2 0 012 2v14a2 2 0 01-2 2H9L2 12z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M13 8.5l7 7M20 8.5l-7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);
export const Medal = ({ color = '#ffc93c', ...p }) => (
  <svg viewBox="0 0 32 40" {...p}>
    <path d="M8 2h6l3 11h-6zM24 2h-6l-3 11h6z" fill="#7b5cff" />
    <circle cx="16" cy="26" r="11" fill={color} stroke="#c88400" strokeWidth="2" />
    <path d="M16 19l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="#fff" opacity=".85" />
  </svg>
);
export const Chest = (p) => (
  <svg viewBox="0 0 40 36" {...p}>
    <rect x="3" y="14" width="34" height="19" rx="4" fill="#b8742f" stroke="#7a4a17" strokeWidth="2" />
    <path d="M3 18a4 4 0 014-4h26a4 4 0 014 4v0H3z" fill="#d89045" stroke="#7a4a17" strokeWidth="2" />
    <path d="M5 14c0-6 6-10 15-10s15 4 15 10z" fill="#d89045" stroke="#7a4a17" strokeWidth="2" />
    <rect x="16" y="15" width="8" height="9" rx="2" fill="#ffc93c" stroke="#c88400" strokeWidth="1.6" />
  </svg>
);
/** Lantern with a glow level 0..1 (used as the mastery meter). */
export function Lantern({ level = 0, size = 44, id = 'l' }) {
  const lit = Math.max(0, Math.min(1, level));
  return (
    <svg viewBox="0 0 40 56" width={size} height={size * 1.4} aria-hidden>
      <defs>
        <radialGradient id={`g${id}`} cx="50%" cy="55%" r="60%">
          <stop offset="0" stopColor="#fff6c8" /><stop offset="1" stopColor="#ffc93c" />
        </radialGradient>
      </defs>
      <path d="M20 2v7" stroke="#6a4a2a" strokeWidth="3" strokeLinecap="round" />
      <rect x="10" y="8" width="20" height="5" rx="2.5" fill="#6a4a2a" />
      <path d="M8 16a12 12 0 0124 0v15a12 12 0 01-24 0z" fill="#3a2f66" stroke="#6a4a2a" strokeWidth="2" />
      <path d="M10.5 16a9.5 9.5 0 0119 0v15a9.5 9.5 0 01-19 0z" fill={`url(#g${id})`} opacity={0.12 + 0.88 * lit} />
      {lit > 0.7 && <circle cx="20" cy="24" r="17" fill="#ffe28a" opacity="0.28" />}
      <rect x="12" y="46" width="16" height="5" rx="2.5" fill="#6a4a2a" />
    </svg>
  );
}

/** Bridge plank with a glow level 0..1 (mastery meter of the bridge stage). */
export function Plank({ level = 0, size = 44, id = 'p' }) {
  const lit = Math.max(0, Math.min(1, level));
  return (
    <svg viewBox="0 0 64 44" width={size * 1.45} height={size} aria-hidden>
      <defs>
        <linearGradient id={`pg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe28a" /><stop offset="1" stopColor="#f2a93b" />
        </linearGradient>
      </defs>
      {lit > 0.7 && <ellipse cx="32" cy="22" rx="31" ry="20" fill="#ffe28a" opacity="0.25" />}
      <rect x="3" y="9" width="58" height="26" rx="6" fill="#4a3a7a" stroke="#6a4a2a" strokeWidth="2.5" />
      <rect x="5.5" y="11.5" width="53" height="21" rx="4" fill={`url(#pg${id})`} opacity={0.14 + 0.86 * lit} />
      <path d="M12 18h40M12 26h40" stroke="#6a4a2a" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
      <circle cx="10" cy="22" r="2" fill="#6a4a2a" /><circle cx="54" cy="22" r="2" fill="#6a4a2a" />
    </svg>
  );
}

/** Crystal with a glow level 0..1 (mastery meter of chapter 1). */
export function Crystal({ level = 0, size = 44, id = 'c' }) {
  const lit = Math.max(0, Math.min(1, level));
  return (
    <svg viewBox="0 0 40 52" width={size * 0.8} height={size} aria-hidden>
      <defs><linearGradient id={`cg${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c7f2ff" /><stop offset="1" stopColor="#4cc9f0" /></linearGradient></defs>
      {lit > 0.7 && <ellipse cx="20" cy="28" rx="19" ry="24" fill="#7be0ff" opacity="0.25" />}
      <polygon points="20,3 34,18 28,48 12,48 6,18" fill="#3b3f87" stroke="#6a72d6" strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="20,6 31,18 26,45 14,45 9,18" fill={`url(#cg${id})`} opacity={0.14 + 0.86 * lit} />
      <path d="M20 6L16 18L20 45M9 18H31" stroke="#fff" strokeWidth="1.5" opacity={0.15 + 0.4 * lit} fill="none" />
    </svg>
  );
}

/** The mastery meter icon of a stage definition. */
export const Meter = ({ kind, ...p }) => (kind === 'plank' ? <Plank {...p} /> : kind === 'crystal' ? <Crystal {...p} /> : <Lantern {...p} />);
