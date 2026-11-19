import { useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import Scene from '../components/Scene.jsx';
import { BASES, COLORS, DEFAULT_AVATAR } from '../data/avatarItems.js';
import { useGame } from '../lib/game.jsx';

export default function Setup({ onDone }) {
  const { dispatch } = useGame();
  const [name, setName] = useState('');
  const [av, setAv] = useState({ ...DEFAULT_AVATAR });
  const ok = name.trim().length >= 1;
  return (
    <div className="screen setup" data-world="ch1">
      <div className="world-bg"><Scene world="ch1" dim /></div>
      <div className="preview layer">
        <Avatar avatar={av} mood="happy" size={230} />
        <div className="chip" style={{ fontSize: 22, minWidth: 150, justifyContent: 'center' }}>{name.trim() || 'اسم شخصیتت'}</div>
      </div>
      <div className="panel card layer">
        <div>
          <div className="field-label">اسم شخصیتت چیه؟</div>
          <input
            className="name-input" value={name} maxLength={12} placeholder="مثلاً: ستاره‌ی شب"
            onChange={(e) => setName(e.target.value)} aria-label="اسم شخصیت"
          />
        </div>
        <div>
          <div className="field-label">کدام دوست را انتخاب می‌کنی؟</div>
          <div className="pick-row">
            {BASES.map((b) => (
              <button key={b.id} className="pick" aria-pressed={av.base === b.id} onClick={() => setAv({ ...av, base: b.id })} aria-label={b.fa}>
                <Avatar avatar={{ ...av, base: b.id, hat: 'none', acc: 'none', back: 'none' }} size={62} animate={false} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="field-label">رنگ</div>
          <div className="pick-row">
            {COLORS.filter((c) => c.lvl === 1).map((c) => (
              <button key={c.id} className="pick" style={{ width: 66, height: 66 }} aria-pressed={av.color === c.id} onClick={() => setAv({ ...av, color: c.id })} aria-label={c.fa}>
                <span className="swatch" style={{ background: c.hex, width: 40, height: 40 }} />
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-start' }}>
          <button className="btn btn-green btn-lg" disabled={!ok} onClick={() => { dispatch({ type: 'setup', name: name.trim(), avatar: av }); onDone(); }}>
            بزن بریم!
          </button>
        </div>
      </div>
    </div>
  );
}
