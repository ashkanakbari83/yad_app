// Learning scenes of stage 2 («پل کسر و اعشار»). Every scene is hands-on and ends with ready=true.
import { useEffect, useState } from 'react';
import { Frac, Num } from './ui.jsx';
import { Column } from './BridgeViews.jsx';
import { faDigits } from '../lib/fa.js';
import { gcd } from '../lib/decimal.js';

/** n / 10^m as a decimal string, from digits only: (7, 1000) -> "0.007", (237, 100) -> "2.37" */
const decOf = (n, d) => {
  const m = String(d).length - 1;
  const s = String(n).padStart(m + 1, '0');
  return `${s.slice(0, -m)}.${s.slice(-m)}`;
};
const ZERO_WORD = { 10: 'یک صفر', 100: 'دو صفر', 1000: 'سه صفر' };
const DIGIT_WORD = { 10: 'یک رقم', 100: 'دو رقم', 1000: 'سه رقم' };
const PLACE_NAME = ['دهم', 'صدم', 'هزارم'];

/* Scene 1: the denominator tells how many digits follow the point */
function FracScene({ setSay, setReady }) {
  const [n, setN] = useState(7);
  const [d, setD] = useState(10);
  const [seen, setSeen] = useState([10]);
  useEffect(() => { setSay('یک کسر با مخرج ۱۰، ۱۰۰ یا ۱۰۰۰ را مستقیم می‌شود اعشاری نوشت. مخرج را عوض کن و ببین رقم‌ها کجا می‌نشینند!'); }, [setSay]);
  const pickD = (x) => {
    setD(x);
    const nx = seen.includes(x) ? seen : [...seen, x];
    setSeen(nx);
    setSay(`مخرج ${faDigits(x)} ${ZERO_WORD[x]} دارد، پس ${DIGIT_WORD[x]} بعد از ممیز می‌آید.`);
    if (nx.length === 3) { setSay('دیدی؟ تعداد صفرهای مخرج = تعداد رقم‌های بعد از ممیز. اگر رقم کم آمد، جلویش صفر می‌گذاریم.'); setReady(true); }
  };
  const m = String(d).length - 1;
  const digits = String(n).padStart(m, '0').slice(-m).split('');
  return (
    <div className="ls">
      <div className="ls-eq" dir="ltr">
        <Frac n={n} d={d} size={1.9} /><span className="eq">=</span><Num v={decOf(n, d)} className="big" />
      </div>
      <div className="ptable" dir="ltr">
        <div className="pcol"><div className="phead">صحیح</div><div className="pslot sm"><span className="dchip static">{faDigits(Math.floor(n / d))}</span></div></div>
        <div className="ppoint" aria-hidden><span>ممیز</span></div>
        {PLACE_NAME.slice(0, m).map((nm, i) => (
          <div className="pcol" key={nm}><div className="phead dec">{nm}</div><div className="pslot sm full"><span className="dchip static">{faDigits(digits[i])}</span></div></div>
        ))}
      </div>
      <div className="ls-ctrl row">
        <div className="stepper">
          <button className="btn btn-white btn-sm" aria-label="کمتر" disabled={n <= 1} onClick={() => setN(n - 1)}>−</button>
          <span className="muted" style={{ fontSize: 17, fontWeight: 800 }}>صورت</span>
          <button className="btn btn-white btn-sm" aria-label="بیشتر" disabled={n >= 99} onClick={() => setN(n + 1)}>+</button>
        </div>
        <div className="stepper">
          <span className="muted" style={{ fontSize: 17, fontWeight: 800 }}>مخرج</span>
          {[10, 100, 1000].map((x) => <button key={x} className={`btn btn-sm ${d === x ? 'btn-purple' : 'btn-white'}`} onClick={() => pickD(x)}><Num v={x} /></button>)}
        </div>
      </div>
    </div>
  );
}

/* Scene 2: reach denominator 10 / 100 by multiplying top and bottom */
const MUL_ROUNDS = [
  { n: 9, d: 20, opts: [2, 5, 10], ok: 5 },
  { n: 7, d: 25, opts: [2, 4, 5], ok: 4 },
];
function MulScene({ setSay, setReady }) {
  const [r, setR] = useState(0);
  const [done, setDone] = useState(false);
  const [bad, setBad] = useState(null);
  const round = MUL_ROUNDS[r];
  useEffect(() => { setSay('مخرج ۲۰ را نمی‌شود مستقیم اعشاری خواند. آن را در عددی ضرب کن تا ۱۰ یا ۱۰۰ بشود. صورت را هم همان‌قدر ضرب کن!'); }, [setSay]);
  const pick = (k) => {
    if (done) return;
    if (k === round.ok) {
      setDone(true); setBad(null);
      const n2 = round.n * k; const D = round.d * k;
      setSay(`{${faDigits(round.n)}|${faDigits(round.d)}} = {${faDigits(n2)}|${faDigits(D)}} = ${faDigits(decOf(n2, D)).replace('.', '/')}. صورت و مخرج را با هم ضرب کردیم، پس کسر عوض نشد.`);
      if (r === MUL_ROUNDS.length - 1) setReady(true);
    } else {
      setBad(k);
      const D = round.d * k;
      setSay(`${faDigits(round.d)} × ${faDigits(k)} = ${faDigits(D)}؛ هنوز ۱۰ یا ۱۰۰ یا ۱۰۰۰ نشد. یک عدد دیگر امتحان کن.`);
    }
  };
  const nextRound = () => { setR(r + 1); setDone(false); setBad(null); setSay('حالا یک کسر دیگر! چه عددی مخرج را ۱۰۰ می‌کند؟'); };
  const n2 = round.n * round.ok;
  const D = round.d * round.ok;
  return (
    <div className="ls">
      <div className="ls-eq" dir="ltr">
        <Frac n={round.n} d={round.d} size={2.4} />
        <span className="eq">=</span>
        {done ? <><Frac n={n2} d={D} size={2.4} /><span className="eq">=</span><Num v={decOf(n2, D)} className="big" /></> : <span className="fd-q">؟</span>}
      </div>
      <div className="ls-ctrl">
        <span className="muted" style={{ fontSize: 18, fontWeight: 800 }}>صورت و مخرج را ضرب کن در:</span>
        <div className="stepper">
          {round.opts.map((k) => <button key={k} className={`btn btn-sm ${done && k === round.ok ? 'btn-green' : bad === k ? 'btn-red' : 'btn-white'}`} disabled={done} onClick={() => pick(k)}><span dir="ltr">× <Num v={k} /></span></button>)}
        </div>
        {done && r < MUL_ROUNDS.length - 1 && <button className="btn btn-purple btn-sm" onClick={nextRound}>کسر بعدی</button>}
      </div>
    </div>
  );
}

/* Scene 3: decimal -> fraction -> simplest form */
const SIMP_ROUNDS = [
  { dec: '0.35', n: 35, d: 100, opts: [2, 5, 7, 10] },
  { dec: '0.12', n: 12, d: 100, opts: [2, 3, 4, 5] },
];
function SimplifyScene({ setSay, setReady }) {
  const [r, setR] = useState(0);
  const [cur, setCur] = useState({ n: SIMP_ROUNDS[0].n, d: SIMP_ROUNDS[0].d });
  const [fin, setFin] = useState(false);
  const [bad, setBad] = useState(null);
  const round = SIMP_ROUNDS[r];
  useEffect(() => { setSay('۰/۳۵ دو رقم بعد از ممیز دارد، پس می‌شود ۳۵/۱۰۰. حالا صورت و مخرج را بر یک عدد مشترک تقسیم کن تا ساده شود.'); }, [setSay]);
  const pick = (k) => {
    if (fin) return;
    if (cur.n % k === 0 && cur.d % k === 0) {
      const nx = { n: cur.n / k, d: cur.d / k };
      setCur(nx); setBad(null);
      if (gcd(nx.n, nx.d) === 1) {
        setFin(true);
        setSay(`${faDigits(round.dec).replace('.', '/')} = {${faDigits(nx.n)}|${faDigits(nx.d)}}. دیگر هیچ عددی صورت و مخرج را با هم نمی‌شکند، پس ساده‌ترین شکل است.`);
        if (r === SIMP_ROUNDS.length - 1) setReady(true);
      } else {
        setSay(`خوب بود! {${faDigits(nx.n)}|${faDigits(nx.d)}} هنوز ساده می‌شود. باز هم تقسیم کن.`);
      }
    } else {
      setBad(k);
      setSay(`${faDigits(cur.n % k === 0 ? cur.d : cur.n)} بر ${faDigits(k)} بخش‌پذیر نیست. باید هر دو عدد بخش‌پذیر باشند. یکی دیگر را امتحان کن.`);
    }
  };
  const nextRound = () => {
    const nr = SIMP_ROUNDS[r + 1];
    setR(r + 1); setCur({ n: nr.n, d: nr.d }); setFin(false); setBad(null);
    setSay('یک اعشار دیگر! این بار هم تا جای ممکن ساده کن.');
  };
  return (
    <div className="ls">
      <div className="ls-eq" dir="ltr">
        <Num v={round.dec} className="big" /><span className="eq">=</span><Frac n={cur.n} d={cur.d} size={2.4} />
      </div>
      <div className="ls-ctrl">
        <span className="muted" style={{ fontSize: 18, fontWeight: 800 }}>صورت و مخرج را تقسیم کن بر:</span>
        <div className="stepper">
          {round.opts.map((k) => <button key={k} className={`btn btn-sm ${bad === k ? 'btn-red' : 'btn-white'}`} disabled={fin} onClick={() => pick(k)}><span dir="ltr">÷ <Num v={k} /></span></button>)}
        </div>
        {fin && r < SIMP_ROUNDS.length - 1 && <button className="btn btn-purple btn-sm" onClick={nextRound}>اعشار بعدی</button>}
      </div>
    </div>
  );
}

/* Scene 4: point under point, then the expanded form of the answer */
function AlignScene({ setSay, setReady }) {
  const [step, setStep] = useState(0); // 0 raw, 1 aligned, 2 summed
  useEffect(() => { setSay('می‌خواهیم ۴/۳ + ۰/۰۷ را حساب کنیم. اگر رقم‌ها را مثل عدد صحیح زیر هم بنویسیم، چه می‌شود؟ ببین!'); }, [setSay]);
  const go = () => {
    if (step === 0) { setStep(1); setSay('ممیز زیر ممیز! حالا یکان زیر یکان، دهم زیر دهم و صدم زیر صدم است. جای خالی را با صفر پر کردیم (رنگ بنفش).'); }
    else if (step === 1) { setStep(2); setSay('از راست جمع کن: ۰ + ۷ = ۷، ۳ + ۰ = ۳، ۴ + ۰ = ۴. جواب ۴/۳۷ است. شکل گسترده‌اش: ۴ + ۰/۳ + ۰/۰۷.'); setReady(true); }
  };
  return (
    <div className="ls">
      {step === 0 ? (
        <div className="rawcol" dir="ltr">
          <div><Num v="4.3" /></div>
          <div className="rawrow"><span className="sgn">+</span><Num v="0.07" /></div>
          <div className="rawnote">رقم‌ها از راست هم‌تراز شده‌اند. ممیزها زیر هم نیستند!</div>
        </div>
      ) : (
        <Column a="4.3" b="0.07" sym="+" pad hl result={step === 2 ? '4.37' : null} />
      )}
      {step === 2 && <div className="ls-read" dir="ltr"><Num v="4.37" /> = <Num v="4" /> + <Num v="0.3" /> + <Num v="0.07" /></div>}
      {step < 2 && <button className="btn btn-purple btn-sm" onClick={go}>{step === 0 ? 'ممیزها را هم‌تراز کن' : 'جمع بزن'}</button>}
    </div>
  );
}

export const BRIDGE_SCENES = [
  { id: 'frac', title: 'کسر و اعشار', Comp: FracScene },
  { id: 'mul', title: 'ساختن مخرج', Comp: MulScene },
  { id: 'simp', title: 'ساده کردن', Comp: SimplifyScene },
  { id: 'align', title: 'ممیز زیر ممیز', Comp: AlignScene },
];
