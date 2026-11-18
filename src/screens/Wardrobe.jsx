import { useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import { Lock } from '../components/Icons.jsx';
import { Num, TopBar } from '../components/ui.jsx';
import { CATEGORIES } from '../data/avatarItems.js';
import { levelInfo } from '../data/levels.js';
import { useGame } from '../lib/game.jsx';

const TABS = [
  ['base', 'شخصیت'], ['color', 'رنگ'], ['eyes', 'چشم'], ['hat', 'کلاه'], ['acc', 'اکسسوری'], ['back', 'پشت'],
];

export default function Wardrobe({ onBack }) {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState('hat');
  const [name, setName] = useState(state.profile?.name || '');
  const { level } = levelInfo(state.xp);
  const av = state.avatar;
  const key = tab;
  const saveName = () => {
    const n = name.trim();
    if (n) dispatch({ type: 'setup', name: n, avatar: {} });
  };
  return (
    <div className="screen" data-world="ch3">
      <div className="world-bg" style={{ background: 'linear-gradient(180deg,#2b1a66,#7a4dd0)' }} />
      <TopBar title="شخصیت من" onBack={onBack} right={<span className="chip">سطح <Num v={level} /></span>} />
      <div className="ward layer">
        <div className="stage">
          <Avatar avatar={av} size={250} mood="idle" />
          <div className="name-edit">
            <input className="name-input" style={{ width: 200 }} maxLength={12} value={name} aria-label="اسم شخصیت"
              onChange={(e) => setName(e.target.value)} onBlur={saveName} />
          </div>
        </div>
        <div className="panel card">
          <div className="tabs" role="tablist">
            {TABS.map(([id, fa]) => <button key={id} role="tab" className="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{fa}</button>)}
          </div>
          <div className="items">
            {CATEGORIES[key].map((it) => {
              const locked = it.lvl > level;
              const sel = av[key] === it.id;
              return (
                <button
                  key={it.id} className="pick" aria-pressed={sel} disabled={locked} aria-label={`${it.fa}${locked ? ` (قفل، سطح ${it.lvl})` : ''}`}
                  onClick={() => dispatch({ type: 'avatar', patch: { [key]: it.id } })}
                >
                  {key === 'color'
                    ? <span className="swatch" style={{ background: it.hex }} />
                    : <Avatar avatar={{ ...av, [key]: it.id, ...(key === 'hat' ? {} : {}) }} size={key === 'base' ? 74 : 78} animate={false} />}
                  {locked && <span className="lock"><Lock width="26" height="26" />سطح <Num v={it.lvl} /></span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
