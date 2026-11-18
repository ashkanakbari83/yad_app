import { Fragment, useEffect, useMemo, useState } from 'react';
import { Chip, Frac, Num } from './ui.jsx';
import { DecimalPieces, GridBoard, UnitGrid, emptyGrids, paintedCount, countToCells } from './Models.jsx';
import Keypad, { AnswerField, applyKey } from './Keypad.jsx';
import { faDigits } from '../lib/fa.js';
import { fromHundredths, toHundredths } from '../lib/decimal.js';
import { slotLabel } from '../engine/items.js';
import { Calc, DecFrac, Expanded, FracDec } from './BridgeViews.jsx';

/* ---------------------------------------------------------------- place table */
function PlaceTable({ item, hint, locked, reveal, onChange }) {
  const { value, slots, digits, chips } = item.data;
  const [placed, setPlaced] = useState(() => slots.map(() => null));
  const solved = useMemo(() => {
    const used = new Set();
    return digits.map((d) => {
      const c = chips.find((x) => x.digit === d && !used.has(x.id));
      used.add(c.id);
      return c.id;
    });
  }, [digits, chips]);
  const shown = reveal ? solved : placed;
  const bank = chips.filter((c) => !shown.includes(c.id));
  const digitOf = (id) => chips.find((c) => c.id === id).digit;
  const commit = (next) => {
    setPlaced(next);
    onChange(next.map((id) => (id == null ? null : digitOf(id))), next.every((x) => x != null));
  };
  const put = (id, slot) => {
    if (locked) return;
    const next = placed.slice();
    const at = slot ?? next.indexOf(null);
    if (at < 0) return;
    next[at] = id;
    commit(next);
  };
  const remove = (i) => {
    if (locked || placed[i] == null) return;
    const next = placed.slice();
    next[i] = null;
    commit(next);
  };
  return (
    <div className="pt">
      <div className="pt-num">عدد <Num v={value} className="big" /> را در جدول ارزش مکانی بگذار</div>
      <div className="ptable" dir="ltr">
        {slots.map((s, i) => (
          <Fragment key={s}>
            {s === 'tenths' && <div className="ppoint" aria-hidden><span>ممیز</span></div>}
            <div className="pcol">
              <div className={`phead ${s === 'tenths' || s === 'hundredths' ? 'dec' : ''}`}>{slotLabel(s)}</div>
              <button
                className={`pslot ${shown[i] != null ? 'full' : ''} ${reveal ? 'rev' : ''}`} data-drop={`s${i}`}
                onClick={() => remove(i)} aria-label={`${slotLabel(s)}${shown[i] != null ? `: ${faDigits(digitOf(shown[i]))}` : ' (خالی)'}`}
              >
                {shown[i] != null && <span className="dchip static">{faDigits(digitOf(shown[i]))}</span>}
              </button>
              {hint && (s === 'tenths' || s === 'hundredths') && <div className="pnote">{s === 'tenths' ? <Frac n="۱" d="۱۰" size={0.8} /> : <Frac n="۱" d="۱۰۰" size={0.8} />}</div>}
            </div>
          </Fragment>
        ))}
      </div>
      <div className="bank" dir="ltr">
        {bank.map((c) => (
          <Chip key={c.id} disabled={locked} onTap={() => put(c.id)} onDropOn={(id) => put(c.id, Number(id.slice(1)))}>{faDigits(c.digit)}</Chip>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- word tiles */
function WordTiles({ item, locked, reveal, onChange }) {
  const { value, tokens, tiles } = item.data;
  const [seq, setSeq] = useState([]);
  const byId = (id) => tiles.find((t) => t.id === id);
  const shownTexts = reveal ? tokens : seq.map((id) => byId(id).text);
  const commit = (next) => { setSeq(next); onChange(next.map((id) => byId(id).text), next.length > 0); };
  const bank = tiles.filter((t) => !seq.includes(t.id));
  return (
    <div className="wt">
      <div className="pt-num">این عدد را با کلمه بخوان: <Num v={value} className="big" /></div>
      <div className={`sline ${reveal ? 'rev' : ''}`} aria-live="polite">
        {shownTexts.length === 0 && <span className="muted" style={{ fontSize: 18 }}>کلمه‌ها را به ترتیب بچین</span>}
        {reveal
          ? tokens.map((t, i) => <span key={i} className="dchip word static">{t}</span>)
          : seq.map((id) => <button key={id} className="dchip word" disabled={locked} onClick={() => commit(seq.filter((x) => x !== id))}>{byId(id).text}</button>)}
      </div>
      <div className="bank words">
        {bank.map((t) => <button key={t.id} className="dchip word" disabled={locked || reveal} onClick={() => commit([...seq, t.id])}>{t.text}</button>)}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- model read */
function ModelRead({ item, hint, locked, reveal, onChange }) {
  const { n, b, c, value } = item.data;
  const [val, setVal] = useState('');
  const shown = reveal ? value : val;
  const press = (k) => { if (locked) return; const nx = applyKey(val, k); setVal(nx); onChange(nx, nx !== '' && nx !== '0.'); };
  return (
    <div className="mr">
      <div className="mr-model">
        <div className="pt-num">عدد اعشاری این مدل چند است؟</div>
        <DecimalPieces n={n} b={b} c={c} annotate={hint || reveal} />
      </div>
      <div className="mr-input">
        <AnswerField value={shown} state={reveal ? 'ok' : 'idle'} />
        <Keypad onKey={press} disabled={locked} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- grid build */
function GridBuild({ item, hint, locked, reveal, onChange }) {
  const { target, hundredths, grids } = item.data;
  const [val, setVal] = useState(() => emptyGrids(grids));
  const solution = useMemo(() => (grids === 2 ? [countToCells(100), countToCells(hundredths - 100)] : [countToCells(hundredths)]), [grids, hundredths]);
  const shown = reveal ? solution : val;
  const counts = paintedCount(shown);
  const total = counts.reduce((a, b) => a + b, 0);
  const change = (nx) => { setVal(nx); onChange(paintedCount(nx), nx.some((g) => g.some(Boolean))); };
  return (
    <div className="gb">
      <div className="gb-left">
        <div className="pt-num">عدد <Num v={target} className="big" /> را روی شبکه رنگ کن</div>
        <div className="note muted">هر شبکه یک واحد است. با کشیدن انگشت روی خانه‌ها رنگ کن.</div>
        {(hint || reveal) && (
          <div className="readout" aria-live="polite">
            <div className="ro-l">رنگ‌شده: <Num v={total} /> خانه</div>
            <div className="ro-m"><Frac n={total} d="۱۰۰" /> = <Num v={total === 0 ? '0' : fromHundredths(total)} /></div>
          </div>
        )}
      </div>
      <GridBoard value={shown} onChange={change} cell={grids === 2 ? 19 : 25} locked={locked || reveal} />
    </div>
  );
}

/* ---------------------------------------------------------------- zero equivalence */
const hund = (s) => toHundredths(s) ?? 0;

function ZeroEq({ item, hint, locked, reveal, onChange }) {
  const d = item.data;
  const [sel, setSel] = useState(null);
  useEffect(() => { onChange(null, false); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (v) => { if (locked) return; setSel(v); onChange(v, true); };
  const showModels = item.level === 1 || hint || reveal;
  if (d.kind === 'odd') {
    const chosen = reveal ? d.answerIndex : sel;
    return (
      <div className="ze">
        <div className="pt-num">کدام عدد با بقیه برابر نیست؟</div>
        <div className="odd" dir="ltr">
          {d.options.map((o, i) => (
            <button key={o} className={`opt ${chosen === i ? 'sel' : ''} ${reveal && i === d.answerIndex ? 'good' : ''}`} disabled={locked} onClick={() => pick(i)}>
              {(hint || reveal) && <UnitGrid count={hund(o)} cell={9} />}
              <Num v={o} className="big" />
            </button>
          ))}
        </div>
      </div>
    );
  }
  const chosen = reveal ? d.answer : sel;
  return (
    <div className="ze">
      <div className="pt-num">دو عدد را مقایسه کن</div>
      <div className="cmp" dir="ltr">
        <div className="cside">{showModels && <UnitGrid count={hund(d.a)} cell={10} />}<Num v={d.a} className="big" /></div>
        <div className="csym">
          {['>', '=', '<'].map((s) => (
            <button key={s} className={`sym ${chosen === s ? 'sel' : ''} ${reveal && s === d.answer ? 'good' : ''}`} disabled={locked} onClick={() => pick(s)} aria-label={s === '>' ? 'بزرگ‌تر' : s === '<' ? 'کوچک‌تر' : 'مساوی'}>{s}</button>
          ))}
        </div>
        <div className="cside">{showModels && <UnitGrid count={hund(d.b)} cell={10} />}<Num v={d.b} className="big" /></div>
      </div>
    </div>
  );
}

export default function ItemView(props) {
  const { item } = props;
  switch (item.type) {
    case 'placeTable': return <PlaceTable {...props} />;
    case 'wordTiles': return <WordTiles {...props} />;
    case 'modelRead': return <ModelRead {...props} />;
    case 'gridBuild': return <GridBuild {...props} />;
    case 'zeroEq': return <ZeroEq {...props} />;
    case 'fracDec': return <FracDec {...props} />;
    case 'decFrac': return <DecFrac {...props} />;
    case 'expanded': return <Expanded {...props} />;
    case 'calc': return <Calc {...props} />;
    default: return null;
  }
}
