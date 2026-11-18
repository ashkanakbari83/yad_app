import { useState, useCallback } from 'react';
import Scene from '../components/Scene.jsx';
import { Lock, Star } from '../components/Icons.jsx';
import { CoinChip, Num, Toast, TopBar } from '../components/ui.jsx';
import { WORLDS, worldById } from '../data/worlds.js';
import { useGame } from '../lib/game.jsx';

export function WorldList({ go, onBack }) {
  const { state, dispatch } = useGame();
  return (
    <div className="screen" data-world={state.lastWorld}>
      <div className="world-bg" style={{ background: 'linear-gradient(180deg,#1b1450,#3b2a8a)' }} />
      <TopBar title="نقشه‌ی دنیاها" onBack={onBack} right={<CoinChip coins={state.coins} />} />
      <div className="map-worlds layer">
        {WORLDS.map((w) => {
          const ready = w.nodes.filter((n) => n.ready).length;
          return (
            <button
              key={w.id} className="world-card" data-world={w.id} aria-current={state.lastWorld === w.id}
              style={{ '--w-a': w.theme.a, '--w-b': w.theme.b, '--w-accent': w.theme.accent }}
              onClick={() => { dispatch({ type: 'world', id: w.id }); go('world', { worldId: w.id }); }}
            >
              <div className="scene"><Scene world={w.id} /></div>
              <div className="wc-body">
                <div className="wc-ch">فصل <Num v={w.chapter} /></div>
                <div className="wc-name">{w.fa}</div>
                <div className="wc-topic">{w.topic}</div>
                <div className="wc-stat">{ready ? <>مرحله‌ی آماده: <Num v={ready} /> از <Num v={w.nodes.length} /></> : <>به‌زودی · <Num v={w.nodes.length} /> مرحله</>}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Winding path of stages for one world. */
export function WorldPath({ worldId, go, onBack }) {
  const { state } = useGame();
  const w = worldById(worldId);
  const [toast, setToast] = useState('');
  const clear = useCallback(() => setToast(''), []);
  const N = w.nodes.length;
  const W = 900;
  const H = 360;
  const pts = w.nodes.map((n, i) => ({
    n,
    x: W - 60 - (i * (W - 120)) / Math.max(1, N - 1),
    y: H / 2 + Math.sin(i * 1.35 + 0.4) * 105,
  }));
  const d = pts.map((p, i) => {
    if (i === 0) return `M${p.x} ${p.y}`;
    const q = pts[i - 1];
    const mx = (p.x + q.x) / 2;
    return `C${mx} ${q.y} ${mx} ${p.y} ${p.x} ${p.y}`;
  }).join(' ');
  return (
    <div className="screen" data-world={w.id} style={{ '--w-a': w.theme.a, '--w-b': w.theme.b, '--w-accent': w.theme.accent, '--w-glow': w.theme.glow }}>
      <div className="world-bg"><Scene world={w.id} /></div>
      <TopBar title={<>{w.fa} <span style={{ fontSize: 18, fontWeight: 700 }}>· {w.topic}</span></>} onBack={onBack} right={<CoinChip coins={state.coins} />} />
      <div className="path-wrap layer" style={{ margin: '0 20px 10px' }}>
        <svg className="path" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
          <path d={d} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="22" strokeLinecap="round" />
          <path d={d} fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 16" />
        </svg>
        {pts.map(({ n, x, y }, i) => {
          const st = n.stageId ? state.stages[n.stageId] : null;
          return (
            <button
              key={n.id} className={`node ${n.ready ? 'ready' : 'soon'}`}
              style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}
              onClick={() => (n.ready ? go('stage', { stageId: n.stageId }) : setToast(`«${n.fa}» به‌زودی باز می‌شود`))}
              aria-label={`${n.fa}${n.ready ? '' : ' (به‌زودی)'}`}
            >
              <span className="dot"><Num v={i + 1} />
                {!n.ready && <span className="lockb"><Lock /></span>}
                {n.ready && st?.bestStars > 0 && (
                  <span className="stars">{[1, 2, 3].map((s) => <Star key={s} on={s <= st.bestStars} />)}</span>
                )}
              </span>
              <span className="lbl">{n.fa}{!n.ready && <><br /><span style={{ fontWeight: 600, fontSize: 12.5 }}>صفحه‌ی <Num v={n.pages} /> کتاب</span></>}</span>
            </button>
          );
        })}
      </div>
      <Toast msg={toast} onDone={clear} />
    </div>
  );
}
