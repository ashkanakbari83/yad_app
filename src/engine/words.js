// Persian reading of decimals, as the book does it: "شصت و هشت عدد صحیح و نوزده صدم".
const UNITS = ['صفر', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
const TEENS = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
const TENS = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const PLACE_NAMES = { 1: 'دهم', 2: 'صدم', 3: 'هزارم' };

/** 0..99 -> array of word tokens, "و" as its own token: 68 -> ['شصت','و','هشت'] */
export function numberTokens(n) {
  if (!Number.isInteger(n) || n < 0 || n > 99) throw new Error(`numberTokens: out of range ${n}`);
  if (n < 10) return [UNITS[n]];
  if (n < 20) return [TEENS[n - 10]];
  const t = Math.floor(n / 10);
  const u = n % 10;
  return u ? [TENS[t], 'و', UNITS[u]] : [TENS[t]];
}

/** "68.19" -> ['شصت','و','هشت','عدد صحیح','و','نوزده','صدم'] */
export function decimalTokens(str) {
  const [w, f = ''] = str.split('.');
  const whole = Number(w || '0');
  const out = [];
  if (f === '') return numberTokens(whole);
  const fracWords = [...numberTokens(Number(f)), PLACE_NAMES[f.length]];
  if (whole > 0) out.push(...numberTokens(whole), 'عدد صحیح', 'و');
  out.push(...fracWords);
  return out;
}

export const decimalSentence = (str) => decimalTokens(str).join(' ');
export const PLACE_WORD = PLACE_NAMES;
export const UNIT_WORDS = UNITS;
