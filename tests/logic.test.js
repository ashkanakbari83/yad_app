import test from 'node:test';
import assert from 'node:assert/strict';
import { faDigits, faNum, toAscii } from '../src/lib/fa.js';
import { parseDec, canon, eqDec, cmpDec, diffDec, fromHundredths, toHundredths } from '../src/lib/decimal.js';
import { toJalali } from '../src/lib/jalali.js';
import { decimalTokens, numberTokens } from '../src/engine/words.js';
import { mulberry32 } from '../src/lib/rng.js';
import { SKILLS, makeItem, checkItem, cardsOptimum, cardsEvaluate } from '../src/engine/items.js';
import { newSession, nextItem, record, isDone, summary, SESSION_LEN, MAX_EXTRA } from '../src/engine/session.js';
import { levelInfo } from '../src/data/levels.js';

test('Persian digits', () => {
  assert.equal(faDigits('68.19'), '۶۸.۱۹');
  assert.equal(faNum('0.75'), '۰/۷۵');
  assert.equal(toAscii('۶۸/۱۹'), '68.19');
  assert.equal(toAscii('٣٫٥'), '3.5');
});

test('exact decimals', () => {
  assert.equal(canon('0.30'), '0.3');
  assert.equal(canon('2.70'), '2.7');
  assert.equal(canon('5.'), '5');
  assert.equal(canon('.5'), '0.5');
  assert.equal(canon('abc'), '');
  assert.equal(canon('1.23456'), '');
  assert.ok(eqDec('0.1', '0.10'));
  assert.ok(eqDec('0.1', '0.1000'));
  assert.ok(!eqDec('0.07', '0.7'));
  assert.equal(cmpDec('0.9', '0.09'), 1);
  assert.equal(cmpDec('0.30', '0.3'), 0);
  assert.equal(diffDec('10.234', '10'), '0.234');
  assert.equal(fromHundredths(273), '2.73');
  assert.equal(fromHundredths(30), '0.3');
  assert.equal(toHundredths('0.07'), 7);
  assert.equal(toHundredths('0.001'), null);
  assert.equal(parseDec(''), null);
});

test('Jalali date conversion (known dates)', () => {
  assert.deepEqual(toJalali(2026, 3, 21), { jy: 1405, jm: 1, jd: 1 });
  assert.deepEqual(toJalali(2026, 11, 18), { jy: 1405, jm: 8, jd: 27 });
  assert.deepEqual(toJalali(2025, 3, 21), { jy: 1404, jm: 1, jd: 1 });
});

test('reading decimals as the book does', () => {
  assert.equal(decimalTokens('68.19').join(' '), 'شصت و هشت عدد صحیح و نوزده صدم');
  assert.equal(decimalTokens('20.05').join(' '), 'بیست عدد صحیح و پنج صدم');
  assert.equal(decimalTokens('0.25').join(' '), 'بیست و پنج صدم');
  assert.equal(decimalTokens('7.5').join(' '), 'هفت عدد صحیح و پنج دهم');
  assert.deepEqual(numberTokens(11), ['یازده']);
  assert.throws(() => numberTokens(100));
});

test('every generator yields a solvable, checkable item', () => {
  const rng = mulberry32(7);
  for (const skill of SKILLS) {
    for (const level of [1, 2, 3]) {
      for (let i = 0; i < 60; i++) {
        const it = makeItem(skill, level, rng);
        const right = solve(it);
        assert.ok(checkItem(it, right).ok, `${it.type} L${level} should accept the right answer`);
        const wrong = checkItem(it, wrongAnswer(it));
        assert.equal(wrong.ok, false, `${it.type} L${level} should reject a wrong answer`);
        assert.ok(wrong.message && wrong.message.length > 5);
      }
    }
  }
});

test('child-facing explanations read naturally (no "0 خانه")', () => {
  const rng = mulberry32(21);
  for (let i = 0; i < 80; i++) {
    const it = makeItem('buildModel', 1 + (i % 3), rng);
    assert.ok(!/(^| )0 /.test(it.explain), it.explain);
    assert.ok(it.explain.endsWith('.'));
  }
});

test('place table: digit distractors never equal a needed digit', () => {
  const rng = mulberry32(3);
  for (let i = 0; i < 80; i++) {
    const it = makeItem('placeValue', 1 + (i % 3), rng);
    if (it.type !== 'placeTable') continue;
    const need = it.data.digits.length;
    assert.equal(it.data.chips.length, need + 2);
    for (const d of it.data.digits) assert.ok(it.data.chips.some((c) => c.digit === d));
    assert.ok(it.data.value.includes('.'));
    assert.ok(!it.data.value.endsWith('0'), 'no trailing zero in hundredths');
  }
});

test('wrong-answer diagnoses are specific', () => {
  const rng = mulberry32(11);
  let pt;
  for (let i = 0; i < 50 && !(pt && pt.type === 'placeTable' && pt.data.digits[2] !== pt.data.digits[3]); i++) {
    pt = makeItem('placeValue', 2, rng);
  }
  assert.equal(pt.type, 'placeTable');
  const d = pt.data.digits.slice();
  [d[2], d[3]] = [d[3], d[2]];
  assert.equal(checkItem(pt, d).code, 'swapDec');
  const d2 = pt.data.digits.slice();
  [d2[0], d2[1]] = [d2[1], d2[0]];
  if (d2[0] !== d2[1]) assert.equal(checkItem(pt, d2).code, 'order');
  const mr = { type: 'modelRead', data: { n: 0, b: 3, c: 7, value: '0.37' }, feedback: { wrong: 'xxxxxx', nopoint: 'yyyyyy', order: 'zzzzzz' } };
  assert.equal(checkItem(mr, '37').message, 'yyyyyy');
  assert.equal(checkItem(mr, '0.73').message, 'zzzzzz');
  assert.equal(checkItem(mr, '0.037').message, 'zzzzzz'); // same digits, shifted place
  assert.equal(checkItem(mr, '0.58').message, 'xxxxxx');
  assert.ok(checkItem(mr, '0.370').ok);
  const gb = { type: 'gridBuild', data: { hundredths: 30 }, feedback: { wrong: 'xxxxxx', tenthsAsCells: 'tttttt' } };
  assert.equal(checkItem(gb, [3]).message, 'tttttt');
  assert.ok(checkItem(gb, [30]).ok);
});

test('digit cards: nearest to 10 and 11 (book p.45)', () => {
  assert.equal(cardsOptimum(10).value, '10.234');
  assert.equal(cardsOptimum(11).value, '10.987');
  const a = cardsEvaluate(11, [1, 0], [9, 8, 7]);
  assert.ok(a.optimal);
  assert.equal(a.distance, '0.013');
  const b = cardsEvaluate(11, [1, 0], [9, 7, 8]);
  assert.ok(!b.optimal);
  assert.equal(b.best, '10.987');
  assert.ok(cardsEvaluate(10, [1, 0], [2, 3, 4]).optimal);
  assert.ok(!cardsEvaluate(10, [1, 0], [3, 2, 4]).optimal);
});

test('session: a perfect student finishes in exactly 12 items with 3 stars', () => {
  const rng = mulberry32(1);
  const s = newSession();
  const skillsSeen = [];
  while (!isDone(s)) {
    const it = nextItem(s, rng);
    skillsSeen.push(it.skill);
    record(s, it, 1);
  }
  assert.equal(s.asked, SESSION_LEN);
  assert.deepEqual(skillsSeen.slice(0, 4), ['placeValue', 'readModel', 'buildModel', 'zeroRule']);
  const sum = summary(s);
  assert.equal(sum.stars, 3);
  assert.equal(sum.firstTry, 12);
  for (const k of SKILLS) assert.ok(skillsSeen.includes(k));
});

test('session: a perfect student reaches level 3 of every skill; a struggling one stays easy', () => {
  const rng = mulberry32(2);
  const s = newSession();
  const maxLevel = {};
  while (!isDone(s)) {
    const it = nextItem(s, rng);
    maxLevel[it.skill] = Math.max(maxLevel[it.skill] || 0, it.level);
    record(s, it, 1);
  }
  for (const k of SKILLS) assert.equal(maxLevel[k], 3, `${k} should reach level 3`);

  const t = newSession();
  const tr = mulberry32(2);
  let hardOnes = 0;
  while (!isDone(t)) {
    const it = nextItem(t, tr);
    if (it.level === 3) hardOnes++;
    record(t, it, 0.6); // always needs a hint
  }
  assert.ok(hardOnes <= 2, `hinted student should rarely see level 3 (saw ${hardOnes})`);
});

test('session: level rises with mastery and drops back via an easier alternative after a miss', () => {
  const rng = mulberry32(5);
  const s = newSession();
  const levels = { readModel: [] };
  let sawAlt = false;
  let n = 0;
  while (!isDone(s)) {
    const it = nextItem(s, rng);
    if (it.skill === 'readModel') levels.readModel.push(it.level);
    if (it.alt) sawAlt = true;
    // always miss the very first readModel item twice to trigger the worked solution
    const score = it.skill === 'readModel' && levels.readModel.length === 1 ? 0 : 1;
    record(s, it, score);
    n++;
  }
  assert.ok(sawAlt, 'a miss queues an easier alternative item');
  assert.equal(n, SESSION_LEN + 1);
  assert.ok(Math.max(...levels.readModel) >= 2, 'readModel gets harder once it is going well');
});

test('session: extra items are capped and the child is never failed (>= 1 star)', () => {
  const rng = mulberry32(9);
  const s = newSession();
  while (!isDone(s)) record(s, nextItem(s, rng), 0);
  assert.equal(s.asked, SESSION_LEN + MAX_EXTRA);
  assert.equal(summary(s).stars, 1);
});

test('session: missing the easier alternative does not loop on the same skill', () => {
  const rng = mulberry32(4);
  const s = newSession();
  const skills = [];
  while (!isDone(s)) {
    const it = nextItem(s, rng);
    skills.push(it.skill);
    record(s, it, 0);
  }
  for (let i = 2; i < skills.length; i++) {
    assert.ok(!(skills[i] === skills[i - 1] && skills[i - 1] === skills[i - 2]), `3 in a row at ${i}: ${skills.join()}`);
  }
  assert.deepEqual(skills.slice(0, 4), ['placeValue', 'placeValue', 'readModel', 'readModel']);
});

test('session: a replay starts from half the earlier mastery', () => {
  const s = newSession({ placeValue: 1, readModel: 0.8, buildModel: 0, zeroRule: 0.4 });
  assert.equal(s.skills.placeValue.m, 0.5);
  assert.equal(s.skills.readModel.m, 0.4);
  assert.equal(s.skills.zeroRule.m, 0.2);
});

test('levels', () => {
  assert.equal(levelInfo(0).level, 1);
  assert.equal(levelInfo(59).level, 1);
  assert.equal(levelInfo(60).level, 2);
  assert.equal(levelInfo(140).level, 2);
  assert.equal(levelInfo(150).level, 3);
});

/* ---- helpers: a "perfect" and a "wrong" answer for each item type ---- */
function solve(it) {
  const d = it.data;
  switch (it.type) {
    case 'placeTable': return d.digits.slice();
    case 'wordTiles': return d.tokens.slice();
    case 'modelRead': return d.value;
    case 'gridBuild': return d.grids === 2 ? [100, d.hundredths - 100] : [d.hundredths];
    case 'zeroEq': return d.kind === 'odd' ? d.answerIndex : d.answer;
    default: throw new Error(it.type);
  }
}
function wrongAnswer(it) {
  const d = it.data;
  switch (it.type) {
    case 'placeTable': return d.digits.map((x) => (x + 1) % 10);
    case 'wordTiles': return d.tokens.slice().reverse();
    case 'modelRead': return '9.99';
    case 'gridBuild': return [0];
    case 'zeroEq': return d.kind === 'odd' ? (d.answerIndex + 1) % 4 : d.answer === '=' ? '<' : '=';
    default: throw new Error(it.type);
  }
}
