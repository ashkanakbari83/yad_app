import { useState } from 'react';
import { useGame } from '../lib/game.jsx';

export default function Settings({ onClose, onReset }) {
  const { state, dispatch } = useGame();
  const [confirm, setConfirm] = useState(false);
  const fs = () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.();
    } catch { /* not supported */ }
  };
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="تنظیمات">
        <h2 className="h2">تنظیمات</h2>
        <div className="row">
          <div><div className="h3">کم کردن انیمیشن‌ها</div><div className="muted" style={{ fontSize: 16 }}>حرکت‌ها آرام‌تر و کمتر می‌شوند</div></div>
          <button className="switch" role="switch" aria-checked={state.settings.reduceMotion} aria-label="کم کردن انیمیشن‌ها"
            onClick={() => dispatch({ type: 'settings', patch: { reduceMotion: !state.settings.reduceMotion } })} />
        </div>
        <div className="row">
          <div className="h3">تمام‌صفحه</div>
          <button className="btn btn-purple btn-sm" onClick={fs}>روشن / خاموش</button>
        </div>
        <div className="row">
          <div><div className="h3">شروع دوباره</div><div className="muted" style={{ fontSize: 16 }}>همه‌ی پیشرفت این دستگاه پاک می‌شود</div></div>
          {confirm
            ? <button className="btn btn-red btn-sm" onClick={() => { dispatch({ type: 'reset' }); onReset(); }}>مطمئنم، پاک کن</button>
            : <button className="btn btn-white btn-sm" onClick={() => setConfirm(true)}>پاک کردن</button>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button className="btn btn-lg" onClick={onClose}>بستن</button>
        </div>
      </div>
    </div>
  );
}
