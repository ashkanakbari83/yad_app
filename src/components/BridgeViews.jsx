// Item views for stage 2 («پل کسر و اعشار»): fraction <-> decimal, expanded form, column add/subtract.
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Chip, Frac, Num } from './ui.jsx';
import { UnitGrid } from './Models.jsx';
import Keypad, { AnswerField, applyKey } from './Keypad.jsx';
import { faNum } from '../lib/fa.js';
import { parseDec } from '../lib/decimal.js';

/* ---------------------------------------------------------------- column layout */
const splitNum = (s) => {
  const [i, f = ''] = s.split('.');
  return { i, f, hasPoint: s.includes('.') };
};

/**
 * Digits aligned by the decimal point (LTR, like the book's column sums).
 * pad = show the empty places filled with ghost zeros; result = optional answer row.
 */
export function Column({ a, b, sym, pad = false, result = null, hl = false }) {
  const rows = [a, b, ...(result != null ? [result] : [])].map(splitNum);
  const iw = Math.max(...rows.map((r) => r.i.length));
  const fw = Math.max(...rows.map((r) => r.f.length));
  const showPoint = fw > 0;
  const cells = (r, ri) => {
    const out = [];
    for (let k = 0; k < iw; k++) {
      const idx = k - (iw - r.i.length);
      out.push(<span key={`i${k}`} className="cc">{idx >= 0 ? faNum(r.i[idx]) : ''}</span>);
    }
    if (showPoint) out.push(<span key="p" className={`cc pt ${hl ? 'hl' : ''}`}>{r.hasPoint || pad ? '/' : ''}</span>);
    for (let k = 0; k < fw; k++) {
      const ch = r.f[k];
      out.push(<span key={`f${k}`} className={`cc ${ch == null && pad ? 'pad' : ''}`}>{ch != null ? faNum(ch) : pad ? '۰' : ''}</span>);
    }
    return <div key={ri} className={`crow ${ri === 2 ? 'res' : ''}`}><span className="cc sign">{ri === 1 ? sym : ''}</span>{out}</div>;
  };
  return <div className="col" dir="ltr" aria-hidden>{rows.map(cells)}</div>;
}

/* ---------------------------------------------------------------- fraction -> decimal */
export function FracDec({ item, hint, locked, reveal, onChange }) {
  const { n, d, value, bridge, places } = item.data;
  const [val, setVal] = useState('');
  const press = (k) => { if (locked) return; const nx = applyKey(val, k); setVal(nx); onChange(nx, nx !== '' && nx !== '0.'); };
  const showHelp = hint || reveal;
  const grid = showHelp && n < d && 100 % d === 0 ? (n * 100) / d : null;
  return (
    <div className="mr">
      <div className="mr-model">
        <div className="pt-num">این کسر چه عدد اعشاری است؟</div>
        <div className="fd-eq" dir="ltr">
          <Frac n={n} d={d} size={2.3} />
          {showHelp && bridge && <><span className="eq">=</span><Frac n={bridge.n2} d={bridge.D} size={2.3} /></>}
          <span className="eq">=</span>
          <span className="fd-q">{reveal ? <Num v={value} className="big" /> : '؟'}</span>
        </div>
        {showHelp && bridge && (
          <div className="fd-mul" aria-hidden>
            <span className="mulchip" dir="ltr">× <Num v={bridge.k} /></span>
            <span className="mulnote">صورت و مخرج را در یک عدد ضرب کن</span>
          </div>
        )}
        {showHelp && !bridge && <div className="fd-note">مخرج <Num v={d} /> است: <Num v={places} /> رقم بعد از ممیز</div>}
        {grid != null && <UnitGrid count={grid} cell={8} />}
      </div>
      <div className="mr-input">
        <AnswerField value={reveal ? value : val} state={reveal ? 'ok' : 'idle'} />
        <Keypad onKey={press} disabled={locked} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- decimal -> fraction */
const FIELD_MAX = { w: 3, n: 4, d: 4 };

export function DecFrac({ item, hint, locked, reveal, onChange }) {
  const { value, whole, n, d, n0, d0, mixed } = item.data;
  const order = mixed ? ['w', 'n', 'd'] : ['n', 'd'];
  const [f, setF] = useState({ w: '', n: '', d: '' });
  const [act, setAct] = useState(order[0]);
  const shown = reveal ? { w: whole ? String(whole) : '', n: String(n), d: String(d) } : f;
  const push = (nx) => {
    setF(nx);
    onChange({ w: nx.w === '' ? null : Number(nx.w), n: nx.n === '' ? null : Number(nx.n), d: nx.d === '' ? null : Number(nx.d) }, nx.n !== '' && nx.d !== '');
  };
  const press = (k) => {
    if (locked) return;
    const cur = f[act];
    let nx;
    if (k === 'del') nx = cur.slice(0, -1);
    else if (cur.length >= FIELD_MAX[act]) nx = cur;
    else nx = cur === '0' ? k : cur + k;
    push({ ...f, [act]: nx });
  };
  const next = () => setAct(order[(order.indexOf(act) + 1) % order.length]);
  const slot = (key, big) => (
    <button
      key={key} type="button" className={`fslot ${big ? 'big' : ''} ${act === key && !locked ? 'act' : ''} ${reveal ? 'rev' : ''}`}
      disabled={locked} onClick={() => setAct(key)} aria-label={key === 'w' ? 'عدد صحیح' : key === 'n' ? 'صورت' : 'مخرج'}
    >
      {shown[key] === '' ? <span className="ph">؟</span> : <Num v={shown[key]} />}
    </button>
  );
  const showModel = !mixed && (item.level === 1 || hint || reveal) && parseDec(value) < 10000;
  const cells = Math.round(parseDec(value) / 100);
  return (
    <div className="mr">
      <div className="mr-model">
        <div className="pt-num">این عدد اعشاری را به صورت {mixed ? 'کسر یا عدد مخلوط' : 'کسر'} بنویس<div className="sub">تا جای ممکن ساده کن</div></div>
        <div className="df-row" dir="ltr">
          {showModel && cells > 0 && cells <= 100 && <UnitGrid count={cells} cell={8} />}
          <Num v={value} className="big df-val" />
          <span className="eq">=</span>
          <div className="fe">
            {mixed && slot('w', true)}
            <div className="fe-frac">{slot('n')}<i />{slot('d')}</div>
          </div>
        </div>
        {(hint || reveal) && <div className="fd-note"><Num v={value} /> = {whole ? <><Num v={whole} /> و </> : null}<Frac n={n0} d={d0} size={0.95} />{(n0 !== n || d0 !== d) && <> = {whole ? <><Num v={whole} /> و </> : null}<Frac n={n} d={d} size={0.95} /></>}</div>}
      </div>
      <div className="mr-input">
        <Keypad onKey={press} disabled={locked} point={false} extra={{ label: 'بعدی', onClick: next }} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- expanded form */
function PartFace({ p }) {
  return p.kind === 'frac' ? <Frac n={p.n} d={p.d} size={0.95} /> : <Num v={p.text} />;
}

export function Expanded({ item, hint, locked, reveal, onChange }) {
  const { kind, target, parts, chips, strip } = item.data;
  const [placed, setPlaced] = useState(() => parts.map(() => null));
  const solved = useMemo(() => parts.map((p) => chips.find((c) => c.key === p.key).id), [parts, chips]);
  const shown = reveal ? solved : placed;
  const bank = chips.filter((c) => !shown.includes(c.id));
  const byId = (id) => chips.find((c) => c.id === id);
  const commit = (next) => { setPlaced(next); onChange(next, next.every((x) => x != null)); };
  const put = (id, slot) => {
    if (locked) return;
    const next = placed.slice();
    const at = slot ?? next.indexOf(null);
    if (at < 0) return;
    next[at] = id;
    commit(next);
  };
  const remove = (i) => { if (locked || placed[i] == null) return; const next = placed.slice(); next[i] = null; commit(next); };
  return (
    <div className="xp">
      <div className="pt-num">
        شکل گسترده‌ی{' '}
        {kind === 'frac'
          ? <span className="xp-mixed" dir="ltr">{target.whole > 0 && <Num v={target.whole} className="big" />}<Frac n={target.n} d={target.d} size={1.5} /></span>
          : <Num v={target.text} className="big" />}
        {' '}را بساز
      </div>
      {(hint || reveal) && (
        <div className="xp-strip" dir="ltr">
          {strip.map((s, i) => (
            <Fragment key={s.name}>
              {i === 1 && <span className="xp-pt">/</span>}
              <div className="xp-col"><div className={`phead ${i > 0 ? 'dec' : ''}`}>{s.name}</div><div className={`xp-dig ${s.digit === 0 ? 'zero' : ''}`}><Num v={s.digit} /></div></div>
            </Fragment>
          ))}
        </div>
      )}
      <div className="xp-slots" dir="ltr">
        {shown.map((id, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="xp-plus">+</span>}
            <button className={`pslot xp-slot ${id != null ? 'full' : ''} ${reveal ? 'rev' : ''}`} data-drop={`s${i}`} disabled={locked} onClick={() => remove(i)} aria-label={`جمله‌ی ${i + 1}`}>
              {id != null && <span className="dchip static wide"><PartFace p={byId(id)} /></span>}
            </button>
          </Fragment>
        ))}
      </div>
      <div className="bank" dir="ltr">
        {bank.map((c) => (
          <Chip key={c.id} className="wide" disabled={locked} onTap={() => put(c.id)} onDropOn={(sid) => put(c.id, Number(sid.slice(1)))}><PartFace p={c} /></Chip>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- add / subtract */
export function Calc({ item, hint, locked, reveal, onChange }) {
  const { a, b, sym, result, mode } = item.data;
  const [val, setVal] = useState('');
  useEffect(() => { onChange('', false); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const press = (k) => { if (locked) return; const nx = applyKey(val, k); setVal(nx); onChange(nx, nx !== '' && nx !== '0.'); };
  const help = hint || reveal;
  return (
    <div className="mr">
      <div className="mr-model">
        <div className="pt-num">{mode === 'mental' ? 'ذهنی حساب کن' : 'جمع و تفریق را انجام بده'}</div>
        {mode === 'mental' && !help ? (
          <div className="calc-line" dir="ltr"><Num v={a} className="big" /><span className="eq">{sym}</span><Num v={b} className="big" /><span className="eq">=</span><span className="fd-q">؟</span></div>
        ) : (
          <Column a={a} b={b} sym={sym} pad={help} hl={help} result={reveal ? result : null} />
        )}
        {help && <div className="fd-note">ممیز زیر ممیز؛ جای خالی را با صفر پر کن</div>}
      </div>
      <div className="mr-input">
        <AnswerField value={reveal ? result : val} state={reveal ? 'ok' : 'idle'} />
        <Keypad onKey={press} disabled={locked} />
      </div>
    </div>
  );
}
