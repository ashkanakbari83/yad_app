import { useEffect, useState } from 'react';
import { Frac, Num } from './ui.jsx';
import { GridBoard, UnitGrid, emptyGrids, paintedCount } from './Models.jsx';
import { fromHundredths } from '../lib/decimal.js';
import { faDigits } from '../lib/fa.js';
import { decimalSentence } from '../engine/words.js';

/* Scene 1: what does each digit of 68.19 mean? */
function PlaceScene({ setSay, setReady }) {
  const digs = [
    { ch: '6', slot: 'دهگان', val: <><Num v="6" /> دهگان = <Num v="60" /></> },
    { ch: '8', slot: 'یکان', val: <><Num v="8" /> یکان = <Num v="8" /></> },
    { ch: '1', slot: 'دهم', val: <><Num v="1" /> دهم = <Frac n="۱" d="۱۰" /></> },
    { ch: '9', slot: 'صدم', val: <><Num v="9" /> صدم = <Frac n="۹" d="۱۰۰" /></> },
  ];
  const [seen, setSeen] = useState([]);
  const [sel, setSel] = useState(null);
  useEffect(() => { setSay('در جشن فانوس‌ها، رکورد پرتاب گوی نور ۶۸/۱۹ متر شد! روی هر رقم بزن تا ارزشش را ببینی.'); }, [setSay]);
  const tap = (i) => {
    setSel(i);
    const nx = seen.includes(i) ? seen : [...seen, i];
    setSeen(nx);
    if (nx.length === 4) { setSay('آفرین! هر رقم جای خودش را دارد. ممیز، قسمت صحیح را از اعشار جدا می‌کند.'); setReady(true); }
    else setSay(i < 2 ? 'قبل از ممیز، یکان و دهگان‌اند.' : 'بعد از ممیز، اولی دهم است و دومی صدم.');
  };
  return (
    <div className="ls">
      <div className="ls-num" dir="ltr">
        {digs.slice(0, 2).map((d, i) => <button key={i} className={`dig ${sel === i ? 'sel' : ''} ${seen.includes(i) ? 'seen' : ''}`} onClick={() => tap(i)}>{faDigits(d.ch)}</button>)}
        <span className="dig pt">/</span>
        {digs.slice(2).map((d, i) => <button key={i + 2} className={`dig ${sel === i + 2 ? 'sel' : ''} ${seen.includes(i + 2) ? 'seen' : ''}`} onClick={() => tap(i + 2)}>{faDigits(d.ch)}</button>)}
      </div>
      <div className="ptable" dir="ltr" style={{ marginTop: 6 }}>
        {digs.map((d, i) => (
          <div className="pcol" key={i} style={i === 2 ? { marginInlineStart: 0 } : undefined}>
            <div className={`phead ${i >= 2 ? 'dec' : ''} ${sel === i ? 'hl' : ''}`}>{d.slot}</div>
            <div className={`pslot ${seen.includes(i) ? 'full' : ''} ${sel === i ? 'hl' : ''}`}>{seen.includes(i) && <span className="dchip static">{faDigits(d.ch)}</span>}</div>
          </div>
        ))}
      </div>
      <div className="ls-line">{sel != null ? digs[sel].val : <span className="muted">یک رقم را انتخاب کن</span>}</div>
      {seen.length === 4 && <div className="ls-read">می‌خوانیم: «{decimalSentence('68.19')}»</div>}
    </div>
  );
}

/* Scene 2: paint a column (0.1), then build 0.27 */
function PaintScene({ setSay, setReady }) {
  const [g, setG] = useState(() => emptyGrids(1));
  const [step, setStep] = useState(1);
  const count = paintedCount(g)[0];
  useEffect(() => { setSay('هر ستون ۱۰ خانه دارد. یک ستون کامل را رنگ کن (دکمه‌ی «+ ستون» یا کشیدن انگشت).'); }, [setSay]);
  useEffect(() => {
    if (step === 1 && count === 10) {
      setSay('ده خانه از صد خانه می‌شود ۱۰/۱۰۰، یعنی همان ۱/۱۰ و ۰/۱. حالا ۰/۲۷ را بساز!');
      setStep(2);
    } else if (step === 2 && count === 27) {
      setSay('عالی! ۲ ستون و ۷ خانه: ۰/۲ + ۰/۰۷ = ۰/۲۷.');
      setReady(true);
    }
  }, [count, step, setSay, setReady]);
  return (
    <div className="ls ls-paint">
      <GridBoard value={g} onChange={setG} cell={26} />
      <div className="ls-side">
        <div className="goal">{step === 1 ? <>هدف: یک ستون کامل</> : <>هدف: <Num v="0.27" className="big" /></>}</div>
        <div className="readout">
          <div className="ro-l">رنگ‌شده: <Num v={count} /> خانه</div>
          <div className="ro-m"><Frac n={count} d="۱۰۰" size={1.15} /> = <Num v={count === 0 ? '0' : fromHundredths(count)} className="big" /></div>
          {count > 0 && count % 10 === 0 && count < 100 && <div className="ro-s"><Frac n={count} d="۱۰۰" /> = <Frac n={count / 10} d="۱۰" /></div>}
        </div>
      </div>
    </div>
  );
}

/* Scene 3: zeros on the right of the point change nothing */
function ZeroScene({ setSay, setReady }) {
  const [z, setZ] = useState(0);
  const [ans, setAns] = useState(null);
  const text = `0.1${'0'.repeat(z)}`;
  useEffect(() => { setSay('این ۱ ستون رنگی، یعنی ۰/۱. حالا چند صفر سمت راست بگذار و ببین شکل عوض می‌شود؟'); }, [setSay]);
  const more = () => {
    const nz = Math.min(3, z + 1);
    setZ(nz);
    setSay(nz === 1 ? 'شد ۰/۱۰ یعنی ۱۰/۱۰۰. ولی شکل همان است!' : 'باز هم همان یک ستون! صفر آخر چیزی را عوض نکرد.');
  };
  const choose = (v) => {
    setAns(v);
    if (v === 'same') { setSay('درسته! ۰/۱ = ۰/۱۰ = ۰/۱۰۰. صفرِ سمت راستِ اعشار ارزش عدد را عوض نمی‌کند.'); setReady(true); }
    else setSay('به شکل نگاه کن: با صفر گذاشتن، تعداد خانه‌های رنگی عوض شد؟');
  };
  return (
    <div className="ls ls-zero">
      <div className="zgrid"><UnitGrid count={10} cell={22} /><div className="muted" style={{ fontSize: 17, fontWeight: 700 }}>همیشه ۱۰ خانه رنگی</div></div>
      <div className="zright">
        <div className="znum"><Num v={text} className="big" /></div>
        <div className="znum2"><Frac n="۱" d="۱۰" /> = <Frac n={`1${'0'.repeat(z)}`} d={`1${'0'.repeat(z + 1)}`} /></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-purple btn-sm" disabled={z >= 3} onClick={more}>+ یک صفر</button>
          <button className="btn btn-white btn-sm" disabled={z === 0} onClick={() => { setZ(0); setAns(null); }}>از اول</button>
        </div>
        {z >= 2 && (
          <div className="zq">
            <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 8 }}>صفرِ سمت راستِ اعشار، ارزش عدد را…</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className={`btn btn-sm ${ans === 'change' ? 'btn-red' : 'btn-white'}`} onClick={() => choose('change')}>تغییر می‌دهد</button>
              <button className={`btn btn-sm ${ans === 'same' ? 'btn-green' : 'btn-white'}`} onClick={() => choose('same')}>تغییر نمی‌دهد</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const LEARN_SCENES = [
  { id: 'place', title: 'ارزش مکانی', Comp: PlaceScene },
  { id: 'paint', title: 'ساختن مدل', Comp: PaintScene },
  { id: 'zero', title: 'صفرِ آخر', Comp: ZeroScene },
];
