// Stage ch1-2 «پل مضرب‌ها» (book chapter 1, p.4-6).
// Skills (answer shapes: 'num' typed, 'choice' pick one, 'grid' paint numbers):
//   multiples  n-th multiple, which multiple, is it a multiple      (p.5 no.2-3, p.6 no.6)
//   grid       paint multiples on the number table                  (p.6 no.1-2)
//   lineUp     positions in a queue, middle person                  (p.5 no.1, p.6 no.5)
//   rel        relation "k x figure number" and proportion          (p.4-5 sticks pattern)
import { randInt, pick, shuffle } from '../lib/rng.js';

export const SKILLS = ['multiples', 'grid', 'lineUp', 'rel'];
export const SKILL_META = {
  multiples: { fa: 'مضرب‌ها' },
  grid: { fa: 'جدول مضرب‌ها' },
  lineUp: { fa: 'صف و جایگاه' },
  rel: { fa: 'رابطه و تناسب' },
};
export const WARMUP = ['multiples', 'grid', 'lineUp', 'rel'];

let uid = 0;
const nextId = () => `m${++uid}`;
export const isMultiple = (v, k) => v % k === 0;
const uniq = (arr) => [...new Set(arr)];

/* ------------------------------------------------------------------ multiples */
function genMultiples(level, rng) {
  if (level === 3) {
    if (rng() < 0.5) {
      const k = pick(rng, [3, 4, 5, 6, 7, 8, 9]);
      const good = k * randInt(rng, 4, 12);
      const bad = new Set();
      while (bad.size < 3) {
        const m = randInt(rng, 4, 12) * k + pick(rng, [-2, -1, 1, 2]);
        if (m > 0 && !isMultiple(m, k) && m !== good) bad.add(m);
      }
      const options = shuffle(rng, [good, ...bad]);
      return {
        type: 'choice', key: `mu3a:${k}:${good}`,
        data: { prompt: `کدام عدد مضرب ${k} است؟`, visual: { kind: 'none' }, options, answerIndex: options.indexOf(good), traps: {}, optLabel: 'num' },
        hint: `مضرب‌های ${k} را بشمار: ${k}، ${2 * k}، ${3 * k}، ${4 * k}… هر کدام از قبلی ${k} تا بیشتر است.`,
        explain: `${good} = ${good / k} × ${k}، پس مضرب ${k} است.`,
        feedback: { wrong: `عددی مضرب ${k} است که بشود آن را ${k}‌تا‌${k}تا شمرد و درست به آن رسید.` },
      };
    }
    const N = pick(rng, [10, 12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 35, 36, 40, 42, 45, 48, 49, 54, 56, 63, 64, 72, 81]);
    const divs = [2, 3, 4, 5, 6, 7, 8, 9].filter((d) => N % d === 0);
    const non = [2, 3, 4, 5, 6, 7, 8, 9].filter((d) => N % d !== 0);
    if (divs.length === 0 || non.length < 3) return genMultiples(3, rng);
    const good = pick(rng, divs);
    const options = shuffle(rng, [good, ...shuffle(rng, non).slice(0, 3)]);
    return {
      type: 'choice', key: `mu3b:${N}:${good}`,
      data: { prompt: `${N} مضرب کدام عدد است؟`, visual: { kind: 'none' }, options, answerIndex: options.indexOf(good), traps: {}, optLabel: 'num' },
      hint: `هر گزینه را امتحان کن: آیا می‌شود با شمردنِ آن عدد‌تا‌آن‌عدد به ${N} رسید؟ یا ${N} را بر آن تقسیم کن.`,
      explain: `${N} = ${N / good} × ${good}، پس ${N} مضرب ${good} است.`,
      feedback: { wrong: `ببین ${N} را می‌شود با ضرب‌کردن آن عدد در یک عدد صحیح ساخت یا نه.` },
    };
  }
  const k = level === 1 ? pick(rng, [2, 3, 4, 5, 6]) : pick(rng, [3, 4, 5, 6, 7, 8, 9]);
  const shown = [1, 2, 3].map((n) => ({ n, v: n * k }));
  if (level === 2 && rng() < 0.5) {
    const n = randInt(rng, 7, 15);
    const v = n * k;
    return {
      type: 'num', key: `mu2i:${k}:${n}`,
      data: {
        prompt: `${v} چندمین مضرب ${k} است؟`, visual: { kind: 'mulrow', k, shown, ask: { n: null, v } }, answer: n,
        traps: { [v]: 'sameAsValue', [v * k]: 'multiplied', [n - 1]: 'offByOne', [n + 1]: 'offByOne' },
      },
      hint: `مضرب شماره‌ی n برابر است با n × ${k}. پس ${v} را بر ${k} تقسیم کن تا شماره پیدا شود.`,
      explain: `${v} ÷ ${k} = ${n}، پس ${v} مضرب ${n}‌ام عدد ${k} است.`,
      feedback: {
        sameAsValue: 'این خودِ عدد است! شماره‌ی مضرب را می‌خواهیم، یعنی چندمین بودنش.',
        multiplied: 'برای پیدا کردن شماره باید تقسیم کنی، نه ضرب.',
        offByOne: `یکی کم یا زیاد شد. ${n}‌تا ${k}‌تایی را حساب کن؛ ${k} × ${n} باید همین عدد باشد.`,
        wrong: `هر بار ${k} تا جلو می‌رویم: ${shown.map((s) => s.v).join('، ')}… به ${v} در کدام قدم می‌رسیم؟`,
      },
    };
  }
  const n = level === 1 ? randInt(rng, 4, 6) : randInt(rng, 7, 12);
  const v = n * k;
  return {
    type: 'num', key: `mu${level}:${k}:${n}`,
    data: {
      prompt: `${n === 9 ? 'نهمین' : n === 6 ? 'ششمین' : `${n}‌امین`} مضرب ${k} چه عددی است؟`, visual: { kind: 'mulrow', k, shown, ask: { n, v: null } }, answer: v,
      traps: { [n]: 'index', [n + k]: 'additive', [(n - 1) * k]: 'prev', [(n + 1) * k]: 'next' },
    },
    hint: `مضرب‌ها از ${k} شروع می‌شوند و هر بار ${k} تا زیاد می‌شوند. مضرب ${n}‌ام = ${n} × ${k}.`,
    explain: `${n} × ${k} = ${v}.`,
    feedback: {
      index: 'این شماره‌ی مضرب است، خودِ مضرب را می‌خواهیم.',
      additive: `جمع نیست، ضرب است: ${n} بار ${k} را بردار.`,
      prev: 'یکی عقب ماندی! این مضربِ یک قدم قبل است.',
      next: 'یکی جلو رفتی! این مضربِ یک قدم بعد است.',
      wrong: `الگو را ببین: ${shown.map((s) => s.v).join('، ')}… هر بار ${k} تا زیاد می‌شود.`,
    },
  };
}

/* ------------------------------------------------------------------ grid */
function genGrid(level, rng) {
  let N;
  let ks;
  if (level === 1) { N = 30; ks = [pick(rng, [2, 5])]; }
  else if (level === 2) { N = 40; ks = [pick(rng, [3, 4])]; }
  else { N = 40; ks = pick(rng, [[3, 5], [2, 3], [4, 5]]); }
  const targets = Array.from({ length: N }, (_, i) => i + 1).filter((v) => ks.some((k) => isMultiple(v, k)));
  const both = ks.length === 2 ? targets.filter((v) => ks.every((k) => isMultiple(v, k))) : [];
  const prompt = ks.length === 1 ? (ks[0] === 2 ? 'همه‌ی عددهای زوج را رنگ کن' : `همه‌ی مضرب‌های ${ks[0]} را رنگ کن`) : `مضرب‌های ${ks[0]} و مضرب‌های ${ks[1]} را رنگ کن`;
  const first = ks.map((k) => k).join(' و ');
  return {
    type: 'grid', key: `gr:${N}:${ks.join(',')}`,
    data: { prompt, N, ks, targets, both },
    hint: ks.length === 1 ? `از ${ks[0]} شروع کن و هر بار ${ks[0]} تا جلو برو: ${ks[0]}، ${2 * ks[0]}، ${3 * ks[0]}…` : `دو دسته‌ی جدا: ${ks[0]}، ${2 * ks[0]}، … و ${ks[1]}، ${2 * ks[1]}، … هر عددی که در یکی از دو دسته باشد رنگ می‌شود.`,
    explain: ks.length === 1 ? `مضرب‌های ${ks[0]} تا ${N}: ${targets.join('، ')}.` : `${targets.join('، ')}. عددهای ${both.join('، ')} هم مضرب ${ks[0]} و هم مضرب ${ks[1]} هستند.`,
    feedback: {
      missing: `بعضی مضرب‌ها را جا انداختی! ${ks.length === 1 ? `با پرش‌های ${ks[0]}‌تایی دوباره برو` : 'هر دو دسته را کامل برو'}.`,
      extra: `بعضی خانه‌های رنگ‌شده مضرب ${first} نیستند. با پرش‌های ${ks[0]}‌تایی چک کن.`,
      both: 'هم بعضی جا افتاده و هم بعضی اضافه است. دوباره از اول با پرش‌ها برو.',
      wrong: 'مضرب‌ها را با پرش‌های مساوی پیدا کن.',
    },
  };
}

/* ------------------------------------------------------------------ lineUp */
function genLineUp(level, rng) {
  if (level === 1) {
    const m = randInt(rng, 3, 15);
    const N = 2 * m + 1;
    return {
      type: 'num', key: `lu1:${N}`,
      data: {
        prompt: `فاطمه نفر وسط یک صف ${N} نفره است. او نفر چندم است؟`, visual: { kind: 'queue', n: N, mark: m + 1 }, answer: m + 1,
        traps: { [m]: 'half', [N - 1]: 'half', [N]: 'half' },
      },
      hint: `نفر وسط ${m} نفر قبل و ${m} نفر بعد از خودش دارد. خودش هم یک نفر است.`,
      explain: `${m} نفر قبل + خودش + ${m} نفر بعد = ${N}. پس او نفر ${m} + ۱ = ${m + 1}‌ام است.`,
      feedback: { half: `نصفِ ${N} نیمه‌دار می‌شود! فاطمه خودش هم یک نفر است. ${m} نفر قبل از او هستند، پس او ${m} + ۱ ام است.`, wrong: 'چند نفر قبل از او هستند؟ خودش را هم بشمار.' },
    };
  }
  if (level === 2) {
    const p = randInt(rng, 3, 8);
    const evenP = p % 2 === 0;
    // total is even and < 20. The number behind = total - p keeps the parity of p.
    const goodSet = [];
    for (let behind = 1; behind <= 19; behind++) { const total = p + behind; if (total % 2 === 0 && total < 20) goodSet.push(behind); }
    const bad = [];
    for (let behind = 1; behind <= 19; behind++) { const total = p + behind; if (!(total % 2 === 0 && total < 20)) bad.push(behind); }
    const good = pick(rng, goodSet);
    const wrongOnes = shuffle(rng, bad.filter((b) => b % 2 === (evenP ? 1 : 0))).slice(0, 1)
      .concat(shuffle(rng, bad.filter((b) => b % 2 === good % 2)).slice(0, 1))
      .concat(shuffle(rng, bad).slice(0, 3));
    const options = uniq([good, ...wrongOnes]).slice(0, 4);
    const opts = shuffle(rng, options);
    return {
      type: 'choice', key: `lu2:${p}:${good}`,
      data: {
        prompt: `رضا نفر ${p}‌ام صف است. تعداد افراد صف زوج و کمتر از ۲۰ است. چند نفر می‌توانند پشت سر او باشند؟`,
        visual: { kind: 'queue', n: Math.min(19, p + 8), mark: p }, options: opts, answerIndex: opts.indexOf(good), traps: {}, optLabel: 'num',
      },
      hint: `کل صف = ${p} (تا خود رضا) + تعداد پشت سر. کل صف باید زوج و کمتر از ۲۰ شود. ${evenP ? 'زوج + زوج = زوج' : 'فرد + فرد = زوج'}.`,
      explain: `${p} + ${good} = ${p + good} که زوج و کمتر از ۲۰ است.`,
      feedback: { wrong: `هر گزینه را با ${p} جمع کن. جواب باید زوج و کمتر از ۲۰ شود.` },
    };
  }
  const m = pick(rng, [7, 10, 12, 15, 20]);
  const N = 2 * m + 1;
  const trueA = `${m} نفر قبل از فاطمه و ${m} نفر بعد از او در صف هستند.`;
  const trueB = `فاطمه نفر ${m + 1}‌ام صف است.`;
  const falses = [
    `فاطمه نفر ${m}‌ام صف است.`,
    `${m} نفر قبل از فاطمه و ${m + 1} نفر بعد از او در صف هستند.`,
    `فاطمه نفر ${m + 2}‌ام صف است.`,
    `${m + 1} نفر قبل از فاطمه و ${m} نفر بعد از او در صف هستند.`,
  ];
  const good = pick(rng, [trueA, trueB]);
  const options = shuffle(rng, [good, ...shuffle(rng, falses).slice(0, 3)]);
  return {
    type: 'choice', key: `lu3:${N}:${good}`,
    data: { prompt: `فاطمه در یک صف ${N} نفره نفر وسط است. کدام جمله درست است؟`, visual: { kind: 'queue', n: Math.min(N, 21), mark: Math.min(N, 21) === N ? m + 1 : 11 }, options, answerIndex: options.indexOf(good), traps: {}, optLabel: 'text' },
    hint: `نفر وسط: دو طرفش به یک اندازه نفر هست. پس ${N} − ۱ = ${N - 1} نفر دیگر را نصف کن.`,
    explain: `${N} − ۱ = ${N - 1} و نصفش ${m} است: ${m} نفر قبل، ${m} نفر بعد و فاطمه نفر ${m + 1}‌ام.`,
    feedback: { wrong: 'فاطمه را کنار بگذار و بقیه را دو نیم کن. بعد چک کن جمله با آن می‌خواند؟' },
  };
}

/* ------------------------------------------------------------------ rel */
const SHAPES = { 3: 'مثلث', 4: 'مربع', 5: 'پنج‌ضلعی', 6: 'شش‌ضلعی' };

function genRel(level, rng) {
  const k = pick(rng, [3, 4, 5, 6]);
  const shape = SHAPES[k];
  const shown = [1, 2, 3].map((n) => ({ n, v: k * n }));
  const vis = { kind: 'tbl', k, a: 'شکل', b: 'چوب', shown };
  if (level === 1) {
    const n = randInt(rng, 4, 9);
    return {
      type: 'num', key: `re1:${k}:${n}`,
      data: { prompt: `هر ${shape} ${k} چوب می‌خواهد. شکل ${n} چند چوب لازم دارد؟`, visual: { ...vis, ask: { n, v: null } }, answer: k * n, traps: { [n]: 'index', [n + k]: 'additive' } },
      hint: `تعداد چوب‌ها = ${k} × شماره‌ی شکل. شکل شماره‌ی ${n} یعنی ${n} تا ${shape}.`,
      explain: `${k} × ${n} = ${k * n}.`,
      feedback: { index: 'این شماره‌ی شکل است. تعداد چوب‌ها را می‌خواهیم.', additive: `رابطه ضرب است: هر ${shape} ${k} چوب دارد.`, wrong: `جدول: ${shown.map((s) => `شکل ${s.n} ← ${s.v}`).join('، ')}. رابطه چیست؟` },
    };
  }
  if (level === 2) {
    const good = `${k} × شماره‌ی شکل`;
    const options = shuffle(rng, [good, `${k} + شماره‌ی شکل`, `شماره‌ی شکل ÷ ${k}`, `${k} − شماره‌ی شکل`]);
    return {
      type: 'choice', key: `re2:${k}`,
      data: { prompt: 'کدام رابطه، تعداد چوب‌ها را از شماره‌ی شکل می‌سازد؟', visual: { ...vis, ask: null }, options, answerIndex: options.indexOf(good), traps: {}, optLabel: 'text' },
      hint: `هر شماره را در جدول امتحان کن: شکل ۱ ← ${k}، شکل ۲ ← ${2 * k}. با هر رابطه همین عددها درمی‌آید؟`,
      explain: `${k} × ۱ = ${k}، ${k} × ۲ = ${2 * k}، ${k} × ۳ = ${3 * k}. فقط ضرب در ${k} با جدول می‌خواند.`,
      feedback: { wrong: `رابطه را روی شکل ۲ امتحان کن؛ باید ${2 * k} بدهد.` },
    };
  }
  const m = pick(rng, [2, 3].filter((x) => x !== k)); // k times as distractor must differ from m
  const a = randInt(rng, 2, 5);
  const good = `${m} برابر می‌شود`;
  const options = shuffle(rng, [good, `${m} تا بیشتر می‌شود`, `${k} برابر می‌شود`, 'تغییر نمی‌کند']);
  return {
    type: 'choice', key: `re3:${k}:${m}:${a}`,
    data: {
      prompt: `شماره‌ی شکل از ${a} به ${a * m} می‌رسد (${m} برابر می‌شود). تعداد چوب‌ها چه می‌شود؟`,
      visual: { ...vis, ask: { n: a, v: k * a, n2: a * m, v2: null } }, options, answerIndex: options.indexOf(good), traps: {}, optLabel: 'text',
    },
    hint: `شکل ${a} ← ${k * a} چوب. شکل ${a * m} ← ${k} × ${a * m} = ؟ آن را با ${k * a} مقایسه کن.`,
    explain: `${k} × ${a * m} = ${k * a * m} و ${k * a * m} ÷ ${k * a} = ${m}. وقتی شماره ${m} برابر شود، چوب‌ها هم ${m} برابر می‌شوند؛ یعنی متناسب‌اند.`,
    feedback: { wrong: `هر دو عدد را حساب کن: ${k} × ${a} و ${k} × ${a * m}. چند برابر شد؟` },
  };
}

/* ------------------------------------------------------------------ registry */
const GEN = { multiples: genMultiples, grid: genGrid, lineUp: genLineUp, rel: genRel };

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
  } else if (item.type === 'grid') {
    const set = new Set(Array.isArray(answer) ? answer : []);
    const missing = d.targets.filter((v) => !set.has(v)).length;
    const extra = [...set].filter((v) => !d.targets.includes(v)).length;
    ok = missing === 0 && extra === 0;
    if (!ok) code = missing && extra ? 'both' : missing ? 'missing' : 'extra';
  } else {
    ok = answer === d.answerIndex;
  }
  if (ok) return { ok: true };
  return { ok: false, code, message: item.feedback[code] ?? item.feedback.wrong };
}
