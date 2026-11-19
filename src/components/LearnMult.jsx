// Learning scenes of stage ch1-2 («پل مضرب‌ها»).
import { useEffect, useState } from 'react';
import { Num } from './ui.jsx';
import { MultGrid } from './MultViews.jsx';
import { Figure } from './EvenOddViews.jsx';
import { faDigits } from '../lib/fa.js';

const Stepper = ({ label, value, min, max, step = 1, onChange }) => (
  <div className="stepper">
    <button className="btn btn-white btn-sm" aria-label="بیشتر" disabled={value + step > max} onClick={() => onChange(value + step)}>+</button>
    <span className="stepval"><span className="muted" style={{ fontSize: 16, fontWeight: 800 }}>{label}</span><Num v={value} className="big" /></span>
    <button className="btn btn-white btn-sm" aria-label="کمتر" disabled={value - step < min} onClick={() => onChange(value - step)}>−</button>
  </div>
);

/* 1: skip counting builds the multiples */
function SkipScene({ setSay, setReady }) {
  const [k, setK] = useState(3);
  const [n, setN] = useState(0);
  useEffect(() => { setSay('هر بار «بپر» را بزن تا به اندازه‌ی یک پرش جلو برویم. عددهایی که می‌سازیم، مضرب‌های آن عدد هستند.'); }, [setSay]);
  const jump = () => {
    const x = n + 1;
    setN(x);
    const list = Array.from({ length: x }, (_, i) => faDigits((i + 1) * k)).join('، ');
    if (x < 5) setSay(`${faDigits(x)} × ${faDigits(k)} = ${faDigits(x * k)}`);
    else { setSay(`${list} … «مضرب‌های عدد ${faDigits(k)}» هستند. مضرب ${faDigits(x)}‌ام = ${faDigits(x)} × ${faDigits(k)} = ${faDigits(x * k)}.`); setReady(true); }
  };
  const changeK = (x) => { setK(x); setN(0); setSay(`عدد ${faDigits(x)} را انتخاب کردی. حالا بپر!`); };
  const terms = Array.from({ length: n }, (_, i) => (i + 1) * k);
  return (
    <div className="ls">
      <div className="mulrow" dir="ltr">
        {terms.length === 0 && <div className="mr-cell q"><span className="mr-top">؟</span><b>؟</b></div>}
        {terms.map((v, i) => <div key={v} className="mr-cell"><span className="mr-top"><Num v={i + 1} />×<Num v={k} /></span><b><Num v={v} /></b></div>)}
      </div>
      <div className="ls-ctrl row">
        <Stepper label="عدد" value={k} min={2} max={9} onChange={changeK} />
        <button className="btn btn-purple btn-sm" disabled={n >= 8} onClick={jump}>بپر</button>
      </div>
    </div>
  );
}

/* 2: colour multiples of 2, 3, 5 on the table */
function TableScene({ setSay, setReady }) {
  const [on, setOn] = useState([]);
  useEffect(() => { setSay('یکی از دکمه‌ها را بزن تا مضرب‌های آن عدد روی جدول رنگی شوند. چند تا را با هم روشن کن!'); }, [setSay]);
  const toggle = (k) => {
    const nx = on.includes(k) ? on.filter((x) => x !== k) : [...on, k];
    setOn(nx);
    if (nx.includes(3) && nx.includes(5)) { setSay('خانه‌های دورنگ، هم مضرب ۳ و هم مضرب ۵ هستند: ۱۵ و ۳۰. جالب نیست؟'); setReady(true); }
    else if (nx.length) setSay(`مضرب‌های ${nx.map(faDigits).join(' و ')} رنگی شدند. ببین فاصله‌ی مضرب‌ها همیشه ثابت است.`);
  };
  const tone = (v) => { const hit = on.filter((k) => v % k === 0); return hit.length ? `t${hit.join('')}` : ''; };
  return (
    <div className="ls">
      <MultGrid N={30} painted={new Set()} tone={tone} disabled size="sm" />
      <div className="stepper">
        {[2, 3, 5].map((k) => <button key={k} className={`btn btn-sm ${on.includes(k) ? 'btn-purple' : 'btn-white'}`} onClick={() => toggle(k)}>مضرب <Num v={k} /></button>)}
      </div>
    </div>
  );
}

/* 3: middle of a queue */
function QueueScene({ setSay, setReady }) {
  const [N, setN] = useState(7);
  useEffect(() => { setSay('در یک صف، نفر وسط را پیدا کنیم. تعداد افراد را زیاد کن و ببین قبل و بعد از نفر وسط چند نفر هستند.'); }, [setSay]);
  const go = (x) => {
    setN(x);
    const m = (x - 1) / 2;
    setSay(`${faDigits(m)} نفر قبل + نفر وسط + ${faDigits(m)} نفر بعد = ${faDigits(x)}. نفر وسط، نفر ${faDigits(m + 1)}‌ام است.`);
    if (x >= 15) setReady(true);
  };
  const m = (N - 1) / 2;
  return (
    <div className="ls">
      <div className="queue" dir="ltr">
        {Array.from({ length: N }, (_, i) => i + 1).map((i) => <span key={i} className={`person ${i === m + 1 ? 'me' : i < m + 1 ? 'before' : 'after'}`}><i /></span>)}
      </div>
      <div className="ls-eq" dir="ltr"><Num v={m} className="big" /><span className="eq">+</span><Num v={1} className="big" /><span className="eq">+</span><Num v={m} className="big" /><span className="eq">=</span><Num v={N} className="big" /></div>
      <Stepper label="تعداد صف" value={N} min={3} max={31} step={2} onChange={go} />
    </div>
  );
}

/* 4: figure number doubles -> sticks double (proportion) */
function ProportionScene({ setSay, setReady }) {
  const [n, setN] = useState(2);
  const [used, setUsed] = useState(0);
  useEffect(() => { setSay('هر مثلث ۳ چوب می‌خواهد. شماره‌ی شکل را دو برابر کن و ببین تعداد چوب‌ها چه می‌شود.'); }, [setSay]);
  const double = () => {
    const x = n * 2;
    setN(x); setUsed(used + 1);
    setSay(`شماره از ${faDigits(n)} به ${faDigits(x)} رسید (دو برابر). چوب‌ها از ${faDigits(3 * n)} به ${faDigits(3 * x)} رسیدند، آن‌ها هم دو برابر شدند. به این می‌گویند «متناسب».`);
    if (used + 1 >= 2) setReady(true);
  };
  const reset = () => { setN(2); setUsed(0); setSay('دوباره از شکل ۲ شروع کنیم.'); };
  return (
    <div className="ls ls-stage">
      <div className="ls-fig"><Figure fam="stick" n={n} scale={n > 4 ? 0.8 : 1.2} /></div>
      <div className="ls-eq" dir="ltr"><Num v={3} className="big" /><span className="eq">×</span><Num v={n} className="big" /><span className="eq">=</span><Num v={3 * n} className="big" /></div>
      <div className="ls-ctrl row">
        <button className="btn btn-purple btn-sm" disabled={n >= 8} onClick={double}>شماره را دو برابر کن</button>
        <button className="btn btn-white btn-sm" onClick={reset}>از اول</button>
      </div>
    </div>
  );
}

export const MULT_SCENES = [
  { id: 'skip', title: 'پرش و مضرب‌ها', Comp: SkipScene },
  { id: 'table', title: 'جدول مضرب‌ها', Comp: TableScene },
  { id: 'queue', title: 'نفر وسط صف', Comp: QueueScene },
  { id: 'prop', title: 'رابطه و تناسب', Comp: ProportionScene },
];
