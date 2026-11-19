// The map. Each chapter of the book = one world. `ready:false` nodes are honest placeholders:
// the structure (titles, page ranges) comes straight from the chapter files; content is built later.
export const WORLDS = [
  {
    id: 'ch1',
    chapter: 1,
    fa: 'دره‌ی کریستال‌ها',
    topic: 'عدد و الگوهای عددی',
    blurb: 'الگوها، مضرب‌ها، بخش‌پذیری و اعداد صحیح',
    theme: { a: '#2B3A8F', b: '#6C8CFF', accent: '#7BE0FF', glow: '#C7F2FF' },
    nodes: [
      { id: 'ch1-1', fa: 'تونل‌های زوج و فرد', pages: '۲–۴', ready: true, stageId: 'ch1-1' },
      { id: 'ch1-2', fa: 'پل مضرب‌ها', pages: '۴–۶' },
      { id: 'ch1-3', fa: 'کوه عددهای بزرگ', pages: '۷–۱۰' },
      { id: 'ch1-4', fa: 'دروازه‌ی بخش‌پذیری', pages: '۱۱–۱۵' },
      { id: 'ch1-5', fa: 'قله‌ی یخی', pages: '۱۶–۱۹' },
      { id: 'ch1-6', fa: 'معمای کریستال', pages: '۲۰–۲۲' },
    ],
  },
  {
    id: 'ch2',
    chapter: 2,
    fa: 'دشت قطعه‌ها',
    topic: 'کسر',
    blurb: 'جمع، تفریق، ضرب و تقسیم کسرها',
    theme: { a: '#12806F', b: '#8EE6B8', accent: '#FFD24D', glow: '#FFF3B8' },
    nodes: [
      { id: 'ch2-1', fa: 'نانوایی مخرج مشترک', pages: '۲۴–۲۷' },
      { id: 'ch2-2', fa: 'باغ ضرب کسرها', pages: '۲۸–۳۱' },
      { id: 'ch2-3', fa: 'رود تقسیم', pages: '۳۲–۳۵' },
      { id: 'ch2-4', fa: 'بازار محاسبه', pages: '۳۶–۳۸' },
      { id: 'ch2-5', fa: 'مربع جادویی', pages: '۳۹–۴۲' },
    ],
  },
  {
    id: 'ch3',
    chapter: 3,
    fa: 'جنگل ممیز',
    topic: 'اعداد اعشاری',
    blurb: 'ارزش مکانی، ضرب و تقسیم اعداد اعشاری',
    theme: { a: '#3B1F7A', b: '#B565E8', accent: '#FFC857', glow: '#FFE7A8' },
    nodes: [
      { id: 'ch3-1', fa: 'فانوس‌های ممیز', pages: '۴۴', ready: true, stageId: 'ch3-1' },
      { id: 'ch3-2', fa: 'پل کسر و اعشار', pages: '۴۵–۴۶', ready: true, stageId: 'ch3-2' },
      { id: 'ch3-3', fa: 'دروازه‌ی مقایسه', pages: '۴۷' },
      { id: 'ch3-4', fa: 'ضرب و جابه‌جایی ممیز', pages: '۴۸–۵۱' },
      { id: 'ch3-5', fa: 'تقسیم ده‌تایی', pages: '۵۲–۵۵' },
      { id: 'ch3-6', fa: 'تقسیم بر عدد اعشاری', pages: '۵۶–۶۰' },
      { id: 'ch3-7', fa: 'گنج و معما', pages: '۶۰–۶۲' },
    ],
  },
];

export const worldById = (id) => WORLDS.find((w) => w.id === id);
export const firstReadyStage = () => 'ch1-1';

/** The stage the "continue" button on the home screen should open: the first ready stage that has
 *  not been played yet, otherwise the ready stage with the fewest stars (so progress is always visible). */
export function continueStageId(stages = {}) {
  const ready = WORLDS.flatMap((w) => w.nodes).filter((n) => n.ready);
  const fresh = ready.find((n) => !stages[n.stageId]?.plays);
  if (fresh) return fresh.stageId;
  return ready.reduce((best, n) => ((stages[n.stageId]?.bestStars || 0) < (stages[best.stageId]?.bestStars || 0) ? n : best), ready[0]).stageId;
}
