// Pure stage definitions (no JSX) so the engine and the tests can use them directly.
import * as first from '../engine/items.js';
import * as bridge from '../engine/bridge.js';
import * as eo from '../engine/evenodd.js';
import * as mu from '../engine/multiples.js';

const mastered = (min) => (sum) => Object.values(sum.mastery).every((m) => m >= min);

export const STAGES = {
  'ch1-1': {
    id: 'ch1-1',
    world: 'ch1',
    title: 'تونل‌های زوج و فرد',
    sub: 'الگوهای عددی، زوج و فرد',
    pages: '۲–۴',
    meter: 'crystal',
    skills: eo.SKILLS,
    meta: eo.SKILL_META,
    warmup: eo.WARMUP,
    makeItem: eo.makeItem,
    checkItem: eo.checkItem,
    hasCards: false,
    story: (name) => `${name}، تونل‌های دره‌ی کریستال‌ها خاموش شده‌اند. هر کریستال یک مهارت است. اول درس را ببین، بعد با تمرین هر چهار کریستال را روشن کن.`,
    resultLine: ['شروع خوبی بود! با یک دور تمرین کریستال‌ها روشن‌تر می‌شوند.', 'کریستال‌ها تقریباً روشن شدند. یک دور دیگر کاملشان می‌کند.', 'همه‌ی کریستال‌ها روشن شد! تونل‌ها می‌درخشند.'],
    extraMedals: () => [],
  },
  'ch1-2': {
    id: 'ch1-2',
    world: 'ch1',
    title: 'پل مضرب‌ها',
    sub: 'مضرب‌ها، جدول و جایگاه در صف',
    pages: '۴–۶',
    meter: 'plank',
    skills: mu.SKILLS,
    meta: mu.SKILL_META,
    warmup: mu.WARMUP,
    makeItem: mu.makeItem,
    checkItem: mu.checkItem,
    hasCards: false,
    story: (name) => `${name}، پل نورانیِ دره از کار افتاده است. هر تخته یک مهارت است. اول درس را ببین، بعد با تمرین چهار تخته را محکم کن تا از پل بگذریم.`,
    resultLine: ['شروع خوبی بود! با یک دور تمرین تخته‌ها محکم‌تر می‌شوند.', 'پل تقریباً آماده است. یک دور دیگر کاملش می‌کند.', 'همه‌ی تخته‌ها محکم شد! پل مضرب‌ها آماده است.'],
    extraMedals: () => [],
  },
  'ch3-1': {
    id: 'ch3-1',
    world: 'ch3',
    title: 'فانوس‌های ممیز',
    sub: 'ارزش مکانی و مدل اعداد اعشاری',
    pages: '۴۴',
    meter: 'lantern',
    skills: first.SKILLS,
    meta: first.SKILL_META,
    warmup: ['placeValue', 'readModel', 'buildModel', 'zeroRule'],
    makeItem: first.makeItem,
    checkItem: first.checkItem,
    hasCards: true,
    story: (name) => `${name}، فانوس‌های جنگل ممیز خاموش شده‌اند. اول درس را ببین، بعد با تمرین هر چهار فانوس را روشن کن.`,
    resultLine: ['شروع خوبی بود! با یک دور تمرین بیشتر فانوس‌ها روشن‌تر می‌شوند.', 'فانوس‌ها تقریباً روشن شدند. یک دور دیگر کاملشان می‌کند.', 'همه‌ی فانوس‌ها روشن شد! جنگل می‌درخشد.'],
    extraMedals: () => [],
  },
  'ch3-2': {
    id: 'ch3-2',
    world: 'ch3',
    title: 'پل کسر و اعشار',
    sub: 'کسر، اعشار، شکل گسترده و جمع و تفریق',
    pages: '۴۵–۴۶',
    meter: 'plank',
    skills: bridge.SKILLS,
    meta: bridge.SKILL_META,
    warmup: bridge.WARMUP,
    makeItem: bridge.makeItem,
    checkItem: bridge.checkItem,
    hasCards: false,
    story: (name) => `${name}، پل بین ساحل «کسرها» و ساحل «اعشارها» شکسته است. هر تخته یک مهارت است. اول درس را ببین، بعد چهار تخته را با تمرین محکم کن.`,
    resultLine: ['شروع خوبی بود! با یک دور تمرین بیشتر تخته‌ها محکم‌تر می‌شوند.', 'پل تقریباً آماده است. یک دور دیگر کاملش می‌کند.', 'همه‌ی تخته‌ها محکم شد! پل آماده‌ی عبور است.'],
    extraMedals: (sum) => (mastered(0.6)(sum) ? ['bridge'] : []),
  },
};

export const stageDef = (id) => STAGES[id];
export const STAGE_IDS = Object.keys(STAGES);
