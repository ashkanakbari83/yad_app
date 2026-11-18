import { Backspace } from './Icons.jsx';
import { faNum } from '../lib/fa.js';

/** Append a key to a decimal string with sensible rules (one point, no "00", "." on empty -> "0."). */
export function applyKey(value, key, max = 7) {
  if (key === 'del') return value.slice(0, -1);
  if (key === '.') {
    if (value.includes('.')) return value;
    return value === '' ? '0.' : `${value}.`;
  }
  if (value.length >= max) return value;
  if (value === '0') return key === '0' ? value : key;
  return value + key;
}

export function AnswerField({ value, label, state = 'idle' }) {
  return (
    <div className={`afield ${state}`} aria-live="polite" aria-label={label || 'پاسخ'}>
      {value === '' ? <span className="ph">؟</span> : <bdi dir="ltr" className="num">{faNum(value)}</bdi>}
    </div>
  );
}

export default function Keypad({ onKey, disabled = false }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];
  return (
    <div className="keypad" dir="ltr">
      {keys.map((k) => (
        <button
          key={k} className={`key ${k === '.' || k === 'del' ? 'alt' : ''}`} disabled={disabled}
          onClick={() => onKey(k)} aria-label={k === '.' ? 'ممیز' : k === 'del' ? 'پاک کردن' : faNum(k)}
        >
          {k === 'del' ? <Backspace width="30" height="26" /> : k === '.' ? <span style={{ fontSize: 34, lineHeight: 1 }}>/</span> : faNum(k)}
        </button>
      ))}
    </div>
  );
}
