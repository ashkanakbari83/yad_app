// XP needed to *reach* each level (index 0 = level 1).
export const LEVEL_XP = [0, 60, 150, 270, 420, 600, 810, 1050, 1320, 1620];

export function levelInfo(xp) {
  let level = 1;
  for (let i = 1; i < LEVEL_XP.length; i++) if (xp >= LEVEL_XP[i]) level = i + 1;
  const max = level >= LEVEL_XP.length;
  const from = LEVEL_XP[level - 1];
  const to = max ? from : LEVEL_XP[level];
  return { level, from, to, into: xp - from, span: Math.max(1, to - from), max };
}
