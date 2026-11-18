// Exact decimal helpers (no floating point). Values are held as integers scaled by 10^4.
export const SCALE = 10000;
const PLACES = 4;

/** "12.345" -> integer scaled by SCALE, or null when the string is not a decimal. */
export function parseDec(s) {
  if (typeof s !== 'string') return null;
  const t = s.trim();
  const m = /^(\d*)(?:\.(\d*))?$/.exec(t);
  if (!m || (m[1] === '' && (m[2] === undefined || m[2] === ''))) return null;
  const frac = m[2] ?? '';
  if (frac.length > PLACES) return null;
  const whole = m[1] === '' ? 0 : Number(m[1]);
  return whole * SCALE + Number((frac + '0000').slice(0, PLACES));
}

/** scaled integer -> canonical string ("0.3", "2.07", "5") */
export function fromScaled(x) {
  const whole = Math.floor(x / SCALE);
  const frac = String(x % SCALE).padStart(PLACES, '0').replace(/0+$/, '');
  return frac ? `${whole}.${frac}` : String(whole);
}

/** canonical form: no trailing zeros, no trailing point, leading zero kept. "" when invalid. */
export function canon(s) {
  const x = parseDec(s);
  return x === null ? '' : fromScaled(x);
}

export const eqDec = (a, b) => {
  const x = parseDec(a);
  const y = parseDec(b);
  return x !== null && y !== null && x === y;
};

export const cmpDec = (a, b) => Math.sign(parseDec(a) - parseDec(b));

export const diffDec = (a, b) => fromScaled(Math.abs(parseDec(a) - parseDec(b)));

/** hundredths count (integer) -> canonical decimal string. 27 -> "0.27", 130 -> "1.3" */
export const fromHundredths = (h) => fromScaled(h * (SCALE / 100));

/** decimal string -> hundredths as integer, or null when it has more than 2 meaningful places */
export function toHundredths(s) {
  const x = parseDec(s);
  if (x === null || x % (SCALE / 100) !== 0) return null;
  return x / (SCALE / 100);
}

export const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** number of digits after the point as typed (keeps trailing zeros): "0.30" -> 2 */
export const placesOf = (s) => (s.includes('.') ? s.split('.')[1].length : 0);
