import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import Avatar, { Firefly } from '../components/Avatar.jsx';
import Scene from '../components/Scene.jsx';
import ItemView from '../components/ItemViews.jsx';
import { LEARN_SCENES } from '../components/Learn.jsx';
import { BRIDGE_SCENES } from '../components/LearnBridge.jsx';
import { EVENODD_SCENES } from '../components/LearnEvenOdd.jsx';
import { MULT_SCENES } from '../components/LearnMult.jsx';
import { Close, Meter, Star, Medal } from '../components/Icons.jsx';
import { CoinChip, Num } from '../components/ui.jsx';
import { stageDef } from '../stages/defs.js';
import { isDone, newSession, nextItem, record, summary, target } from '../engine/session.js';
import { rich } from '../components/rich.jsx';
import { useGame } from '../lib/game.jsx';
import { mulberry32 } from '../lib/rng.js';
import { MEDALS } from '../lib/store.js';
import CardsGame from './CardsGame.jsx';

const SCENES = { 'ch1-1': EVENODD_SCENES, 'ch1-2': MULT_SCENES, 'ch3-1': LEARN_SCENES, 'ch3-2': BRIDGE_SCENES };

const PRAISE = ['آفرین!', 'عالی بود!', 'دقیقاً همین!', 'درست گفتی!', 'چه دقیق!', 'خیلی خوب!'];
const PRAISE_RECOVER = ['دیدی؟ با دقت درست شد!', 'پشتکار داری! این بار درست شد.', 'عالی! اشتباه، راه یاد گرفتن است.'];

/* ---------- shared chrome ---------- */
function TopBar({ title, onClose, children }) {
  const { state } = useGame();
  return (
    <div className="topbar layer">
      <button className="btn btn-ghost btn-icon btn-sm" style={{ width: 60 }} onClick={onClose} aria-label="خروج از مرحله"><Close width="26" height="26" /></button>
      <div className="title on-world">{title}</div>
      {children}
      <CoinChip coins={state.coins} />
    </div>
  );
}

function Bottom({ mood, say, tone, action }) {
  const { state } = useGame();
  return (
    <div className="bottom layer">
      <Avatar avatar={state.avatar} size={92} mood={mood} />
      <div className="say">{say && <div className={`bubble tail-l ${tone || ''}`}>{say}</div>}</div>
      <div className="actions">{action}</div>
    </div>
  );
}

/* ---------- intro ---------- */
function Intro({ def, learned, onLearn, onPractice, onClose }) {
  const { state } = useGame();
  return (
    <div className="screen" data-world={def.world}>
      <div className="world-bg"><Scene world={def.world} /></div>
      <TopBar title={def.title} onClose={onClose} />
      <div className="intro-body layer">
        <div className="card story">
          <div className="story-top">
            <Firefly size={84} />
            <p className="txt" style={{ fontSize: 22 }}>
              {def.story(state.profile?.name)}
            </p>
          </div>
          <div className="lantern-row">
            {def.skills.map((s, i) => (
              <div key={s} className="lanternbox"><Meter kind={def.meter} id={`i${i}`} level={0} size={46} /><span>{def.meta[s].fa}</span></div>
            ))}
          </div>
          <div className="story-actions">
            {learned && <button className="btn btn-white" onClick={onLearn}>مرور آموزش</button>}
            <button className="btn btn-yellow btn-lg" onClick={learned ? onPractice : onLearn}>{learned ? 'شروع تمرین' : 'شروع آموزش'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- learning scenes ---------- */
function Learn({ def, onDone, onClose }) {
  const scenes = SCENES[def.id];
  const [i, setI] = useState(0);
  const [say, setSay] = useState('');
  const [ready, setReady] = useState(false);
  const scene = scenes[i];
  const Comp = scene.Comp;
  const last = i === scenes.length - 1;
  const stableSay = useCallback((t) => setSay(t), []);
  const stableReady = useCallback((v) => setReady(v), []);
  return (
    <div className="screen" data-world={def.world}>
      <div className="world-bg"><Scene world={def.world} dim /></div>
      <TopBar title={<>آموزش <Num v={i + 1} /> از <Num v={scenes.length} /> · {scene.title}</>} onClose={onClose} />
      <div className="stage-card card layer"><Comp key={scene.id} setSay={stableSay} setReady={stableReady} /></div>
      <Bottom
        mood={ready ? 'happy' : 'idle'} say={rich(say)} tone={ready ? 'good' : ''}
        action={<button className="btn btn-green btn-lg" disabled={!ready} onClick={() => { if (last) onDone(); else { setI(i + 1); setReady(false); setSay(''); } }}>{last ? 'شروع تمرین' : 'ادامه'}</button>}
      />
    </div>
  );
}

/* ---------- adaptive practice ---------- */
function Practice({ def, stageId, onFinish, onClose }) {
  const { state, dispatch } = useGame();
  const sess = useRef(null);
  const rng = useRef(null);
  if (!sess.current) {
    sess.current = newSession(def, state.stages[stageId]?.mastery || {});
    rng.current = mulberry32((Date.now() ^ 0x9e3779b9) >>> 0);
  }
  const stats = useRef({ xp: 0, coins: 0, ok: 0 });
  const started = useRef(false);
  const [item, setItem] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [hint, setHint] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [ready, setReady] = useState(false);
  const [fb, setFb] = useState(null);
  const [resolved, setResolved] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [mood, setMood] = useState('idle');
  const [, bump] = useReducer((x) => x + 1, 0);
  const s = sess.current;

  const load = useCallback(() => {
    setItem(nextItem(s, rng.current));
    setAttempt(0); setHint(false); setAnswer(null); setReady(false); setFb(null); setResolved(false); setReveal(false); setMood('idle');
  }, [s]);
  useEffect(() => { if (!started.current) { started.current = true; load(); } }, [load]);

  const onChange = useCallback((a, r) => { setAnswer(a); setReady(r); }, []);
  const reward = (xp, coins) => { stats.current.xp += xp; stats.current.coins += coins; dispatch({ type: 'reward', xp, coins }); };

  const check = () => {
    const r = def.checkItem(item, answer);
    if (r.ok) {
      record(s, item, attempt === 0 ? 1 : 0.6);
      reward(attempt === 0 ? 8 : 7, 2);
      stats.current.ok += 1;
      dispatch({ type: 'event', name: 'correct' });
      const pool = attempt === 0 ? PRAISE : PRAISE_RECOVER;
      setFb({ tone: 'good', text: pool[(s.asked + item.level) % pool.length] });
      setMood('happy'); setResolved(true);
    } else if (attempt === 0) {
      setAttempt(1); setHint(true); setMood('oops');
      setFb({ tone: 'warn', text: <><b>{rich(r.message)}</b><br />{rich(item.hint)}</> });
    } else {
      record(s, item, 0);
      reward(2, 0);
      setReveal(true); setResolved(true); setMood('think');
      setFb({ tone: 'warn', text: <><b>با هم حل کنیم:</b> {rich(item.explain)}</> });
    }
    bump();
  };

  const proceed = () => {
    if (isDone(s)) onFinish(summary(s), stats.current);
    else load();
  };

  if (!item) return null;
  const total = target(s);
  const done = s.asked;
  const label = resolved ? (isDone(s) ? 'پایان تمرین' : 'ادامه') : attempt > 0 ? 'دوباره بررسی' : 'بررسی';
  return (
    <div className="screen" data-world={def.world}>
      <div className="world-bg"><Scene world={def.world} dim /></div>
      <TopBar title="تمرین" onClose={onClose}>
        <div className="dots" aria-label={`سؤال ${done + (resolved ? 0 : 1)} از ${total}`}>
          {Array.from({ length: total }, (_, i) => <i key={i} className={i < done ? 'on' : i === done ? 'now' : ''} />)}
        </div>
        <div className="lanterns" aria-label="فانوس‌ها">
          {def.skills.map((k, i) => <span key={k} title={def.meta[k].fa}><Meter kind={def.meter} id={`p${i}`} level={s.skills[k].m} size={30} /></span>)}
        </div>
      </TopBar>
      <div className="stage-card card layer">
        <ItemView key={item.id} item={item} hint={hint} locked={resolved} reveal={reveal} onChange={onChange} />
      </div>
      <Bottom
        mood={mood} tone={fb?.tone}
        say={fb ? fb.text : null}
        action={<button className={`btn btn-lg ${resolved ? 'btn-green' : ''}`} disabled={!resolved && !ready} onClick={resolved ? proceed : check}>{label}</button>}
      />
    </div>
  );
}

/* ---------- result ---------- */
function Result({ def, res, learnedCards, onCards, onReplay, onMap, onHome }) {
  const xp = res.stats.xp + res.bonusXp;
  const coins = res.stats.coins + res.bonusCoins;
  const line = def.resultLine[res.stars - 1];
  const { state } = useGame();
  return (
    <div className="screen" data-world={def.world}>
      <div className="world-bg"><Scene world={def.world} /></div>
      <div className="result layer">
        <div className="card rcard">
          <div className="stars-row">{[1, 2, 3].map((i) => <span key={i} className="pop" style={{ animationDelay: `${i * 0.18}s` }}><Star on={i <= res.stars} width="84" height="84" /></span>)}</div>
          <h2 className="h2">{line}</h2>
          <div className="lantern-row">
            {def.skills.map((k, i) => (
              <div key={k} className="lanternbox"><Meter kind={def.meter} id={`r${i}`} level={res.mastery[k]} size={46} /><span>{def.meta[k].fa}</span></div>
            ))}
          </div>
          <div className="gains">
            <span className="chip">+<Num v={xp} /> تجربه</span>
            <span className="chip">+<Num v={coins} /> سکه</span>
            <span className="chip"><Num v={res.firstTry} /> از <Num v={res.total} /> بار اول درست</span>
          </div>
          {res.newMedals.length > 0 && (
            <div className="gains">{res.newMedals.map((m) => <span key={m} className="chip" style={{ background: '#fff3c4' }}><Medal width="22" height="28" /> {MEDALS[m].fa}</span>)}</div>
          )}
          <div className="ractions">
            {def.hasCards && <button className="btn btn-yellow" onClick={onCards}>{learnedCards ? 'کارت‌ها: دوباره' : 'چالش ویژه: کارت‌های ممیز'}</button>}
            <button className="btn btn-purple" onClick={onReplay}>تمرین دوباره</button>
            <button className="btn btn-white" onClick={onMap}>نقشه</button>
            <button className="btn btn-green" onClick={onHome}>خانه</button>
          </div>
        </div>
        <Avatar avatar={state.avatar} size={120} mood="happy" />
      </div>
    </div>
  );
}

export default function StageRunner({ stageId, onExit, onMap, onReplay, skipLearn, onPhase }) {
  const { state, dispatch } = useGame();
  const def = stageDef(stageId);
  const saved = state.stages[stageId];
  const [phase, setPhase] = useState(skipLearn ? 'practice' : 'intro');
  const [res, setRes] = useState(null);
  useEffect(() => { onPhase?.(phase); }, [phase, onPhase]);

  const finish = (sum, stats) => {
    const earned = [];
    if (sum.firstTry >= 8) earned.push('precise');
    if (sum.recovered >= 2) earned.push('persist');
    if (sum.stars === 3) earned.push('lantern');
    earned.push(...def.extraMedals(sum));
    const bonusXp = 20;
    const bonusCoins = sum.stars * 8;
    dispatch({ type: 'stageDone', stageId, stars: sum.stars, mastery: sum.mastery, medals: earned });
    dispatch({ type: 'event', name: 'stageDone' });
    dispatch({ type: 'reward', xp: bonusXp, coins: bonusCoins });
    setRes({ ...sum, stats, bonusXp, bonusCoins, newMedals: earned.filter((m) => !state.medals.includes(m)) });
    setPhase('result');
  };
  const cardsDone = ({ perfect }) => {
    dispatch({ type: 'cardsDone', stageId });
    dispatch({ type: 'event', name: 'cards' });
    dispatch({ type: 'reward', xp: 20, coins: 10 });
    if (perfect) dispatch({ type: 'addMedal', id: 'cards' });
    setPhase('result');
  };

  switch (phase) {
    case 'intro': return <Intro def={def} learned={!!saved?.learned} onLearn={() => setPhase('learn')} onPractice={() => setPhase('practice')} onClose={onExit} />;
    case 'learn': return <Learn def={def} onDone={() => { dispatch({ type: 'learned', stageId }); setPhase('practice'); }} onClose={onExit} />;
    case 'practice': return <Practice def={def} stageId={stageId} onFinish={finish} onClose={onExit} />;
    case 'cards': return <CardsGame onDone={cardsDone} onClose={() => setPhase('result')} />;
    case 'result': return <Result def={def} res={res} learnedCards={!!saved?.cards || false} onCards={() => setPhase('cards')} onReplay={onReplay} onMap={onMap} onHome={onExit} />;
    default: return null;
  }
}
