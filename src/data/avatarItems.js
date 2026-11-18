// Everything the avatar is made of. `lvl` = level needed to unlock (modular + progress-driven).
export const BASES = [
  { id: 'blob', fa: 'ابرک', lvl: 1 },
  { id: 'cat', fa: 'شیطونک', lvl: 1 },
  { id: 'dragon', fa: 'اژدهاک', lvl: 1 },
  { id: 'star', fa: 'ستاره', lvl: 1 },
];

export const COLORS = [
  { id: 'sky', fa: 'آسمانی', hex: '#6FB7FF', lvl: 1 },
  { id: 'mint', fa: 'نعنایی', hex: '#4FDDB4', lvl: 1 },
  { id: 'sun', fa: 'آفتابی', hex: '#FFCF4A', lvl: 1 },
  { id: 'rose', fa: 'گل‌بهی', hex: '#FF8FB8', lvl: 1 },
  { id: 'violet', fa: 'بنفش', hex: '#A98BFF', lvl: 1 },
  { id: 'peach', fa: 'هلویی', hex: '#FFA877', lvl: 1 },
  { id: 'lime', fa: 'سبز لیمویی', hex: '#B6E85A', lvl: 3 },
  { id: 'night', fa: 'شب‌رنگ', hex: '#5C63C9', lvl: 5 },
];

export const EYES = [
  { id: 'round', fa: 'گرد', lvl: 1 },
  { id: 'happy', fa: 'خندان', lvl: 1 },
  { id: 'star', fa: 'ستاره‌ای', lvl: 1 },
];

export const HATS = [
  { id: 'none', fa: 'بدون کلاه', lvl: 1 },
  { id: 'sprout', fa: 'جوانه', lvl: 1 },
  { id: 'cap', fa: 'کلاه لبه‌دار', lvl: 2 },
  { id: 'flower', fa: 'گل', lvl: 3 },
  { id: 'wizard', fa: 'کلاه جادو', lvl: 4 },
  { id: 'crown', fa: 'تاج', lvl: 6 },
];

export const FACE_ACCS = [
  { id: 'none', fa: 'هیچ‌کدام', lvl: 1 },
  { id: 'bowtie', fa: 'پاپیون', lvl: 1 },
  { id: 'glasses', fa: 'عینک', lvl: 2 },
  { id: 'scarf', fa: 'شال‌گردن', lvl: 3 },
];

export const BACKS = [
  { id: 'none', fa: 'هیچ‌کدام', lvl: 1 },
  { id: 'cape', fa: 'شنل', lvl: 4 },
  { id: 'wings', fa: 'بال', lvl: 5 },
];

export const DEFAULT_AVATAR = {
  base: 'blob', color: 'sky', eyes: 'round', hat: 'none', acc: 'none', back: 'none',
};

export const CATEGORIES = {
  base: BASES, color: COLORS, eyes: EYES, hat: HATS, acc: FACE_ACCS, back: BACKS,
};

/** All items that unlock exactly at `level`, for the "new item!" moment. */
export function unlockedAt(level) {
  const out = [];
  for (const [cat, list] of Object.entries(CATEGORIES)) {
    for (const it of list) if (it.lvl === level && level > 1) out.push({ cat, ...it });
  }
  return out;
}
