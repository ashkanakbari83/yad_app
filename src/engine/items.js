// Item generators + answer checking for the first stage (book chapter 3, p.44).
// Pure functions only: the UI lives in components/items/*.jsx.
import { fromHundredths, canon, cmpDec, eqDec, diffDec, parseDec } from '../lib/decimal.js';
import { randInt, pick, shuffle } from '../lib/rng.js';
import { decimalTokens, UNIT_WORDS } from './words.js';

export const SKILLS = ['placeValue', 'readModel', 'buildModel', 'zeroRule'];
export const SKILL_META = {
  placeValue: { fa: 'ارزش مکانی' },
  readModel: { fa: 'خواندن مدل' },
  buildModel: { fa: 'ساختن مدل' },
  zeroRule: { fa: 'صفرِ آخر' },
};

const SLOT_FA = { tens: 'دهگان', ones: 'یکان', tenths: 'دهم', hundredths: 'صدم' };
export const slotLabel = (s) => SLOT_FA[s];

let uid = 0;
const nextId = () => `it${++uid}`;

/* ------------------------------------------------------------------ placeTable */
function genPlaceTable(level, rng) {
  let slots;
  let digits;
  if (level === 1) {
    slots = ['ones', 'tenths'];
    digits = [randInt(rng, 1, 9), randInt(rng, 1, 9)];
  } else {
    slots = ['tens', 'ones', 'tenths', 'hundredths'];
    digits = [randInt(rng, 1, 9), randInt(rng, 1, 9), randInt(rng, 1, 9), randInt(rng, 1, 9)];
    if (level === 3) digits[pick(rng, [1, 2])] = 0; // a zero hiding in the ones or tenths place
  }
  const value = slots.length === 2
    ? `${digits[0]}.${digits[1]}`
    : `${digits[0]}${digits[1]}.${digits[2]}${digits[3]}`;
  const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !digits.includes(d));
  const extras = shuffle(rng, pool).slice(0, 2);
  const chips = shuffle(rng, [...digits, ...extras]).map((d, i) => ({ id: `c${i}`, digit: d }));
  return {
    type: 'placeTable',
    key: `pt:${value}`,
    data: { value, slots, digits, chips },
    hint: 'اولین رقمِ بعد از ممیز «دهم» است و دومین رقم «صدم». رقم‌های قبل از ممیز یکان و دهگان‌اند.',
    explain: `در ${value} هر رقم جای خودش را دارد: ${slots.map((s, i) => `${SLOT_FA[s]}: ${digits[i]}`).join('، ')}.`,
    feedback: {
      swapDec: 'رقم‌هایت درستند! فقط دهم و صدم جابه‌جا شده‌اند. اولین رقمِ بعد از ممیز، دهم است.',
      order: 'رقم‌ها درستند ولی جایشان نه. ممیز را مرز بگیر: چپِ ممیز یکان و دهگان، راستِ آن دهم و صدم.',
      wrong: 'یک نگاه دیگر به ممیز بینداز. رقم‌های بعد از ممیز، دهم و صدم‌اند.',
    },
  };
}

function checkPlaceTable(item, answer) {
  const want = item.data.digits;
  if (!Array.isArray(answer) || answer.length !== want.length || answer.some((x) => x == null)) {
    return { ok: false, code: 'wrong' };
  }
  if (want.every((d, i) => d === answer[i])) return { ok: true };
  const sameSet = [...want].sort().join() === [...answer].sort().join();
  if (sameSet) {
    const swapped = want.slice();
    const n = want.length;
    [swapped[n - 2], swapped[n - 1]] = [swapped[n - 1], swapped[n - 2]];
    if (swapped.every((d, i) => d === answer[i])) return { ok: false, code: 'swapDec' };
    return { ok: false, code: 'order' };
  }
  return { ok: false, code: 'wrong' };
}

/* ------------------------------------------------------------------ wordTiles */
function genWordTiles(level, rng) {
  const twoDigits = level === 3 || rng() > 0.4;
  const whole = level === 3 && rng() < 0.3 ? 0 : randInt(rng, level === 2 ? 10 : 2, 99);
  let frac;
  if (twoDigits) {
    frac = String(level === 3 ? randInt(rng, 1, 99) : randInt(rng, 11, 99)).padStart(2, '0');
    if (frac.endsWith('0')) frac = frac.slice(0, 1) + String(randInt(rng, 1, 9));
  } else {
    frac = String(randInt(rng, 1, 9));
  }
  const value = `${whole}.${frac}`;
  const tokens = decimalTokens(value);
  const unit = tokens[tokens.length - 1];
  const spare = pick(rng, UNIT_WORDS.filter((w) => !tokens.includes(w) && w !== 'صفر'));
  const wrongUnit = unit === 'صدم' ? 'دهم' : 'صدم';
  const tiles = shuffle(rng, [...tokens, wrongUnit, spare]).map((text, i) => ({ id: `w${i}`, text }));
  return {
    type: 'wordTiles',
    key: `wt:${value}`,
    data: { value, tokens, tiles },
    hint: `بعد از ممیز ${frac.length === 1 ? 'یک رقم داریم، پس «دهم»' : 'دو رقم داریم، پس «صدم»'}. اول قسمت صحیح را بخوان، بعد «عدد صحیح و»، بعد بخش اعشاری را.`,
    explain: `${value} را این‌طور می‌خوانیم: «${tokens.join(' ')}».`,
    feedback: {
      unit: 'تقریباً! نام آخر را عوض کن: رقم‌های بعد از ممیز را بشمار؛ یک رقم دهم است و دو رقم صدم.',
      wrong: 'ترتیب را مرور کن: صحیح، بعد «عدد صحیح و»، بعد اعشار با نام جایگاهش.',
    },
  };
}

function checkWordTiles(item, answer) {
  const want = item.data.tokens;
  if (!Array.isArray(answer)) return { ok: false, code: 'wrong' };
  if (want.length === answer.length && want.every((t, i) => t === answer[i])) return { ok: true };
  const unit = want[want.length - 1];
  const other = unit === 'صدم' ? 'دهم' : 'صدم';
  if (answer[answer.length - 1] === other && answer.slice(0, -1).join() === want.slice(0, -1).join()) {
    return { ok: false, code: 'unit' };
  }
  return { ok: false, code: 'wrong' };
}

/* ------------------------------------------------------------------ modelRead */
function genModelRead(level, rng) {
  let n = 0;
  let b;
  let c;
  if (level === 1) { b = randInt(rng, 1, 9); c = 0; }
  else if (level === 2) { b = randInt(rng, 0, 9); c = randInt(rng, 1, 9); }
  else { n = randInt(rng, 1, 2); b = randInt(rng, 0, 9); c = randInt(rng, 0, 9); if (b + c === 0) c = randInt(rng, 1, 9); }
  const value = fromHundredths(n * 100 + b * 10 + c);
  const parts = [];
  if (n) parts.push(`${n} واحد کامل`);
  if (b) parts.push(`${b} نوار (${b} دهم)`);
  if (c) parts.push(`${c} خانه (${c} صدم)`);
  return {
    type: 'modelRead',
    key: `mr:${value}`,
    data: { n, b, c, value },
    hint: 'هر نوار ده خانه دارد و می‌شود یک دهم (۰/۱). هر خانه‌ی کوچک می‌شود یک صدم (۰/۰۱).',
    explain: `${parts.join(' + ')} می‌شود ${value}.`,
    feedback: {
      nopoint: 'رقم‌هایت درستند؛ ممیز را فراموش نکن! نوارها دهم‌اند، پس ممیز جلوی آن‌ها می‌نشیند.',
      order: 'رقم‌ها درستند ولی جایشان نه: نوارها (دهم) اول بعد از ممیز می‌آیند و خانه‌ها (صدم) بعد از آن‌ها.',
      wrong: 'اول نوارها را بشمار، بعد خانه‌های کوچک را. هر نوار یک دهم است و هر خانه یک صدم.',
    },
  };
}

function checkModelRead(item, answer) {
  const a = typeof answer === 'string' ? answer : '';
  if (eqDec(a, item.data.value)) return { ok: true };
  // compare digits only, ignoring leading zeros ("37" vs "0.37")
  const strip = (x) => x.replace('.', '').replace(/^0+/, '');
  const want = strip(item.data.value);
  const got = strip(a);
  if (!a.includes('.') && got === want) return { ok: false, code: 'nopoint' };
  if (got.length === want.length && [...got].sort().join() === [...want].sort().join()) return { ok: false, code: 'order' };
  return { ok: false, code: 'wrong' };
}

/* ------------------------------------------------------------------ gridBuild */
function genGridBuild(level, rng) {
  let h;
  if (level === 1) h = randInt(rng, 1, 9) * 10;
  else if (level === 2) { do { h = randInt(rng, 1, 99); } while (h % 10 === 0); }
  else { do { h = 100 + randInt(rng, 5, 95); } while (h % 10 === 0); }
  const target = fromHundredths(h);
  return {
    type: 'gridBuild',
    key: `gb:${target}`,
    data: { target, hundredths: h, grids: h > 100 ? 2 : 1 },
    hint: 'یک ستون کامل ده خانه دارد و می‌شود ۰/۱. اول ستون‌ها را رنگ کن، بعد خانه‌های تکی را.',
    explain: `${target} یعنی ${[
      h >= 100 ? 'یک شبکه‌ی کامل' : '',
      Math.floor((h % 100) / 10) ? `${Math.floor((h % 100) / 10)} ستون کامل` : '',
      h % 10 ? `${h % 10} خانه‌ی تکی` : '',
    ].filter(Boolean).join(' و ')}.`,
    feedback: {
      tenthsAsCells: 'هر خانه‌ی تکی فقط یک صدم است. برای دهم باید ستون کامل (ده خانه) رنگ کنی.',
      unit: 'عددت از یک بزرگ‌تر است: شبکه‌ی اول را کامل رنگ کن، بقیه را در شبکه‌ی دوم.',
      wrong: 'شمارش را با هم چک کنیم: هر ستون یک دهم و هر خانه یک صدم است. اعداد را روی نمایشگر ببین.',
    },
  };
}

function checkGridBuild(item, answer) {
  const total = Array.isArray(answer) ? answer.reduce((s, x) => s + x, 0) : -1;
  const want = item.data.hundredths;
  if (total === want) return { ok: true };
  if (total * 10 === want) return { ok: false, code: 'tenthsAsCells' };
  if (want > 100 && Array.isArray(answer) && answer[0] !== 100) return { ok: false, code: 'unit' };
  return { ok: false, code: 'wrong' };
}

/* ------------------------------------------------------------------ zeroEq */
function genZeroEq(level, rng) {
  if (level === 3) {
    const d = randInt(rng, 1, 9);
    const base = `0.${d}`;
    const odd = pick(rng, [`0.0${d}`, `0.${d}01`, `0.${d}${d}`]);
    const opts = shuffle(rng, [base, `${base}0`, `${base}00`, odd]);
    return {
      type: 'zeroEq',
      key: `ze3:${base}:${odd}`,
      data: { kind: 'odd', options: opts, answerIndex: opts.indexOf(odd), base },
      hint: 'صفرِ سمت راستِ اعشار ارزش را عوض نمی‌کند. ببین کدام عدد فقط با صفر آخر فرق ندارد، رقمش جابه‌جا شده است.',
      explain: `${base}، ${base}0 و ${base}00 همه یک مقدارند. فقط ${odd} فرق دارد.`,
      feedback: {
        wrong: 'صفرهای آخر اعشار بی‌اثرند. دنبال عددی بگرد که رقمش جای دیگری رفته یا رقم تازه‌ای دارد.',
      },
    };
  }
  const d = randInt(rng, 1, 9);
  let a;
  let b;
  const equalCase = level === 1 || rng() < 0.5;
  if (equalCase) { a = `0.${d}`; b = `0.${d}0`; }
  else if (rng() < 0.5) { a = `0.${d}`; b = `0.0${d}`; }
  else { a = `0.${d}0`; b = `0.0${d}`; }
  if (rng() < 0.5) [a, b] = [b, a];
  const rel = cmpDec(a, b) === 0 ? '=' : cmpDec(a, b) > 0 ? '>' : '<';
  return {
    type: 'zeroEq',
    key: `ze:${a}:${b}`,
    data: { kind: 'compare', a, b, answer: rel },
    hint: 'به شکل نگاه کن: هر دو عدد چند ستون و چند خانه رنگ شده‌اند؟ ده خانه‌ی یک ستون همان یک دهم است.',
    explain: rel === '=' ? `${a} و ${b} با هم برابرند: صفرِ آخر فقط خانه‌ها را ریزتر می‌کند.`
      : `${a} ${rel === '>' ? 'بزرگ‌تر' : 'کوچک‌تر'} از ${b} است: رقمشان در جایگاه‌های مختلف است.`,
    feedback: {
      zeroEq: 'صفرِ سمت راستِ اعشار ارزش عدد را عوض نمی‌کند. ببین هر دو شکل به اندازه‌ی هم رنگ شده‌اند.',
      wrong: 'جایگاه رقم‌ها را نگاه کن؛ رقم دهم بزرگ‌تر از رقم صدم است و مدل‌ها این را نشان می‌دهند.',
    },
  };
}

function checkZeroEq(item, answer) {
  const d = item.data;
  if (d.kind === 'odd') return answer === d.answerIndex ? { ok: true } : { ok: false, code: 'wrong' };
  if (answer === d.answer) return { ok: true };
  return { ok: false, code: d.answer === '=' ? 'zeroEq' : 'wrong' };
}

/* ------------------------------------------------------------------ registry */
const GEN = {
  placeValue: (level, rng) => (level >= 2 && rng() < 0.45 ? genWordTiles(level, rng) : genPlaceTable(level, rng)),
  readModel: genModelRead,
  buildModel: genGridBuild,
  zeroRule: genZeroEq,
};
const CHECK = {
  placeTable: checkPlaceTable,
  wordTiles: checkWordTiles,
  modelRead: checkModelRead,
  gridBuild: checkGridBuild,
  zeroEq: checkZeroEq,
};

/** Build an item for a skill/level, avoiding recently used keys. */
export function makeItem(skill, level, rng, seen = new Set()) {
  let item;
  for (let i = 0; i < 25; i++) {
    item = GEN[skill](level, rng);
    if (!seen.has(item.key)) break;
  }
  return { id: nextId(), skill, level, ...item };
}

/** -> { ok, code?, message? }  message is the child-facing feedback for a wrong answer. */
export function checkItem(item, answer) {
  const r = CHECK[item.type](item, answer);
  if (r.ok) return { ok: true };
  const message = item.feedback[r.code] ?? item.feedback.wrong;
  return { ok: false, code: r.code, message };
}

/* ------------------------------------------------------------------ digit-card mini-game */
/** Book p.45: ten cards 0-9, one each. "10" is already placed left of the point; three more
 *  cards go to the right of the point. Find the number nearest to 10 (and to 11). */
export function cardsPool(left = [1, 0]) {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !left.includes(d));
}

export function cardsValue(left, digits) {
  return `${left.join('')}.${digits.join('')}`;
}

export function cardsOptimum(target, left = [1, 0], count = 3) {
  const pool = cardsPool(left);
  let best = null;
  const walk = (picked, rest) => {
    if (picked.length === count) {
      const v = cardsValue(left, picked);
      const dist = Math.abs(parseDec(v) - parseDec(String(target)));
      if (!best || dist < best.dist) best = { value: v, digits: picked.slice(), dist };
      return;
    }
    rest.forEach((d, i) => walk([...picked, d], [...rest.slice(0, i), ...rest.slice(i + 1)]));
  };
  walk([], pool);
  return best;
}

export function cardsEvaluate(target, left, digits) {
  const value = cardsValue(left, digits);
  const opt = cardsOptimum(target, left, digits.length);
  const dist = Math.abs(parseDec(value) - parseDec(String(target)));
  return {
    value,
    distance: diffDec(value, String(target)),
    optimal: dist === opt.dist,
    best: opt.value,
    canon: canon(value),
  };
}
