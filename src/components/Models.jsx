import { useRef } from 'react';
import { Num } from './ui.jsx';

const OFF = '#eceaff';
const LINE = '#cfcaf5';

/** order in which loose cells fill a grid: right-most column first, top to bottom */
export const fillIndex = (k) => (k % 10) * 10 + (9 - Math.floor(k / 10));
export const countToCells = (count) => {
  const a = new Array(100).fill(false);
  for (let k = 0; k < Math.min(100, count); k++) a[fillIndex(k)] = true;
  return a;
};

/** A 10x10 unit square. `cells` is a bool[100] (or pass `count` for column-major fill). */
export function UnitGrid({ cells, count = 0, cell = 12, color = 'var(--model)', outline = false, svgRef, ...rest }) {
  const arr = cells || countToCells(count);
  const size = cell * 10;
  return (
    <svg ref={svgRef} width={size + 2} height={size + 2} viewBox={`-1 -1 ${size + 2} ${size + 2}`} className="ugrid" {...rest}>
      <rect x="-1" y="-1" width={size + 2} height={size + 2} rx="3" fill="#fff" stroke={outline ? '#8b90bd' : LINE} strokeWidth="1.5" />
      {arr.map((on, i) => {
        const x = (i % 10) * cell;
        const y = Math.floor(i / 10) * cell;
        return <rect key={i} x={x + 0.75} y={y + 0.75} width={cell - 1.5} height={cell - 1.5} rx={cell > 9 ? 2 : 1} fill={on ? color : OFF} />;
      })}
    </svg>
  );
}

export function Bar({ cell = 12, color = 'var(--model)' }) {
  return (
    <svg width={cell + 1.5} height={cell * 10 + 1.5} viewBox={`-0.75 -0.75 ${cell + 1.5} ${cell * 10 + 1.5}`}>
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x="0.75" y={i * cell + 0.75} width={cell - 1.5} height={cell - 1.5} rx="2" fill={color} />)}
    </svg>
  );
}

export const Square = ({ cell = 12, color = 'var(--model)' }) => (
  <svg width={cell} height={cell}><rect x="0.75" y="0.75" width={cell - 1.5} height={cell - 1.5} rx="2" fill={color} /></svg>
);

/** The book's pieces: a unit square, full squares, bars (tenths) and loose cells (hundredths). */
export function DecimalPieces({ n = 0, b = 0, c = 0, annotate = false, cell: cellProp }) {
  const cell = cellProp || (n > 0 ? 9 : 13);
  const cap = (txt) => (annotate ? <div className="pcap">{txt}</div> : null);
  return (
    <div className="pieces" role="img" aria-label="مدل عدد اعشاری">
      <div className="pgrp">
        <UnitGrid count={0} cell={cell} outline />
        <div className="pcap strong">۱ واحد</div>
      </div>
      <div className="peq">=</div>
      {n > 0 && (
        <div className="pgrp">
          <div className="prow">{Array.from({ length: n }, (_, i) => <UnitGrid key={i} count={100} cell={cell} color="var(--model-2)" />)}</div>
          {cap(<><Num v={n} /> واحد</>)}
        </div>
      )}
      {b > 0 && (
        <div className="pgrp">
          <div className="prow" style={{ gap: 5 }}>{Array.from({ length: b }, (_, i) => <Bar key={i} cell={cell} />)}</div>
          {cap(<><Num v={b} /> نوار = <Num v={b} /> دهم</>)}
        </div>
      )}
      {c > 0 && (
        <div className="pgrp">
          <div className="prow" style={{ gap: 3, maxWidth: (cell + 3) * 3, flexWrap: 'wrap' }}>
            {Array.from({ length: c }, (_, i) => <Square key={i} cell={cell} color="var(--purple)" />)}
          </div>
          {cap(<><Num v={c} /> خانه = <Num v={c} /> صدم</>)}
        </div>
      )}
    </div>
  );
}

/**
 * Paintable grid(s). value = bool[100][] (one array per grid). Drag across cells to paint/erase.
 */
export function GridBoard({ value, onChange, cell = 22, locked = false, tools = true }) {
  const refs = useRef([]);
  const drag = useRef(null);
  const set = (gi, idx, on) => {
    if (value[gi][idx] === on) return;
    const next = value.map((g, i) => (i === gi ? g.map((v, j) => (j === idx ? on : v)) : g));
    onChange(next);
  };
  const idxAt = (gi, e) => {
    const r = refs.current[gi].getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    if (x < 0 || x >= 1 || y < 0 || y >= 1) return -1;
    return Math.floor(y * 10) * 10 + Math.floor(x * 10);
  };
  const down = (gi) => (e) => {
    if (locked) return;
    const idx = idxAt(gi, e);
    if (idx < 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { gi, on: !value[gi][idx], last: idx };
    set(gi, idx, drag.current.on);
  };
  const move = (gi) => (e) => {
    const d = drag.current;
    if (!d || d.gi !== gi) return;
    const idx = idxAt(gi, e);
    if (idx >= 0 && idx !== d.last) { d.last = idx; set(gi, idx, d.on); }
  };
  const up = () => { drag.current = null; };
  const addColumn = (gi) => {
    // first column (from the right) that is not already full
    for (let col = 9; col >= 0; col--) {
      const full = Array.from({ length: 10 }, (_, r) => value[gi][r * 10 + col]).every(Boolean);
      if (!full) {
        onChange(value.map((g, i) => (i === gi ? g.map((v, j) => (j % 10 === col ? true : v)) : g)));
        return;
      }
    }
  };
  return (
    <div className="gboard">
      <div className="gboard-grids">
        {value.map((g, gi) => (
          <div className="gcol" key={gi}>
            <UnitGrid
              cells={g} cell={cell} color={gi === 0 && value.length === 2 ? 'var(--model-2)' : 'var(--model)'} outline
              svgRef={(el) => { refs.current[gi] = el; }}
              onPointerDown={down(gi)} onPointerMove={move(gi)} onPointerUp={up} onPointerCancel={up}
              style={{ touchAction: 'none', cursor: locked ? 'default' : 'pointer' }}
              aria-label={`شبکه‌ی ${gi + 1}`}
            />
            {tools && !locked && (
              <div className="gtools">
                <button className="btn btn-sm btn-purple" onClick={() => addColumn(gi)}>+ ستون</button>
                {value.length === 2 && gi === 0 && (
                  <button className="btn btn-sm btn-yellow" onClick={() => onChange(value.map((g2, i) => (i === 0 ? g2.map(() => true) : g2)))}>همه</button>
                )}
                <button className="btn btn-sm btn-white" onClick={() => onChange(value.map((g2, i) => (i === gi ? g2.map(() => false) : g2)))}>پاک</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const paintedCount = (grids) => grids.map((g) => g.filter(Boolean).length);
export const emptyGrids = (n) => Array.from({ length: n }, () => new Array(100).fill(false));
