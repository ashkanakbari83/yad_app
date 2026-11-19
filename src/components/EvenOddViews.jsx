// Views for stage ch1-1 («تونل‌های زوج و فرد»): figure patterns, pairs of dots, tunnels, number-line hops.
import { Fragment, useState } from 'react';
import { Num } from './ui.jsx';
import Keypad, { AnswerField, applyKey } from './Keypad.jsx';
import { FAMILIES, isEven } from '../engine/evenodd.js';

/* ---------------------------------------------------------------- drawings */
const COLORS = { a: '#38d6c4', b: '#ffc933' };

/** n dots grouped in pairs; the odd one out is shown alone in a dashed box. */
export function PairDots({ n, color = 'a', size = 'md', paired = true }) {
  const pairs = Math.floor(n / 2);
  const dot = <i className={`pd-dot ${color}`} />;
  return (
    <div className={`pairdots ${size}`} dir="ltr" aria-hidden>
      {paired
        ? Array.from({ length: pairs }, (_, i) => <span key={i} className="pd-pair">{dot}{dot}</span>)
        : Array.from({ length: n }, (_, i) => <span key={i} className="pd-solo">{dot}</span>)}
      {paired && n % 2 === 1 && <span className="pd-pair left">{dot}</span>}
    </div>
  );
}

/** the figure of the book's patterns, n-th figure */
export function Figure({ fam, n, scale = 1 }) {
  const u = 14;
  if (fam === 'wheel') {
    const w = n * 40 + 4;
    return (
      <svg width={w * scale} height={34 * scale} viewBox={`0 0 ${w} 34`} aria-hidden>
        {Array.from({ length: n }, (_, i) => (
          <g key={i} transform={`translate(${4 + i * 40},0)`}>
            <rect x="2" y="4" width="28" height="14" rx="4" fill="#8f6bff" />
            <circle cx="9" cy="24" r="7" fill="#2a2150" stroke="#ffc933" strokeWidth="3" />
            <circle cx="23" cy="24" r="7" fill="#2a2150" stroke="#ffc933" strokeWidth="3" />
          </g>
        ))}
      </svg>
    );
  }
  if (fam === 'stick') {
    const w = n * 40 + 4;
    return (
      <svg width={w * scale} height={36 * scale} viewBox={`0 0 ${w} 36`} aria-hidden>
        {Array.from({ length: n }, (_, i) => (
          <polygon key={i} points={`${4 + i * 40},32 ${22 + i * 40},4 ${40 + i * 40 - 4},32`} fill="rgba(255,201,51,.18)" stroke="#f08a2c" strokeWidth="4" strokeLinejoin="round" />
        ))}
      </svg>
    );
  }
  const w = n * (u + 3) + 3;
  const h = n * (u + 3) + 3;
  const sq = (x, y, k) => <rect key={k} x={x} y={y} width={u} height={u} rx="3" fill="#ff5fa2" />;
  const cells = [];
  for (let r = 0; r < n; r++) cells.push(sq(3, 3 + r * (u + 3), `c${r}`));
  for (let c = 1; c < n; c++) cells.push(sq(3 + c * (u + 3), 3 + (n - 1) * (u + 3), `r${c}`));
  return <svg width={w * scale} height={h * scale} viewBox={`0 0 ${w} ${h}`} aria-hidden>{cells}</svg>;
}

function Tunnel({ n }) {
  return (
    <div className="tunnel" dir="ltr" aria-hidden>
      <span className="tn-balls">{Array.from({ length: n }, (_, i) => <i key={i} className="ball" />)}</span>
      <Num v={n} className="tn-num" />
    </div>
  );
}

function Hops({ terms, ask }) {
  const all = [...terms, ask];
  const lo = Math.min(...all) - 1;
  const hi = Math.max(...all) + 1;
  const W = 520;
  const x = (v) => 30 + ((v - lo) / (hi - lo)) * (W - 60);
  return (
    <svg className="hops" viewBox={`0 0 ${W} 124`} aria-hidden>
      <line x1="14" y1="86" x2={W - 14} y2="86" stroke="#7a6fc9" strokeWidth="4" strokeLinecap="round" />
      {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((v) => (
        <g key={v}>
          <line x1={x(v)} y1="80" x2={x(v)} y2="92" stroke="#7a6fc9" strokeWidth="3" />
          <text x={x(v)} y="116" textAnchor="middle" fontSize="19" fontWeight="800" fill="#5b4fb0">{faDig(v)}</text>
        </g>
      ))}
      {terms.map((t, i) => i < terms.length - 1 && (
        <path key={t} d={`M${x(t)} 80 Q${(x(t) + x(terms[i + 1])) / 2} 22 ${x(terms[i + 1])} 80`} fill="none" stroke="#38d6c4" strokeWidth="4" strokeLinecap="round" />
      ))}
      {terms.map((t) => <circle key={`d${t}`} cx={x(t)} cy="86" r="7" fill="#ffc933" stroke="#8a5a2a" strokeWidth="2" />)}
      <path d={`M${x(terms[terms.length - 1])} 80 Q${(x(terms[terms.length - 1]) + x(ask)) / 2} 22 ${x(ask)} 80`} fill="none" stroke="#ff5fa2" strokeWidth="4" strokeDasharray="7 7" strokeLinecap="round" />
      <text x={x(ask)} y="70" textAnchor="middle" fontSize="24" fontWeight="900" fill="#ff5fa2">؟</text>
    </svg>
  );
}
const faDig = (v) => String(v).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

/* ---------------------------------------------------------------- visuals by kind */
function FigTable({ vis }) {
  const { fam, shown, ask } = vis;
  const F = FAMILIES[fam];
  const cols = shown.map((s) => ({ n: s.n, v: s.v }));
  return (
    <div className="figs">
      <div className="fig-row" dir="ltr">
        {shown.map((s) => <div key={s.n} className="fig-cell"><Figure fam={fam} n={s.n} /><span className="fig-lab">شکل <Num v={s.n} /></span></div>)}
      </div>
      <div className="fig-table" dir="ltr">
        <div className="ft-row head"><span className="ft-h">شکل</span>{cols.map((c) => <b key={c.n}><Num v={c.n} /></b>)}<b>…</b>{ask && <b className={ask.n == null ? 'q' : ''}>{ask.n == null ? '؟' : <Num v={ask.n} />}</b>}</div>
        <div className="ft-row"><span className="ft-h">{F.thing}</span>{cols.map((c) => <b key={c.n}><Num v={c.v} /></b>)}<b>…</b>{ask && <b className={ask.v == null ? 'q' : ''}>{ask.v == null ? '؟' : <Num v={ask.v} />}</b>}</div>
      </div>
    </div>
  );
}

function Visual({ vis, help }) {
  switch (vis.kind) {
    case 'figs': return <FigTable vis={vis} />;
    case 'dots': return <PairDots n={vis.n} size="lg" paired={help || true} />;
    case 'sumdots':
      return (vis.show || help) ? (
        <div className="sumdots" dir="ltr">
          <PairDots n={vis.a} color="a" /><span className="op">+</span><PairDots n={vis.b} color="b" />
        </div>
      ) : null;
    case 'route': return <div className="route" dir="ltr">{vis.tunnels.map((t, i) => <Fragment key={i}>{i > 0 && <span className="op">+</span>}<Tunnel n={t} /></Fragment>)}</div>;
    case 'line': return <Hops terms={vis.terms} ask={vis.ask} />;
    case 'blanks':
      return (
        <div className="blanks" dir="ltr">
          {vis.terms.map((t, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="arrow">+۲</span>}
              <b className={`blank ${t == null ? 'q' : ''}`}>{t == null ? '؟' : <Num v={t} />}</b>
            </Fragment>
          ))}
        </div>
      );
    case 'first':
      return (
        <div className="blanks" dir="ltr">
          {vis.terms.map((t) => <b key={t} className="blank"><Num v={t} /></b>)}<b className="blank dots">…</b>
        </div>
      );
    default: return null;
  }
}

/* ---------------------------------------------------------------- views */
export function NumView({ item, hint, locked, reveal, onChange }) {
  const d = item.data;
  const [val, setVal] = useState('');
  const press = (k) => { if (locked) return; const nx = applyKey(val, k); setVal(nx); onChange(nx === '' ? null : Number(nx), nx !== ''); };
  return (
    <div className="mr">
      <div className="mr-model">
        <div className="pt-num">{d.prompt}</div>
        <Visual vis={d.visual} help={hint || reveal} />
      </div>
      <div className="mr-input">
        <AnswerField value={reveal ? String(d.answer) : val} state={reveal ? 'ok' : 'idle'} />
        <Keypad onKey={press} disabled={locked} point={false} />
      </div>
    </div>
  );
}

export function ChoiceView({ item, hint, locked, reveal, onChange }) {
  const d = item.data;
  const [sel, setSel] = useState(null);
  const shownSel = reveal ? d.answerIndex : sel;
  const pick = (i) => { if (locked) return; setSel(i); onChange(i, true); };
  const help = hint || reveal;
  const long = d.options.some((o) => typeof o === 'string' && o.length > 12);
  return (
    <div className="eo">
      <div className="pt-num">{d.prompt}</div>
      <Visual vis={d.visual} help={help} />
      <div className={`eo-opts ${long ? 'long' : ''}`}>
        {d.options.map((o, i) => (
          <button key={i} type="button" disabled={locked} onClick={() => pick(i)}
            className={`eo-opt ${shownSel === i ? 'sel' : ''} ${reveal && i === d.answerIndex ? 'rev' : ''}`}>
            {d.optLabel === 'num' ? <Num v={o} /> : o}
            {d.optLabel === 'num' && d.dots && help && <PairDots n={o} size="xs" />}
          </button>
        ))}
      </div>
    </div>
  );
}
export { isEven };
