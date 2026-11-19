// Views for stage ch1-2 («پل مضرب‌ها»): number table painting, multiples row, queue, relation table.
import { Fragment, useRef, useState } from 'react';
import { Num } from './ui.jsx';

/** Number table 1..N, 10 per row, LTR like the book. Tap or drag to paint. */
export function MultGrid({ N, painted, onChange, disabled = false, outline = [], tone = null, size = 'md' }) {
  const mode = useRef('paint');
  const dragging = useRef(false);
  const apply = (v) => {
    if (disabled || !onChange) return;
    const has = painted.has(v);
    if (mode.current === 'paint' && has) return;
    if (mode.current === 'erase' && !has) return;
    const next = new Set(painted);
    if (mode.current === 'paint') next.add(v); else next.delete(v);
    onChange(next);
  };
  const down = (e) => {
    const v = Number(e.target.closest('[data-v]')?.dataset.v);
    if (!v || disabled || !onChange) return;
    dragging.current = true;
    mode.current = painted.has(v) ? 'erase' : 'paint';
    e.currentTarget.setPointerCapture?.(e.pointerId);
    apply(v);
  };
  const move = (e) => {
    if (!dragging.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-v]');
    if (el) apply(Number(el.dataset.v));
  };
  const up = () => { dragging.current = false; };
  return (
    <div className={`mgrid ${size}`} dir="ltr" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      {Array.from({ length: N }, (_, i) => i + 1).map((v) => (
        <button key={v} type="button" data-v={v} tabIndex={-1}
          className={`mcell ${painted.has(v) ? 'on' : ''} ${outline.includes(v) ? 'ol' : ''} ${tone ? tone(v) : ''}`}>
          <Num v={v} />
        </button>
      ))}
    </div>
  );
}

export function GridView({ item, hint, locked, reveal, onChange }) {
  const d = item.data;
  const [painted, setPainted] = useState(new Set());
  const shown = reveal ? new Set(d.targets) : painted;
  const set = (next) => { setPainted(next); onChange([...next].sort((a, b) => a - b), next.size > 0); };
  const outline = hint || reveal ? d.ks.flatMap((k) => [k, 2 * k]).filter((v) => v <= d.N) : [];
  return (
    <div className="gv">
      <div className="pt-num">{d.prompt}</div>
      <MultGrid N={d.N} painted={shown} onChange={set} disabled={locked} outline={hint && !reveal ? outline : []} />
      <div className="gv-note">{painted.size > 0 && !reveal ? <>رنگ‌شده: <Num v={painted.size} /></> : 'روی عددها بزن یا انگشتت را روی آن‌ها بکش'}</div>
    </div>
  );
}

function MulRow({ vis }) {
  const { k, shown, ask } = vis;
  return (
    <div className="mulrow" dir="ltr">
      {shown.map((s) => (
        <div key={s.n} className="mr-cell"><span className="mr-top"><Num v={s.n} />×<Num v={k} /></span><b><Num v={s.v} /></b></div>
      ))}
      <div className="mr-cell dots"><b>…</b></div>
      <div className="mr-cell q">
        <span className="mr-top">{ask.n == null ? '؟' : <><Num v={ask.n} />×<Num v={k} /></>}</span>
        <b>{ask.v == null ? '؟' : <Num v={ask.v} />}</b>
      </div>
    </div>
  );
}

function Queue({ vis, help }) {
  const { n, mark } = vis;
  return (
    <div className="queue" dir="ltr" aria-hidden>
      {Array.from({ length: n }, (_, i) => i + 1).map((i) => (
        <span key={i} className={`person ${i === mark ? 'me' : ''} ${help && i < mark ? 'before' : ''} ${help && i > mark ? 'after' : ''}`}><i /></span>
      ))}
    </div>
  );
}

function Tbl({ vis }) {
  const { a, b, shown, ask } = vis;
  const extra = [];
  if (ask) {
    extra.push({ n: ask.n, v: ask.v });
    if (ask.n2 != null) extra.push({ n: ask.n2, v: ask.v2 });
  }
  return (
    <div className="fig-table" dir="ltr">
      <div className="ft-row head"><span className="ft-h">{a}</span>{shown.map((c) => <b key={c.n}><Num v={c.n} /></b>)}<b>…</b>{extra.map((c, i) => <b key={`e${i}`}><Num v={c.n} /></b>)}</div>
      <div className="ft-row"><span className="ft-h">{b}</span>{shown.map((c) => <b key={c.n}><Num v={c.v} /></b>)}<b>…</b>{extra.map((c, i) => <b key={`f${i}`} className={c.v == null ? 'q' : ''}>{c.v == null ? '؟' : <Num v={c.v} />}</b>)}</div>
    </div>
  );
}

export const MULT_VISUALS = { mulrow: MulRow, queue: Queue, tbl: Tbl };
export { Fragment };
