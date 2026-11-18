// Item generators + answer checking for stage 2, «پل کسر و اعشار» (book chapter 3, p.45-46).
// Pure functions only. Four skills:
//   fracDec   fraction -> decimal           (p.45 kar dar class 1 and 3)
//   decFrac   decimal  -> fraction / mixed  (p.45 kar dar class 2)
//   expanded  expanded form                 (p.46 kar dar class 1)
//   calc      add / subtract decimals       (p.46 kar dar class 2 and 5)
import { SCALE, parseDec, fromScaled, eqDec, gcd } from '../lib/decimal.js';
import { randInt, pick, shuffle } from '../lib/rng.js';

export const SKILLS = ['fracDec', 'decFrac', 'expanded', 'calc'];
export const SKILL_META = {
  fracDec: { fa: 'کسر به اعشار' },
  decFrac: { fa: 'اعشار به کسر' },
  expanded: { fa: 'شکل گسترده' },
  calc: { fa: 'جمع و تفریق' },
};
export const WARMUP = ['fracDec', 'decFrac', 'expanded', 'calc'];

let uid = 0;
const nextId = () => `b${++uid}`;

/** digits only, without the point, leading zeros and trailing zeros: "0.045" -> "45", "42.80" -> "428" */
export const sig = (s) => String(s).replace('.', '').replace(/^0+/, '').replace(/0+$/, '');

/** n/d as an exact decimal string when d divides 10^4 (2, 4, 5, 10, 20, 25, 50, 100, 1000 ...) */
export function decOfFrac(n, d) {
  if (SCALE % d !== 0) throw new Error(`denominator ${d} has no short decimal form`);
  return fromScaled(n * (SCALE / d));
}

const TEN_POWERS = [10, 100, 1000];
const zerosOf = (d) => String(d).length - 1;

/** smallest 10/100/1000 that d divides, with the multiplier that gets there */
export function bridgeOf(d) {
  const D = TEN_POWERS.find((p) => p % d === 0);
  return D ? { D, k: D / d } : null;
}

/* ------------------------------------------------------------------ fracDec */
function genFracDec(level, rng) {
  let n;
  let d;
  if (level === 1) {
    d = pick(rng, [10, 100]);
    do { n = randInt(rng, 1, d - 1); } while (n % 10 === 0);
  } else if (level === 2) {
    if (rng() < 0.5) {
      // book p.45 no.1: the numerator ends in zero, so the decimal shortens (30/100 -> 0.3)
      d = pick(rng, [100, 1000]);
      n = randInt(rng, 1, 9) * (d === 100 ? 10 : 100);
    } else {
      // improper / mixed: 23/10, 237/100
      d = pick(rng, [10, 100]);
      do { n = randInt(rng, d + 1, d * 9); } while (n % 10 === 0);
    }
  } else {
    d = pick(rng, [2, 4, 5, 20, 25, 50]);
    do { n = randInt(rng, 1, d * 5); } while (n % d === 0 || n % 10 === 0);
  }
  const value = decOfFrac(n, d);
  const br = TEN_POWERS.includes(d) ? null : bridgeOf(d);
  const D = br ? br.D : d;
  const n2 = br ? n * br.k : n;
  const isTen = !br;
  const m = zerosOf(D);
  return {
    type: 'fracDec',
    key: `fd:{${n}|${d}}`,
    data: { n, d, value, bridge: br ? { ...br, n2 } : null, places: m },
    hint: isTen
      ? `مخرج ${d} است، پس ${m} رقم بعد از ممیز داریم. صورت ${n} را بنویس و ممیز را طوری بگذار که ${m} رقم بعد از آن باشد (اگر رقم کم بود، جلویش صفر بگذار).`
      : `مخرج را ۱۰ یا ۱۰۰ کن: ${d} × ${br.k} = ${D}. صورت هم: ${n} × ${br.k} = ${n2}.`,
    explain: isTen
      ? `{${n}|${d}} یعنی ${m} رقم بعد از ممیز: {${n}|${d}} = ${value}.`
      : `{${n}|${d}} = {${n2}|${D}} = ${value}.`,
    feedback: {
      place: isTen
        ? `رقم‌ها درستند ولی جای ممیز نه! مخرج ${d} یعنی ${m} رقم بعد از ممیز.`
        : `رقم‌ها درستند ولی جای ممیز نه! {${n2}|${D}} یعنی ${m} رقم بعد از ممیز.`,
      raw: `صورت را مستقیم بعد از ممیز ننویس. اول مخرج را ۱۰ یا ۱۰۰ کن (× ${br ? br.k : ''}) و صورت را هم همان‌قدر ضرب کن.`,
      wrong: isTen
        ? `به تعداد صفرهای مخرج رقم بعد از ممیز می‌آید. مخرج ${d} چند صفر دارد؟`
        : 'کسر را با ضرب صورت و مخرج در یک عدد، به مخرج ۱۰ یا ۱۰۰ برسان؛ بعد بخوانش.',
    },
  };
}

function checkFracDec(item, answer) {
  const a = typeof answer === 'string' ? answer : '';
  const { value, n, bridge } = item.data;
  if (eqDec(a, value)) return { ok: true };
  if (sig(a) === sig(value) && sig(a) !== '') return { ok: false, code: 'place' };
  if (bridge && sig(a) === sig(String(n))) return { ok: false, code: 'raw' };
  return { ok: false, code: 'wrong' };
}

/* ------------------------------------------------------------------ decFrac */
function genDecFrac(level, rng) {
  let whole = 0;
  let frac; // digits after the point, as typed
  if (level === 1) {
    frac = rng() < 0.5 ? String(pick(rng, [1, 3, 7, 9])) : String(pick(rng, [13, 17, 19, 21, 23, 29, 31, 37, 39, 41, 43, 47, 49, 51, 53, 57, 59, 61, 67, 69, 71, 73, 77, 79, 81, 83, 87, 89, 91, 93, 97, 99]));
  } else if (level === 2) {
    frac = pick(rng, ['2', '4', '5', '6', '8', '25', '75', '35', '15', '12', '45', '05', '04', '08', '16', '24', '36', '48', '64', '72']);
  } else {
    whole = randInt(rng, 1, 19);
    frac = pick(rng, ['2', '4', '5', '6', '8', '25', '75', '35', '15', '12', '45', '05', '04', '08']);
    if (frac.length === 1 && rng() < 0.3) frac += '0'; // 13.50: the trailing zero from stage 1 again
  }
  const value = `${whole}.${frac}`;
  const n0 = Number(frac);
  const d0 = 10 ** frac.length;
  const g = gcd(n0, d0);
  const n = n0 / g;
  const d = d0 / g;
  const reducible = g > 1;
  return {
    type: 'decFrac',
    key: `df:${value}`,
    data: { value, whole, n, d, n0, d0, mixed: whole > 0 },
    hint: `${whole ? `قسمت صحیح ${whole} را کنار بگذار. ` : ''}بعد از ممیز ${frac.length} رقم داریم، پس مخرج ${d0} است: {${n0}|${d0}}.${reducible ? ' حالا صورت و مخرج را بر یک عدد مشترک تقسیم کن تا ساده شود.' : ' این کسر دیگر ساده نمی‌شود.'}`,
    explain: `${value} = ${whole ? `${whole} و ` : ''}{${n0}|${d0}}${reducible ? ` = ${whole ? `${whole} و ` : ''}{${n}|${d}}` : ''}.`,
    feedback: {
      reduce: 'برابر است، ولی هنوز می‌شود ساده‌ترش کرد: صورت و مخرج را بر یک عدد مشترک تقسیم کن (مثلاً ۲ یا ۵ یا ۱۰).',
      mixedForm: 'در عدد مخلوط، قسمت کسری باید از یک کوچک‌تر باشد. صورت از مخرج بزرگ‌تر شده است.',
      flip: 'صورت و مخرج جابه‌جا شدند! مخرج (پایین) با تعداد رقم‌های اعشار می‌آید.',
      den: `مخرج با تعداد رقم‌های اعشار ساخته می‌شود: ${frac.length} رقم یعنی مخرج ${d0}.`,
      wrong: `اول بنویس ${n0} روی ${d0}، یعنی تعداد رقم‌های اعشار مخرج را می‌سازد. بعد ساده کن.`,
    },
  };
}

function checkDecFrac(item, a) {
  const { whole, n, d } = item.data;
  if (!a || a.n == null || a.d == null || a.d === 0) return { ok: false, code: 'wrong' };
  const w = a.w ?? 0;
  const equal = (w * a.d + a.n) * d === (whole * d + n) * a.d;
  if (equal) {
    if (w > 0 && a.n >= a.d) return { ok: false, code: 'mixedForm' };
    if (gcd(a.n, a.d) !== 1) return { ok: false, code: 'reduce' };
    return { ok: true };
  }
  if (a.n === item.data.d && a.d === item.data.n) return { ok: false, code: 'flip' };
  if (a.n === item.data.n0 && a.d !== item.data.d0) return { ok: false, code: 'den' };
  return { ok: false, code: 'wrong' };
}

/* ------------------------------------------------------------------ expanded */
const DEC_PLACE_FA = ['یکان', 'دهم', 'صدم', 'هزارم', 'ده‌هزارم'];

/** one chip describing "digit x place" */
function partOf(kind, digit, place) {
  if (kind === 'frac') {
    if (place === 0) return { key: `i:${digit}`, kind: 'int', text: String(digit) };
    return { key: `f:${digit}/${10 ** place}`, kind: 'frac', n: digit, d: 10 ** place, digit };
  }
  const text = place === 0 ? String(digit) : fromScaled(digit * (SCALE / 10 ** place));
  return { key: `d:${text}`, kind: place === 0 ? 'int' : 'dec', text, digit };
}

const partDigit = (p) => (p.kind === 'frac' ? p.n : Number(sig(p.text)));

function genExpanded(level, rng) {
  const kind = level === 3 ? 'frac' : 'dec';
  let whole;
  let digits; // digits after the point
  if (level === 1) {
    whole = randInt(rng, 1, 9);
    digits = [randInt(rng, 1, 9), randInt(rng, 1, 9)];
  } else if (level === 2) {
    do {
      whole = rng() < 0.25 ? 0 : randInt(rng, 1, 9);
      const len = pick(rng, [3, 4]);
      digits = Array.from({ length: len }, () => randInt(rng, 0, 9));
      digits[len - 1] = randInt(rng, 1, 9); // last place is never zero
    } while (digits.filter(Boolean).length < 2 || digits.filter(Boolean).length + (whole ? 1 : 0) > 4);
  } else {
    whole = rng() < 0.35 ? 0 : randInt(rng, 1, 9);
    const len = pick(rng, [2, 2, 3]);
    do {
      digits = Array.from({ length: len }, () => randInt(rng, 0, 9));
      digits[len - 1] = randInt(rng, 1, 9);
    } while (digits.filter(Boolean).length < 2);
  }
  const places = digits.length;
  const parts = [];
  if (whole) parts.push(partOf(kind, whole, 0));
  digits.forEach((dg, i) => { if (dg) parts.push(partOf(kind, dg, i + 1)); });

  // decoys: the same digits in the wrong place
  const have = new Set(parts.map((p) => p.key));
  const cands = [];
  if (whole) cands.push(...Array.from({ length: places }, (_, i) => partOf(kind, whole, i + 1)));
  digits.forEach((dg, i) => {
    if (!dg) return;
    for (let q = 0; q <= places; q++) if (q !== i + 1) cands.push(partOf(kind, dg, q));
  });
  const decoys = shuffle(rng, cands.filter((c, i, arr) => !have.has(c.key) && arr.findIndex((x) => x.key === c.key) === i)).slice(0, 2);
  const chips = shuffle(rng, [...parts, ...decoys]).map((p, i) => ({ ...p, id: `x${i}` }));

  const decText = `${whole}.${digits.join('')}`;
  const fracDen = 10 ** places;
  const fracNum = Number(digits.join(''));
  const target = kind === 'frac'
    ? { kind, whole, n: fracNum, d: fracDen }
    : { kind, text: decText };
  const expl = parts.map((p) => (p.kind === 'frac' ? `{${p.n}|${p.d}}` : p.text)).join(' + ');
  return {
    type: 'expanded',
    key: `ex:${kind}:${decText}`,
    data: {
      kind, target, parts, chips,
      strip: [{ name: DEC_PLACE_FA[0], digit: whole }, ...digits.map((dg, i) => ({ name: DEC_PLACE_FA[i + 1], digit: dg }))],
    },
    hint: kind === 'frac'
      ? 'هر رقم را با ارزش جایگاهش بنویس: رقم دهم می‌شود «رقم روی ۱۰»، رقم صدم «رقم روی ۱۰۰» و… . رقمِ صفر جمله ندارد.'
      : 'هر رقم را با ارزش جایگاهش بنویس. رقمِ صفر جمله ندارد. جمله‌ها از جایگاه بزرگ‌تر به کوچک‌تر می‌آیند.',
    explain: kind === 'frac'
      ? `${whole ? `${whole} ` : ''}{${fracNum}|${fracDen}} = ${expl}.`
      : `${decText} = ${expl}.`,
    feedback: {
      order: 'جمله‌ها درستند ولی ترتیبشان نه: از جایگاه بزرگ‌تر شروع کن؛ اول صحیح، بعد دهم، بعد صدم…',
      place: 'رقم‌ها درستند، ولی ارزش مکانی بعضی‌شان نه! رقم را با جایگاه خودش بنویس؛ مثلاً ۳ در جایگاه صدم می‌شود ۰/۰۳ نه ۰/۳.',
      wrong: 'هر رقم عدد یک جمله می‌سازد. جدول ارزش مکانی را ببین و رقم‌های غیر صفر را با ارزششان بنویس.',
    },
  };
}

function checkExpanded(item, answer) {
  const { parts, chips } = item.data;
  if (!Array.isArray(answer) || answer.length !== parts.length || answer.some((x) => x == null)) return { ok: false, code: 'wrong' };
  const keys = answer.map((id) => chips.find((c) => c.id === id).key);
  if (parts.every((p, i) => p.key === keys[i])) return { ok: true };
  if ([...keys].sort().join() === parts.map((p) => p.key).sort().join()) return { ok: false, code: 'order' };
  const got = answer.map((id) => partDigit(chips.find((c) => c.id === id))).sort().join();
  const want = parts.map(partDigit).sort().join();
  if (got === want) return { ok: false, code: 'place' };
  return { ok: false, code: 'wrong' };
}

/* ------------------------------------------------------------------ calc */
const d1 = (rng) => randInt(rng, 1, 9);

function genCalc(level, rng) {
  let a;
  let b;
  let op;
  let mode = 'mental';
  if (level === 1) {
    const t = pick(rng, ['w+t', 't+t', 'wt+t', 'w-t', 'wt-t']);
    if (t === 'w+t') { a = String(d1(rng)); b = `0.${d1(rng)}`; op = '+'; }
    else if (t === 't+t') { a = `0.${d1(rng)}`; b = `0.${d1(rng)}`; op = '+'; }
    else if (t === 'wt+t') { a = `${d1(rng)}.${d1(rng)}`; b = `0.${d1(rng)}`; op = '+'; }
    else if (t === 'w-t') { a = String(randInt(rng, 2, 9)); b = `0.${d1(rng)}`; op = '-'; }
    else { const x = randInt(rng, 1, 9); const y = randInt(rng, x + 1, 9); a = `${randInt(rng, 1, 8)}.${x}`; b = `0.${y}`; op = '-'; }
  } else if (level === 2) {
    const t = pick(rng, ['h+t', 'w+h', 'ww.hh-h', 'w.t-w', 'wh+t']);
    if (t === 'h+t') { a = `0.0${d1(rng)}`; b = `0.${d1(rng)}`; op = '+'; if (rng() < 0.5) [a, b] = [b, a]; }
    else if (t === 'w+h') { a = String(d1(rng)); b = `0.0${d1(rng)}`; op = '+'; }
    else if (t === 'ww.hh-h') { const x = d1(rng); a = `${randInt(rng, 2, 9)}.${x}${randInt(rng, 1, 9)}`; b = `0.0${randInt(rng, 1, 9)}`; op = '-'; }
    else if (t === 'w.t-w') { const w = randInt(rng, 2, 8); a = `${w + randInt(rng, 1, 2)}.${d1(rng)}`; b = String(w); op = '-'; }
    else { a = `${d1(rng)}.${d1(rng)}${d1(rng)}`; b = `0.${d1(rng)}`; op = '+'; }
  } else {
    mode = 'column';
    const t = pick(rng, ['sub3', 'add4', 'add3', 'wsub']);
    const dg = (n) => Array.from({ length: n }, () => randInt(rng, 0, 9)).join('');
    if (t === 'sub3') {
      do { a = `${randInt(rng, 2, 9)}.${dg(3)}`; b = `${randInt(rng, 1, 8)}.${dg(3)}`; } while (parseDec(a) <= parseDec(b));
      op = '-';
    } else if (t === 'add4') {
      a = `0.${randInt(rng, 1, 9)}${dg(3)}`; b = `0.${randInt(rng, 1, 9)}${dg(3)}`; op = '+';
    } else if (t === 'add3') {
      a = `${randInt(rng, 10, 19)}.${dg(3)}`; b = `${randInt(rng, 10, 19)}.${dg(3)}`; op = '+';
    } else {
      a = String(randInt(rng, 3, 9));
      do { b = `${randInt(rng, 1, 2)}.${dg(3)}`; } while (parseDec(a) <= parseDec(b));
      op = '-';
    }
  }
  const A = parseDec(a);
  const B = parseDec(b);
  const result = fromScaled(op === '+' ? A + B : A - B);
  const sym = op === '+' ? '+' : '−';
  const ai = Number(a.replace('.', ''));
  const bi = Number(b.replace('.', ''));
  const misRaw = op === '+' ? ai + bi : ai - bi;
  const mis = misRaw > 0 ? String(misRaw) : null;
  return {
    type: 'calc',
    key: `c:${a}${op}${b}`,
    data: { a, b, op, sym, result, mode, mis },
    hint: 'ممیز زیر ممیز! یکان زیر یکان، دهم زیر دهم، صدم زیر صدم. جای خالی را با صفر پر کن، بعد مثل عدد صحیح جمع یا تفریق کن.',
    explain: `${a} ${sym} ${b} = ${result}. وقتی ممیزها زیر هم باشند، هر ارزش با هم‌ارزشِ خودش جمع یا تفریق می‌شود.`,
    feedback: {
      align: 'رقم‌ها را مثل عدد صحیح زیر هم نگذار! ممیزها باید زیر هم بیایند: یکان با یکان و دهم با دهم.',
      point: 'رقم‌ها درستند ولی جای ممیز نه. تعداد رقم‌های اعشار جواب را با ستون‌ها چک کن.',
      wrong: 'ممیزها را زیر هم بنویس و جای خالی را با صفر پر کن. بعد از راست شروع کن.',
    },
  };
}

function checkCalc(item, answer) {
  const a = typeof answer === 'string' ? answer : '';
  const { result, mis } = item.data;
  if (eqDec(a, result)) return { ok: true };
  if (mis && sig(a) === sig(mis)) return { ok: false, code: 'align' };
  if (sig(a) === sig(result) && sig(a) !== '') return { ok: false, code: 'point' };
  return { ok: false, code: 'wrong' };
}

/* ------------------------------------------------------------------ registry */
const GEN = { fracDec: genFracDec, decFrac: genDecFrac, expanded: genExpanded, calc: genCalc };
const CHECK = { fracDec: checkFracDec, decFrac: checkDecFrac, expanded: checkExpanded, calc: checkCalc };

export function makeItem(skill, level, rng, seen = new Set()) {
  let item;
  for (let i = 0; i < 25; i++) {
    item = GEN[skill](level, rng);
    if (!seen.has(item.key)) break;
  }
  return { id: nextId(), skill, level, ...item };
}

export function checkItem(item, answer) {
  const r = CHECK[item.type](item, answer);
  if (r.ok) return { ok: true };
  return { ok: false, code: r.code, message: item.feedback[r.code] ?? item.feedback.wrong };
}
