import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { faNum } from '../lib/fa.js';
import { Coin, Back, Gear } from './Icons.jsx';

export const ScaleCtx = createContext(1);
export const useScale = () => useContext(ScaleCtx);

/** A number rendered left-to-right with Persian digits and "/" as the decimal sign. */
export const Num = ({ v, className = '' }) => <bdi dir="ltr" className={`num ${className}`}>{faNum(v)}</bdi>;

/** Stacked fraction, like the book. */
export function Frac({ n, d, size = 1 }) {
  return (
    <span className="frac" style={{ fontSize: `${size}em` }}>
      <span><Num v={n} /></span><span><Num v={d} /></span>
    </span>
  );
}

export const CoinChip = ({ coins }) => (
  <span className="chip" aria-label="سکه"><Coin /> <Num v={coins} /></span>
);

export function TopBar({ title, onBack, right, backLabel = 'برگشت' }) {
  return (
    <div className="topbar layer">
      {onBack && (
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onBack} aria-label={backLabel} style={{ width: 60 }}>
          <Back width="26" height="26" />
        </button>
      )}
      <div className="title on-world">{title}</div>
      {right}
    </div>
  );
}

export const GearButton = ({ onClick }) => (
  <button className="btn btn-ghost btn-icon btn-sm" onClick={onClick} aria-label="تنظیمات" style={{ width: 60 }}>
    <Gear width="28" height="28" />
  </button>
);

export function Toast({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return undefined;
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  return msg ? <div className="toast" role="status">{msg}</div> : null;
}

export function useWindowSize() {
  const read = () => ({ w: window.innerWidth, h: window.innerHeight });
  const [size, setSize] = useState(read);
  useLayoutEffect(() => {
    const f = () => setSize(read());
    window.addEventListener('resize', f);
    const t = setTimeout(f, 350); // mobile browsers settle the viewport after launch / rotation
    window.addEventListener('orientationchange', f);
    return () => { clearTimeout(t); window.removeEventListener('resize', f); window.removeEventListener('orientationchange', f); };
  }, []);
  return size;
}

/**
 * A chip that can be tapped OR dragged onto an element with data-drop="<id>".
 * Dragging moves the chip itself (scale-corrected); drop target found with elementsFromPoint.
 */
export function Chip({ onTap, onDropOn, disabled, className = '', children, ...rest }) {
  const scale = useScale();
  const start = useRef(null);
  const [off, setOff] = useState(null);
  const down = (e) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const move = (e) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.moved && Math.hypot(dx, dy) < 9) return;
    s.moved = true;
    setOff({ x: dx / scale, y: dy / scale });
  };
  const up = (e) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    if (s.moved) {
      const hit = document.elementsFromPoint(e.clientX, e.clientY).find((el) => el.closest?.('[data-drop]'));
      const id = hit?.closest('[data-drop]')?.dataset.drop;
      if (id && onDropOn) onDropOn(id);
    } else if (onTap) onTap();
    setOff(null);
  };
  return (
    <button
      type="button"
      className={`dchip ${className} ${off ? 'dragging' : ''}`}
      style={off ? { transform: `translate(${off.x}px, ${off.y}px) scale(1.08)`, zIndex: 40 } : undefined}
      disabled={disabled}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={() => { start.current = null; setOff(null); }}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onTap) { e.preventDefault(); onTap(); } }}
      {...rest}
    >
      {children}
    </button>
  );
}
