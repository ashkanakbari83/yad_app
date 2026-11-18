import Avatar from '../components/Avatar.jsx';
import Scene from '../components/Scene.jsx';
import { Chest, Coin, Medal, Star, Play } from '../components/Icons.jsx';
import { CoinChip, GearButton, Num } from '../components/ui.jsx';
import { CATEGORIES } from '../data/avatarItems.js';
import { levelInfo } from '../data/levels.js';
import { WORLDS } from '../data/worlds.js';
import { faNum } from '../lib/fa.js';
import { useGame } from '../lib/game.jsx';
import { jalaliLabel } from '../lib/jalali.js';
import { MEDALS, MISSION_DEFS, SPECIAL } from '../lib/store.js';

function nextUnlock(level) {
  let best = null;
  for (const [cat, list] of Object.entries(CATEGORIES)) {
    if (cat === 'base') continue;
    for (const it of list) if (it.lvl > level && (!best || it.lvl < best.lvl)) best = { ...it, cat };
  }
  return best;
}

export default function Home({ go, openSettings }) {
  const { state, dispatch } = useGame();
  const { level, into, span } = levelInfo(state.xp);
  const jl = jalaliLabel();
  const st = state.stages['ch3-1'];
  const stars = st?.bestStars || 0;
  const nu = nextUnlock(level);
  const special = state.stages[SPECIAL.stage];
  const specialReady = !!special && special.bestStars >= SPECIAL.stars;
  const world = WORLDS.find((w) => w.id === 'ch3');

  return (
    <div className="screen home" data-world="ch3">
      <div className="world-bg"><Scene world="ch3" dim /></div>
      <div className="topbar layer">
        <GearButton onClick={openSettings} />
        <div className="title on-world">
          یاد <span style={{ fontSize: 18, fontWeight: 700, opacity: 0.9 }}>· امروز <Num v={jl.day} /> {jl.month} <Num v={jl.year} /></span>
        </div>
        <CoinChip coins={state.coins} />
      </div>

      <div className="home-grid layer">
        {/* start column: the student */}
        <div className="card hero">
          <Avatar avatar={state.avatar} size={120} mood="idle" />
          <div className="nm">{state.profile?.name}</div>
          <div className="lv"><span className="lvl-badge">سطح <Num v={level} /></span></div>
          <div className="meter" role="progressbar" aria-valuenow={into} aria-valuemax={span} aria-label="تجربه"><i style={{ width: `${(into / span) * 100}%` }} /></div>
          <div className="muted" style={{ fontSize: 15, fontWeight: 700 }}>تجربه: <Num v={state.xp} /></div>
          <div className="divider" />
          <div className="medals">
            {Object.entries(MEDALS).map(([id, m]) => (
              <span key={id} title={`${m.fa}: ${m.how}`} style={{ opacity: state.medals.includes(id) ? 1 : 0.22, filter: state.medals.includes(id) ? 'none' : 'grayscale(1)' }}>
                <Medal width="30" height="38" />
              </span>
            ))}
          </div>
          {nu && <div className="teaser">بعدی: {nu.fa}<br />در سطح {faNum(nu.lvl)}</div>}
        </div>

        {/* center: continue + navigation */}
        <div className="center-col">
          <div className="card continue-card">
            <div className="scene"><Scene world="ch3" /></div>
            <div style={{ position: 'absolute', top: 16, left: 20, display: 'flex', gap: 4, zIndex: 3 }}>
              {[1, 2, 3].map((i) => <Star key={i} on={i <= stars} width="34" height="34" />)}
            </div>
            <div className="txt-block">
              <div style={{ fontSize: 17, fontWeight: 800, opacity: 0.95 }}>{world.fa} · فصل <Num v={3} /></div>
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.25, textShadow: '0 3px 10px rgba(20,16,46,.5)' }}>فانوس‌های ممیز</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10, textShadow: '0 2px 8px rgba(20,16,46,.5)' }}>ارزش مکانی و مدل اعداد اعشاری</div>
              <button className="btn btn-yellow btn-lg" onClick={() => go('stage', { stageId: 'ch3-1' })}>
                <Play width="28" height="28" /> {st?.plays ? 'ادامه‌ی ماجراجویی' : 'شروع مرحله'}
              </button>
            </div>
          </div>
          <div className="tile-row">
            <button className="btn btn-purple nav-tile" onClick={() => go('map')}>نقشه‌ی دنیاها</button>
            <button className="btn btn-mint nav-tile" onClick={() => go('ward')}>شخصیت من</button>
          </div>
        </div>

        {/* end column: missions + rewards */}
        <div className="side-col">
          <div className="card" style={{ padding: '10px 10px 8px' }}>
            <h3 className="panel-h" style={{ marginBottom: 6 }}>مأموریت‌های امروز</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {state.missions.list.map((m) => {
                const def = MISSION_DEFS[m.id];
                const done = m.progress >= def.target;
                return (
                  <div className="mission compact" key={m.id}>
                    <div className="mt">{def.fa}</div>
                    <div className="mrow">
                      <div className="mbar"><i style={{ width: `${(m.progress / def.target) * 100}%` }} /></div>
                      {m.claimed ? <span className="reward" style={{ color: 'var(--green-d)' }}>گرفتی ✓</span>
                        : done ? <button className="btn btn-yellow btn-sm" style={{ minHeight: 46, fontSize: 15, padding: '0 12px' }} onClick={() => dispatch({ type: 'claim', id: m.id })}>دریافت</button>
                          : <span className="reward"><Num v={m.progress} /> از <Num v={def.target} /></span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card" style={{ padding: '10px', flex: 1, minHeight: 0 }}>
            <h3 className="panel-h" style={{ marginBottom: 6 }}><Chest width="26" height="24" /> جایزه‌ی ویژه</h3>
            <div className="mission compact">
              <div className="mt">{SPECIAL.fa}</div>
              {state.specialClaimed ? <span className="reward" style={{ color: 'var(--green-d)' }}>گرفتی ✓</span>
                : specialReady ? <button className="btn btn-yellow btn-sm" style={{ minHeight: 46, fontSize: 15 }} onClick={() => dispatch({ type: 'claimSpecial' })}>دریافت <Num v={SPECIAL.coins} /> <Coin width="20" height="20" /></button>
                  : <span className="reward">پاداش: <Num v={SPECIAL.coins} /> سکه</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
