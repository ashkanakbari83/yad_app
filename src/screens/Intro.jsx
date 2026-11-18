import Scene from '../components/Scene.jsx';
import Avatar from '../components/Avatar.jsx';
import { DEFAULT_AVATAR } from '../data/avatarItems.js';
import { useGame } from '../lib/game.jsx';
import { Play } from '../components/Icons.jsx';

export default function Intro({ onStart }) {
  const { state } = useGame();
  const returning = !!state.profile;
  return (
    <div className="screen intro" data-world="ch3">
      <div className="world-bg"><Scene world="ch3" /></div>
      <div className="layer" style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="logo">یاد<small>YAD</small></div>
          <p className="txt on-world" style={{ fontSize: 26, fontWeight: 700, marginTop: 10 }}>ماجراجویی ریاضی در جنگل ممیز</p>
          <div style={{ marginTop: 26 }}>
            <button className="btn btn-yellow btn-lg" onClick={onStart}>
              <Play width="30" height="30" /> {returning ? `ادامه، ${state.profile.name}` : 'شروع ماجراجویی'}
            </button>
          </div>
        </div>
        <Avatar avatar={returning ? state.avatar : { ...DEFAULT_AVATAR, hat: 'sprout' }} mood="happy" size={190} />
      </div>
      <p className="on-world" style={{ position: 'absolute', bottom: 14, width: '100%', textAlign: 'center', fontSize: 15, margin: 0, opacity: 0.85 }}>
        نسخه‌ی آزمایشی · پیشرفتت فقط روی همین دستگاه ذخیره می‌شود
      </p>
    </div>
  );
}
