import { useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import Scene from '../components/Scene.jsx';
import { Chip, CoinChip, Num } from '../components/ui.jsx';
import { Close } from '../components/Icons.jsx';
import { cardsEvaluate, cardsOptimum, cardsPool } from '../engine/items.js';
import { faDigits } from '../lib/fa.js';
import { useGame } from '../lib/game.jsx';

const LEFT = [1, 0];
const ROUNDS = [10, 11];

/** Book p.45: with the cards 0-9 (one each), "10" is built; place 3 more cards right of the point. */
export default function CardsGame({ onDone, onClose }) {
  const { state } = useGame();
  const [r, setR] = useState(0);
  const [placed, setPlaced] = useState([null, null, null]);
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState(null);
  const [roundOk, setRoundOk] = useState(false);
  const [perfect, setPerfect] = useState(true);
  const [mood, setMood] = useState('think');
  const target = ROUNDS[r];
  const bank = cardsPool(LEFT).filter((d) => !placed.includes(d));
  const full = placed.every((x) => x != null);
  const reset = () => { setPlaced([null, null, null]); setTries(0); setMsg(null); setRoundOk(false); setMood('think'); };

  const put = (d, slot) => {
    if (roundOk) return;
    const next = placed.slice();
    const at = slot ?? next.indexOf(null);
    if (at < 0) return;
    next[at] = d;
    setPlaced(next);
    setMsg(null);
  };
  const take = (i) => { if (roundOk || placed[i] == null) return; const n = placed.slice(); n[i] = null; setPlaced(n); };

  const check = () => {
    const e = cardsEvaluate(target, LEFT, placed);
    if (e.optimal) {
      setRoundOk(true); setMood('happy');
      setMsg({ ok: true, text: <>عدد تو <Num v={e.value} /> است و فاصله‌اش تا <Num v={target} /> فقط <Num v={e.distance} /> است. نزدیک‌تر از این نمی‌شود!</> });
    } else {
      const t = tries + 1;
      setTries(t); setMood('oops');
      const hint = target === 10
        ? 'برای نزدیک شدن به ۱۰، عدد بعد از ممیز باید کوچک باشد: کوچک‌ترین رقم را در جایگاه دهم بگذار.'
        : 'برای نزدیک شدن به ۱۱، عدد بعد از ممیز باید بزرگ باشد: بزرگ‌ترین رقم را در جایگاه دهم بگذار.';
      setMsg({ ok: false, text: <>عدد تو <Num v={e.value} /> شد و <Num v={e.distance} /> با <Num v={target} /> فاصله دارد. می‌شود نزدیک‌تر هم ساخت! {t >= 2 ? hint : ''}</> });
    }
  };
  const show = () => {
    const best = cardsOptimum(target, LEFT, 3);
    setPlaced(best.digits); setPerfect(false); setRoundOk(true); setMood('think');
    setMsg({ ok: true, text: <>بهترین عدد <Num v={best.value} /> است. رقم‌ها را از جایگاه دهم تا هزارم دقیق‌تر ببین.</> });
  };
  const next = () => {
    if (r + 1 < ROUNDS.length) { setR(r + 1); reset(); } else onDone({ perfect });
  };

  return (
    <div className="screen" data-world="ch3">
      <div className="world-bg"><Scene world="ch3" dim /></div>
      <div className="topbar layer">
        <button className="btn btn-ghost btn-icon btn-sm" style={{ width: 60 }} onClick={onClose} aria-label="بستن"><Close width="26" height="26" /></button>
        <div className="title on-world">چالش کارت‌های ممیز <span style={{ fontSize: 18, fontWeight: 700 }}>· دور <Num v={r + 1} /> از <Num v={ROUNDS.length} /></span></div>
        <CoinChip coins={state.coins} />
      </div>
      <div className="stage-card card layer" style={{ gap: 12 }}>
        <p className="txt" style={{ fontSize: 21, textAlign: 'center' }}>
          ده کارت ۰ تا ۹ داریم. با کارت‌های ۱ و ۰ عدد ۱۰ را ساخته‌ایم. با ۳ کارت دیگر، <b>نزدیک‌ترین عدد به <Num v={target} /></b> را بساز.
        </p>
        <div className="cards-eq" dir="ltr">
          {LEFT.map((d) => <span key={d} className="dchip static dark">{faDigits(d)}</span>)}
          <span className="ppoint" style={{ height: 70 }}><span>ممیز</span></span>
          {placed.map((d, i) => (
            <button key={i} className={`pslot ${d != null ? 'full' : ''}`} data-drop={`s${i}`} onClick={() => take(i)} aria-label={`جایگاه ${i + 1}`}>
              {d != null && <span className="dchip static">{faDigits(d)}</span>}
            </button>
          ))}
        </div>
        <div className="bank" dir="ltr">
          {bank.map((d) => <Chip key={d} disabled={roundOk} onTap={() => put(d)} onDropOn={(id) => put(d, Number(id.slice(1)))}>{faDigits(d)}</Chip>)}
        </div>
      </div>
      <div className="bottom layer">
        <Avatar avatar={state.avatar} size={92} mood={mood} />
        <div className="say">{msg ? <div className={`bubble tail-l ${msg.ok ? 'good' : 'warn'}`}>{msg.text}</div> : <div className="bubble tail-l">کارت‌ها را بکش یا روی آن‌ها بزن تا در جایگاه‌ها بنشینند.</div>}</div>
        <div className="actions">
          {!roundOk && tries >= 3 && <button className="btn btn-white btn-sm" onClick={show}>نشانم بده</button>}
          {roundOk
            ? <button className="btn btn-green btn-lg" onClick={next}>{r + 1 < ROUNDS.length ? 'دور بعد' : 'تمام شد'}</button>
            : <button className="btn btn-lg" disabled={!full} onClick={check}>بسنج</button>}
        </div>
      </div>
    </div>
  );
}
