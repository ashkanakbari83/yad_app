import { useEffect } from 'react';
import { ScaleCtx, useWindowSize } from './ui.jsx';

const W = 960;
const H = 540;
const MAX_W = 1300;

/** Fixed 16:9 canvas, scaled to fit the window (landscape-first, phone friendly). */
export default function Frame({ children, world, reduceMotion }) {
  const { w, h } = useWindowSize();
  const scale = Math.min(w / W, h / H);
  // phones are wider than 16:9: keep the 960x540 game column centred and let backgrounds fill the extra width
  const vw = Math.min(MAX_W, Math.max(W, w / scale));
  const gx = (vw - W) / 2;
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const portrait = coarse && h > w;
  useEffect(() => {
    document.documentElement.dataset.motion = reduceMotion ? 'reduced' : 'full';
  }, [reduceMotion]);
  return (
    <div className="viewport" data-world={world}>
      <div className="frame" data-world={world} style={{ width: vw, '--gx': `${gx}px`, transform: `scale(${scale})`, left: (w - vw * scale) / 2, top: (h - H * scale) / 2 }}>
        <ScaleCtx.Provider value={scale}>{children}</ScaleCtx.Provider>
      </div>
      {portrait && (
        <div className="rotate-hint" role="alert">
          <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#ffc93c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M20.5 9.5a8.5 8.5 0 00-3-5M3.5 14.5a8.5 8.5 0 003 5" /><path d="M19 3.5l-2.2 1.2 1.6 2" />
          </svg>
          <div>برای بازی، گوشی را افقی بچرخان</div>
        </div>
      )}
    </div>
  );
}
