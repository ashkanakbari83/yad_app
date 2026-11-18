// Adaptive practice loop for one stage. Pure + deterministic given an rng.
import { SKILLS, makeItem } from './items.js';

export const SESSION_LEN = 12;
export const MAX_EXTRA = 3;
export const WARMUP = ['placeValue', 'readModel', 'buildModel', 'zeroRule'];
export const MASTERED = 0.75;

// thresholds chosen so a perfect student sees level 1, 2, 3 of every skill within 3 items
export const levelFor = (m) => (m < 0.3 ? 1 : m < 0.6 ? 2 : 3);

/** prior = mastery from an earlier play (decays by half so a replay re-checks it). */
export function newSession(prior = {}) {
  const skills = {};
  for (const s of SKILLS) skills[s] = { m: (prior[s] ?? 0) * 0.5, n: 0 };
  return { skills, asked: 0, normal: 0, extra: 0, alt: null, recent: [], seen: new Set(), history: [] };
}

export const target = (s) => SESSION_LEN + s.extra;
export const isDone = (s) => s.asked >= target(s);

export function pickNext(s, rng) {
  if (s.alt) {
    const a = s.alt;
    s.alt = null;
    return { skill: a.skill, level: a.level, alt: true };
  }
  if (s.normal < WARMUP.length) {
    const skill = WARMUP[s.normal];
    return { skill, level: levelFor(s.skills[skill].m), alt: false };
  }
  let best = null;
  for (const skill of SKILLS) {
    const need = 1 - s.skills[skill].m;
    const recentPenalty = s.recent.slice(-2).includes(skill) ? 0.18 : 0;
    const score = need - recentPenalty + rng() * 0.05;
    if (!best || score > best.score) best = { skill, score };
  }
  return { skill: best.skill, level: levelFor(s.skills[best.skill].m), alt: false };
}

export function nextItem(s, rng) {
  const { skill, level, alt } = pickNext(s, rng);
  const item = makeItem(skill, level, rng, s.seen);
  s.seen.add(item.key);
  s.recent.push(skill);
  return { ...item, alt };
}

/** score: 1 = right first time, 0.6 = right after a hint, 0 = needed the worked solution */
export function record(s, item, score) {
  const k = s.skills[item.skill];
  k.m += (score - k.m) * 0.45;
  k.n += 1;
  s.asked += 1;
  if (!item.alt) s.normal += 1;
  s.history.push({ skill: item.skill, level: item.level, score });
  // a miss earns one easier retry-item; missing that one moves on to another skill instead of looping
  if (score === 0 && !item.alt && s.extra < MAX_EXTRA) {
    s.extra += 1;
    s.alt = { skill: item.skill, level: Math.max(1, item.level - 1) };
  }
}

export function summary(s) {
  const ms = SKILLS.map((k) => s.skills[k].m);
  const avg = ms.reduce((a, b) => a + b, 0) / ms.length;
  const stars = avg >= 0.75 ? 3 : avg >= 0.5 ? 2 : 1;
  const mastery = Object.fromEntries(SKILLS.map((k) => [k, Math.round(s.skills[k].m * 100) / 100]));
  const firstTry = s.history.filter((h) => h.score === 1).length;
  const recovered = s.history.filter((h) => h.score === 0.6).length;
  return { avg, stars, mastery, firstTry, recovered, total: s.history.length };
}
