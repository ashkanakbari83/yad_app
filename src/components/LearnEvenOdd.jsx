// Learning scenes of stage ch1-1. Hands-on; each ends with ready=true.
import { useEffect, useState } from 'react';
import { Num } from './ui.jsx';
import { Figure, PairDots } from './EvenOddViews.jsx';
import { faDigits } from '../lib/fa.js';

const Stepper = ({ label, value, min, max, onChange }) => (
  <div className="stepper">
    <button className="btn btn-white btn-sm" aria-label="بیشتر" disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    <span className="stepval"><span className="muted" style={{ fontSize: 16, fontWeight: 800 }}>{label}</span><Num v={value} className="big" /></span>
    <button className="btn btn-white btn-sm" aria-label="کمتر" disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
  </div>
);

/* 1: every cart has 2 wheels */
function WheelScene({ setSay, setReady }) {
  const [n, setN] = useState(1);
  useEffect(() => { setSay('در کارگاه گردونه‌سازی هر گردونه ۲ چرخ دارد. گردونه اضافه کن و ببین چرخ‌ها چطور زیاد می‌شوند.'); }, [setSay]);
  const go = (x) => {
    setN(x);
    if (x < 5) setSay(`${faDigits(x)} گردونه → ${faDigits(2 * x)} چرخ. هر بار ۲ تا بیشتر می‌شود.`);
    else { setSay(`${faDigits(x)} گردونه → ${faDigits(2 * x)} چرخ. تعداد چرخ‌ها = ۲ × تعداد گردونه‌ها. عددهای ۲، ۴، ۶، ۸، ۱۰ … «عددهای زوج» هستند.`); setReady(true); }
  };
  return (
    <div className="ls">
      <div className="ls-fig"><Figure fam="wheel" n={n} scale={n > 8 ? 0.9 : n > 5 ? 1.15 : 1.4} /></div>
      <div className="ls-eq" dir="ltr"><Num v={2} className="big" /><span className="eq">×</span><Num v={n} className="big" /><span className="eq">=</span><Num v={2 * n} className="big" /></div>
      <Stepper label="گردونه" value={n} min={1} max={10} onChange={go} />
    </div>
  );
}

/* 2: pairing dots */
function PairScene({ setSay, setReady }) {
  const [n, setN] = useState(6);
  const [paired, setPaired] = useState(false);
  const [seen, setSeen] = useState({ even: false, odd: false });
  useEffect(() => { setSay('نقطه‌ها را بشمار و بعد «جفت کن» را بزن. با عددهای مختلف امتحان کن: بعضی کامل جفت می‌شوند و بعضی نه!'); }, [setSay]);
  const doPair = () => {
    setPaired(true);
    const s = { ...seen, [n % 2 ? 'odd' : 'even']: true };
    setSeen(s);
    setSay(n % 2 ? `${faDigits(n)} نقطه: یکی تنها ماند. چنین عددی «فرد» است.` : `${faDigits(n)} نقطه: همه جفت شدند، چیزی نماند. چنین عددی «زوج» است.`);
    if (s.even && s.odd) setReady(true);
  };
  const change = (x) => { setN(x); setPaired(false); };
  return (
    <div className="ls">
      <div className="ls-dots"><PairDots n={n} size="lg" paired={paired} /></div>
      <div className="ls-eq" dir="ltr"><Num v={n} className="big" />{paired && <span className={`badge ${n % 2 ? 'odd' : 'even'}`}>{n % 2 ? 'فرد' : 'زوج'}</span>}</div>
      <div className="ls-ctrl row">
        <Stepper label="عدد" value={n} min={1} max={14} onChange={change} />
        <button className="btn btn-purple btn-sm" disabled={paired} onClick={doPair}>جفت کن</button>
      </div>
    </div>
  );
}

/* 3: L-shaped squares, 2n - 1 */
function SquareScene({ setSay, setReady }) {
  const [n, setN] = useState(1);
  useEffect(() => { setSay('هر شکل یک ستون و یک ردیف مربع دارد. شماره‌ی شکل را زیاد کن و تعداد مربع‌ها را ببین!'); }, [setSay]);
  const go = (x) => {
    setN(x);
    const list = Array.from({ length: x }, (_, i) => faDigits(2 * i + 1)).join('، ');
    if (x < 5) setSay(`شکل ${faDigits(x)} → ${faDigits(2 * x - 1)} مربع.`);
    else { setSay(`شکل ${faDigits(x)} → ${faDigits(2 * x - 1)} مربع. عددها ${list} … «عددهای فرد» هستند. (۲ × ${faDigits(x)}) − ۱ = ${faDigits(2 * x - 1)}`); setReady(true); }
  };
  return (
    <div className="ls">
      <div className="ls-fig tall"><Figure fam="square" n={n} scale={n > 6 ? 0.8 : 1.1} /></div>
      <div className="ls-eq" dir="ltr">(<Num v={2} />×<Num v={n} />) − <Num v={1} /> = <Num v={2 * n - 1} className="big" /></div>
      <Stepper label="شکل" value={n} min={1} max={8} onChange={go} />
    </div>
  );
}

/* 4: tunnels - parity of a sum */
function SumScene({ setSay, setReady }) {
  const [a, setA] = useState(4);
  const [b, setB] = useState(6);
  const [seen, setSeen] = useState(['ee']); // the starting pair (4, 6) is already زوج + زوج
  useEffect(() => { setSay('این دو تونل توپ دارند. تعداد توپ‌ها را عوض کن و ببین مجموعشان زوج می‌شود یا فرد. هر سه حالت را پیدا کن: زوج+زوج، فرد+فرد، زوج+فرد.'); }, [setSay]);
  const rule = (x, y) => (x % 2 === 0 && y % 2 === 0 ? 'ee' : x % 2 && y % 2 ? 'oo' : 'eo');
  const upd = (x, y) => {
    setA(x); setB(y);
    const r = rule(x, y);
    const nx = seen.includes(r) ? seen : [...seen, r];
    setSeen(nx);
    const msg = { ee: 'زوج + زوج = زوج. هیچ توپ تنهایی نیست.', oo: 'فرد + فرد = زوج! دو توپ تنها با هم جفت شدند.', eo: 'زوج + فرد = فرد. یک توپ تنها می‌ماند.' }[r];
    if (nx.length === 3) { setSay(`${msg} همه‌ی حالت‌ها را دیدی!`); setReady(true); } else setSay(msg);
  };
  const s = a + b;
  return (
    <div className="ls">
      <div className="sumdots" dir="ltr"><PairDots n={a} color="a" /><span className="op">+</span><PairDots n={b} color="b" /></div>
      <div className="ls-eq" dir="ltr"><Num v={a} className="big" /><span className="eq">+</span><Num v={b} className="big" /><span className="eq">=</span><Num v={s} className="big" /><span className={`badge ${s % 2 ? 'odd' : 'even'}`}>{s % 2 ? 'فرد' : 'زوج'}</span></div>
      <div className="ls-ctrl row">
        <Stepper label="تونل اول" value={a} min={1} max={9} onChange={(x) => upd(x, b)} />
        <Stepper label="تونل دوم" value={b} min={1} max={9} onChange={(x) => upd(a, x)} />
      </div>
    </div>
  );
}

export const EVENODD_SCENES = [
  { id: 'wheel', title: 'چرخ‌ها و گردونه‌ها', Comp: WheelScene },
  { id: 'pair', title: 'زوج یا فرد؟', Comp: PairScene },
  { id: 'square', title: 'مربع‌های فرد', Comp: SquareScene },
  { id: 'sum', title: 'تونل‌های جمع', Comp: SumScene },
];
