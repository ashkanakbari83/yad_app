// Stage ch1-1 «تونل‌های زوج و فرد» (book chapter 1, p.2-4).
// Four skills, two answer shapes (typed number / pick one option):
//   pattern    figure number <-> count      (p.2 no.1-2, p.4 no.2: 2n wheels, 2n-1 squares, 3n sticks)
//   parity     even or odd                  (p.2 "عددهای زوج / فرد")
//   sumParity  parity of a sum (tunnels)    (p.4 no.1)
//   seq        continue even / odd lists    (p.2-3: 2,4,6,8,10 and 1,3,5,7,9,11)
import { randInt, pick, shuffle } from '../lib/rng.js';

export const SKILLS = ['pattern', 'parity', 'sumParity', 'seq'];
export const SKILL_META = {
  pattern: { fa: 'الگو و رابطه' },
  parity: { fa: 'زوج یا فرد' },
  sumParity: { fa: 'جمع در تونل‌ها' },
  seq: { fa: 'ادامه‌ی الگو' },
};
export const WARMUP = ['parity', 'seq', 'pattern', 'sumParity'];

let uid = 0;
const nextId = () => `e${++uid}`;
export const isEven = (n) => n % 2 === 0;
const PAR = ['زوج', 'فرد'];
const parIdx = (n) => (isEven(n) ? 0 : 1);

/* the three figure families of the book */
export const FAMILIES = {
  wheel: { f: (n) => 2 * n, k: 2, unit: 'گردونه', thing: 'چرخ', formula: '۲ × شماره', kindName: 'زوج' },
  stick: { f: (n) => 3 * n, k: 3, unit: 'مثلث', thing: 'چوب', formula: '۳ × شماره', kindName: 'سه‌تایی' },
  square: { f: (n) => 2 * n - 1, k: 2, unit: 'شکل', thing: 'مربع', formula: '(۲ × شماره) − ۱', kindName: 'فرد' },
};

/* ------------------------------------------------------------------ pattern */
function genPattern(level, rng) {
  const fam = level === 3 ? pick(rng, ['wheel', 'square']) : pick(rng, ['wheel', 'stick', 'square']);
  const F = FAMILIES[fam];
  const shown = [1, 2, 3].map((n) => ({ n, v: F.f(n) }));
  const common = { fam, shown };
  const figWord = fam === 'wheel' ? 'گردونه' : fam === 'stick' ? 'مثلث' : 'شکل';

  if (level === 3) {
    // "is a figure with v pieces possible? why?" (book: 19 wheels? 28 squares?)
    const possible = rng() < 0.5;
    let v;
    let n;
    if (fam === 'wheel') { n = randInt(rng, 6, 20); v = possible ? 2 * n : 2 * n + 1; }
    else { n = randInt(rng, 6, 20); v = possible ? 2 * n - 1 : 2 * n; }
    const parityWord = fam === 'wheel' ? 'زوج' : 'فرد';
    const otherWord = fam === 'wheel' ? 'فرد' : 'زوج';
    const nn = fam === 'wheel' ? v / 2 : (v + 1) / 2;
    const good = possible
      ? `بله؛ می‌شود ${fam === 'wheel' ? `${nn} گردونه` : `شکل ${nn}`}`
      : `نه؛ تعداد ${F.thing}‌ها همیشه ${parityWord} است و ${v} ${otherWord} است`;
    const options = shuffle(rng, [
      good,
      possible ? `نه؛ تعداد ${F.thing}‌ها همیشه ${otherWord} است` : `بله؛ می‌شود ${fam === 'wheel' ? `${Math.ceil(v / 2)} گردونه` : `شکل ${Math.ceil(v / 2)}`}`,
      possible ? `بله؛ می‌شود ${fam === 'wheel' ? `${nn + 1} گردونه` : `شکل ${nn + 1}`}` : `نه؛ ${v} خیلی بزرگ است`,
    ]);
    return {
      type: 'choice',
      key: `pt3:${fam}:${v}`,
      data: {
        ...common, prompt: `آیا ${fam === 'wheel' ? `برای ساختن چند گردونه` : 'شکلی'} با ${v} ${F.thing} ممکن است؟ چرا؟`,
        visual: { kind: 'figs', fam, shown, ask: null }, options, answerIndex: options.indexOf(good), traps: {},
      },
      hint: `به جدول نگاه کن: تعداد ${F.thing}‌ها همیشه ${parityWord} می‌شود (${shown.map((s) => s.v).join('، ')}…). ${v} چه جور عددی است؟`,
      explain: possible ? `${v} در الگو هست: ${nn} ${fam === 'wheel' ? 'گردونه' : 'شکل'}.` : `${F.thing}‌ها همیشه ${parityWord}اند و ${v} ${otherWord} است، پس هیچ شکلی با ${v} ${F.thing} نداریم.`,
      feedback: { wrong: `به عددهای جدول نگاه کن: همه ${parityWord}اند. ${v} در این الگو جا می‌گیرد؟` },
    };
  }

  const inverse = level === 2 && rng() < 0.5;
  if (inverse) {
    const n = randInt(rng, 6, 20);
    const v = F.f(n);
    const traps = { [v]: 'sameAsValue', [v * F.k]: 'multiplied' };
    delete traps[n];
    return {
      type: 'num',
      key: `pt2i:${fam}:${v}`,
      data: {
        ...common, prompt: fam === 'wheel' ? `با ${v} چرخ چند گردونه می‌سازیم؟` : fam === 'stick' ? `${v} چوب برای چند مثلث کافی است؟` : `کدام شکل ${v} مربع دارد؟ (شماره‌ی شکل)`,
        visual: { kind: 'figs', fam, shown, ask: { n: null, v } }, answer: n, traps,
      },
      hint: fam === 'square' ? `رابطه: تعداد = (۲ × شماره) − ۱. ${v} را یکی زیاد کن تا ${v + 1} شود، بعد نصفش کن.` : `رابطه: تعداد ${F.thing} = ${fam === 'wheel' ? '۲' : '۳'} × ${figWord}. پس ${v} را بر ${F.k} تقسیم کن.`,
      explain: fam === 'square' ? `${v} + ۱ = ${v + 1} و ${v + 1} ÷ ۲ = ${n}، پس شکل ${n}.` : `${v} ÷ ${F.k} = ${n}.`,
      feedback: {
        sameAsValue: `این عدد خودِ تعداد ${F.thing}‌هاست! شماره‌ی شکل (تعداد ${figWord}) را می‌خواهیم.`,
        multiplied: 'اشتباه ضرب کردی؛ برای برگشت باید تقسیم کنی نه ضرب.',
        wrong: `رابطه‌ی الگو را به کار ببر و برعکسش کن. جدول را ببین: شکل ۳ → ${F.f(3)}.`,
      },
    };
  }

  const n = level === 1 ? randInt(rng, 4, 9) : randInt(rng, 10, 25);
  const v = F.f(n);
  const traps = { [n]: 'figNum' };
  if (fam === 'square') traps[2 * n] = 'offByOne'; else traps[n + F.k] = 'additive';
  return {
    type: 'num',
    key: `pt:${fam}:${n}`,
    data: {
      ...common, prompt: fam === 'wheel' ? `برای ${n} گردونه چند چرخ لازم است؟` : fam === 'stick' ? `${n} مثلث چند چوب می‌خواهد؟` : `در شکل ${n} چند مربع هست؟`,
      visual: { kind: 'figs', fam, shown, ask: { n, v: null } }, answer: v, traps,
    },
    hint: fam === 'square' ? 'هر شکل یک ستون و یک ردیف دارد، ولی گوشه‌ی مشترک یک بار شمرده می‌شود: (۲ × شماره) − ۱.' : `هر ${fam === 'wheel' ? 'گردونه' : 'مثلث'} ${F.k} ${F.thing} دارد. پس ${F.thing}‌ها = ${F.k} × ${fam === 'wheel' ? 'تعداد گردونه' : 'تعداد مثلث'}.`,
    explain: fam === 'square' ? `(۲ × ${n}) − ۱ = ${2 * n} − ۱ = ${v}.` : `${F.k} × ${n} = ${v}.`,
    feedback: {
      figNum: `این شماره‌ی شکل است! تعداد ${F.thing}‌ها را می‌خواهیم، نه شماره را.`,
      additive: `رابطه جمع نیست، ضرب است: هر ${fam === 'wheel' ? 'گردونه' : 'مثلث'} ${F.k} ${F.thing} دارد.`,
      offByOne: 'یکی زیادی است! گوشه‌ی مشترک دو بار شمرده شده؛ (۲ × شماره) را حساب کن و یکی کم کن.',
      wrong: `جدول را ببین: شکل ۱ → ${F.f(1)}، شکل ۲ → ${F.f(2)}، شکل ۳ → ${F.f(3)}. رابطه چیست؟`,
    },
  };
}

/* ------------------------------------------------------------------ parity */
function genParity(level, rng) {
  if (level === 1) {
    const n = randInt(rng, 1, 20);
    return {
      type: 'choice',
      key: `pa1:${n}`,
      data: { prompt: `عدد ${n} زوج است یا فرد؟`, visual: { kind: 'dots', n }, options: PAR, answerIndex: parIdx(n), traps: {}, optLabel: 'text' },
      hint: 'نقطه‌ها را دو‌تا‌دوتا جفت کن. اگر همه جفت شدند زوج است. اگر یکی تنها ماند فرد است.',
      explain: isEven(n) ? `${n} نقطه کاملاً جفت می‌شود: زوج.` : `${n} نقطه یکی تنها دارد: فرد.`,
      feedback: { wrong: 'نقطه‌ها را جفت‌جفت ببین. آخر کار نقطه‌ی تنها مانده؟' },
    };
  }
  if (level === 2) {
    const wantEven = rng() < 0.5;
    const target = randInt(rng, 3, 30);
    const good = wantEven ? target - (target % 2) : target - (target % 2) + 1;
    const nums = new Set([good]);
    while (nums.size < 4) {
      const x = randInt(rng, 1, 30);
      if (isEven(x) !== wantEven) nums.add(x);
    }
    const options = shuffle(rng, [...nums]);
    return {
      type: 'choice',
      key: `pa2:${wantEven}:${good}`,
      data: { prompt: `کدام عدد ${wantEven ? 'زوج' : 'فرد'} است؟`, visual: { kind: 'none' }, options, answerIndex: options.indexOf(good), traps: {}, optLabel: 'num', dots: true },
      hint: 'هر عدد را به جفت‌های دو‌تایی تقسیم کن. اگر چیزی نماند زوج است و اگر یکی ماند فرد.',
      explain: `${good} ${wantEven ? 'کاملاً جفت می‌شود، پس زوج' : 'یکی اضافه می‌ماند، پس فرد'} است.`,
      feedback: { wrong: `از هر عدد دو‌تا‌دوتا کم کن. ببین آخرش ${wantEven ? 'صفر' : 'یک'} می‌شود؟` },
    };
  }
  const evenMajority = rng() < 0.5;
  const odd = new Set();
  const major = new Set();
  while (major.size < 4) { const x = randInt(rng, 1, 40); if (isEven(x) === evenMajority) major.add(x); }
  let different;
  do { different = randInt(rng, 1, 40); } while (isEven(different) === evenMajority);
  odd.add(different);
  const options = shuffle(rng, [...major, different]);
  return {
    type: 'choice',
    key: `pa3:${[...major].sort().join()}:${different}`,
    data: { prompt: 'کدام عدد با بقیه فرق دارد؟', visual: { kind: 'none' }, options, answerIndex: options.indexOf(different), traps: {}, optLabel: 'num' },
    hint: `بقیه ${evenMajority ? 'زوج' : 'فرد'} هستند. ببین کدام عدد جفت‌شدنش فرق دارد.`,
    explain: `${[...major].sort((a, b) => a - b).join('، ')} همه ${evenMajority ? 'زوج' : 'فرد'}اند و ${different} ${evenMajority ? 'فرد' : 'زوج'} است.`,
    feedback: { wrong: 'همه را زوج یا فرد کن؛ یکی از بقیه فرق دارد.' },
  };
}

/* ------------------------------------------------------------------ sumParity */
function genSumParity(level, rng) {
  if (level === 1) {
    const rule = pick(rng, ['ee', 'oo', 'eo']);
    const text = { ee: 'دو عدد زوج', oo: 'دو عدد فرد', eo: 'یک عدد زوج و یک عدد فرد' }[rule];
    const ex = rule === 'ee' ? [pick(rng, [2, 4, 6]), pick(rng, [2, 4, 8])] : rule === 'oo' ? [pick(rng, [1, 3, 5]), pick(rng, [3, 7, 9])] : [pick(rng, [2, 4, 6]), pick(rng, [1, 3, 5])];
    const ans = rule === 'eo' ? 1 : 0;
    return {
      type: 'choice',
      key: `sp1:${rule}`,
      data: { prompt: `حاصل جمع ${text} چه عددی است؟`, visual: { kind: 'sumdots', a: ex[0], b: ex[1], show: true }, options: PAR, answerIndex: ans, traps: {}, optLabel: 'text' },
      hint: `مثال را ببین: ${ex[0]} + ${ex[1]}. نقطه‌های دو گروه را با هم جفت کن. جفتِ همه کامل شد یا یکی ماند؟`,
      explain: rule === 'ee' ? 'هیچ‌کدام تنها ندارند، پس جمعشان هم کامل جفت می‌شود: زوج.' : rule === 'oo' ? 'هر کدام یک نقطه‌ی تنها دارند. این دو تنها با هم جفت می‌شوند: زوج.' : 'فقط عدد فرد یک نقطه‌ی تنها دارد و کسی را برای جفت‌شدن ندارد: فرد.',
      feedback: { wrong: 'با نقطه‌ها فکر کن: نقطه‌ی تنهای هر عدد را بشمار. دو تنها با هم جفت می‌شوند.' },
    };
  }
  if (level === 2) {
    const a = randInt(rng, 2, 15);
    const b = randInt(rng, 2, 15);
    const s = a + b;
    return {
      type: 'choice',
      key: `sp2:${a}+${b}`,
      data: { prompt: `حاصل ${a} + ${b} زوج است یا فرد؟`, visual: { kind: 'sumdots', a, b, show: false }, options: PAR, answerIndex: parIdx(s), traps: {}, optLabel: 'text' },
      hint: `${a} ${isEven(a) ? 'زوج' : 'فرد'} است و ${b} ${isEven(b) ? 'زوج' : 'فرد'}. تنهاها را ببین: جمع‌شان چه می‌شود؟`,
      explain: `${a} + ${b} = ${s} و ${s} ${isEven(s) ? 'زوج' : 'فرد'} است.`,
      feedback: { wrong: 'اول بگو هر عدد زوج است یا فرد. بعد قانون جمع را به کار ببر.' },
    };
  }
  const tunnels = [randInt(rng, 2, 9), randInt(rng, 2, 9), randInt(rng, 2, 9)];
  const s = tunnels.reduce((x, y) => x + y, 0);
  return {
    type: 'choice',
    key: `sp3:${tunnels.join('+')}`,
    data: {
      prompt: 'مسیر انتخاب‌شده این سه تونل را دارد. مجموع توپ‌ها زوج است یا فرد؟',
      visual: { kind: 'route', tunnels }, options: PAR, answerIndex: parIdx(s), traps: {}, optLabel: 'text',
    },
    hint: `هر تونل را زوج یا فرد کن: ${tunnels.map((t) => `${t} ${isEven(t) ? 'زوج' : 'فرد'}`).join('، ')}. تنهاها با هم جفت می‌شوند.`,
    explain: `${tunnels.join(' + ')} = ${s} و ${s} ${isEven(s) ? 'زوج' : 'فرد'} است.`,
    feedback: { wrong: 'تعداد تونل‌های فرد را بشمار. هر دو‌تا تنها با هم جفت می‌شوند؛ آخرش یکی ماند؟' },
  };
}

/* ------------------------------------------------------------------ seq */
function genSeq(level, rng) {
  if (level === 1) {
    const start = randInt(rng, 1, 10);
    const terms = [0, 1, 2, 3].map((i) => start + 2 * i);
    const ans = start + 8;
    return {
      type: 'num',
      key: `sq1:${start}`,
      data: { prompt: 'عدد بعدی چند است؟', visual: { kind: 'line', terms, ask: ans, step: 2 }, answer: ans, traps: { [terms[3] + 1]: 'plusOne' } },
      hint: 'هر بار دو واحد جلو می‌رویم. به پرش‌ها روی محور نگاه کن.',
      explain: `${terms[3]} + ۲ = ${ans}.`,
      feedback: { plusOne: 'پرش‌ها دو‌تا دو‌تا هستند نه یکی‌یکی. دو واحد جلوتر برو.', wrong: 'پرش‌های قبلی را ببین: هر بار چند واحد جلو رفته‌ایم؟' },
    };
  }
  if (level === 2) {
    const start = randInt(rng, 1, 20);
    const terms = [0, 1, 2, 3, 4].map((i) => start + 2 * i);
    const hole = pick(rng, [1, 2, 3]);
    const ans = terms[hole];
    return {
      type: 'num',
      key: `sq2:${start}:${hole}`,
      data: {
        prompt: 'جای خالی چه عددی است؟', visual: { kind: 'blanks', terms: terms.map((t, i) => (i === hole ? null : t)) },
        answer: ans, traps: { [ans + 1]: 'plusOne', [ans - 1]: 'plusOne' },
      },
      hint: `هر عدد از قبلی دو واحد بیشتر است: ${terms[hole - 1]} + ۲ = ؟`,
      explain: `${terms[hole - 1]} + ۲ = ${ans}، و بعدش ${terms[hole + 1]} می‌آید.`,
      feedback: { plusOne: 'پرش دو‌تا دو‌تاست. عدد قبلی را دو واحد جلو ببر.', wrong: 'عددهای کنار جای خالی را ببین؛ هر بار چقدر زیاد می‌شود؟' },
    };
  }
  const odd = rng() < 0.5;
  const n = randInt(rng, 6, 15);
  const ans = odd ? 2 * n - 1 : 2 * n;
  const first = odd ? [1, 3, 5] : [2, 4, 6];
  return {
    type: 'num',
    key: `sq3:${odd}:${n}`,
    data: {
      prompt: `${n}‌امین عدد ${odd ? 'فرد' : 'زوج'} چند است؟`, visual: { kind: 'first', terms: first, odd }, answer: ans,
      traps: { [n]: 'figNum', [odd ? 2 * n : 2 * n - 1]: 'offByOne' },
    },
    hint: odd ? 'عدد فردِ شماره‌ی n برابر است با (۲ × n) − ۱. مثلاً سومین عدد فرد ۵ است.' : 'عدد زوجِ شماره‌ی n برابر است با ۲ × n. مثلاً سومین عدد زوج ۶ است.',
    explain: odd ? `(۲ × ${n}) − ۱ = ${ans}.` : `۲ × ${n} = ${ans}.`,
    feedback: {
      figNum: 'این خود شماره است. باید جمله‌ای را که در جایگاه آن شماره قرار دارد بگویی.',
      offByOne: odd ? 'یکی زیادی است؛ عددهای فرد یکی کمتر از دو برابرِ شماره‌اند.' : 'یکی کم‌تر است؛ عددهای زوج دو برابرِ شماره‌اند.',
      wrong: `الگو را ببین: ${first.join('، ')}… هر جمله را با شماره‌اش مقایسه کن.`,
    },
  };
}

/* ------------------------------------------------------------------ registry */
const GEN = { pattern: genPattern, parity: genParity, sumParity: genSumParity, seq: genSeq };

export function makeItem(skill, level, rng, seen = new Set()) {
  let item;
  for (let i = 0; i < 25; i++) {
    item = GEN[skill](level, rng);
    if (!seen.has(item.key)) break;
  }
  return { id: nextId(), skill, level, ...item };
}

export function checkItem(item, answer) {
  const d = item.data;
  let ok = false;
  let code = 'wrong';
  if (item.type === 'num') {
    ok = answer === d.answer;
    if (!ok && answer != null) code = d.traps[answer] ?? 'wrong';
  } else {
    ok = answer === d.answerIndex;
  }
  if (ok) return { ok: true };
  return { ok: false, code, message: item.feedback[code] ?? item.feedback.wrong };
}
