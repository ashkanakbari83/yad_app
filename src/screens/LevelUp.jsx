import Avatar from '../components/Avatar.jsx';
import { Num } from '../components/ui.jsx';
import { useGame } from '../lib/game.jsx';

const CAT_FA = { color: 'رنگ', eyes: 'چشم', hat: 'کلاه', acc: 'اکسسوری', back: 'پشت', base: 'شخصیت' };

export default function LevelUp({ info, onClose }) {
  const { state } = useGame();
  return (
    <div className="modal-back" style={{ zIndex: 95 }}>
      <div className="modal card" style={{ alignItems: 'center', textAlign: 'center', width: 520 }} role="dialog" aria-label="سطح جدید">
        <Avatar avatar={state.avatar} mood="happy" size={130} />
        <h2 className="h1" style={{ fontSize: 34 }}>سطح <Num v={info.level} /> شدی!</h2>
        {info.items.length > 0 ? (
          <p className="txt">آیتم تازه باز شد: {info.items.map((i) => `${i.fa} (${CAT_FA[i.cat]})`).join('، ')}. در «شخصیت من» امتحانش کن.</p>
        ) : <p className="txt">آفرین! همین‌طور ادامه بده.</p>}
        <button className="btn btn-yellow btn-lg" onClick={onClose}>عالی!</button>
      </div>
    </div>
  );
}
