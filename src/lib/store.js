// Local-only game state (v1: no server, no real auth). Everything lives in localStorage.
import { DEFAULT_AVATAR } from '../data/avatarItems.js';

const KEY = 'yad:v1';

export const MISSION_DEFS = {
  finish: { id: 'finish', fa: 'یک مرحله را تمام کن', event: 'stageDone', target: 1, xp: 20, coins: 15 },
  correct: { id: 'correct', fa: '۸ سؤال را درست حل کن', event: 'correct', target: 8, xp: 15, coins: 10 },
  cards: { id: 'cards', fa: 'بازی کارت‌های ممیز را انجام بده', event: 'cards', target: 1, xp: 20, coins: 12 },
};
export const SPECIAL = {
  id: 'special',
  fa: 'مرحله‌ی «فانوس‌های ممیز» را با ۲ ستاره یا بیشتر تمام کن',
  stage: 'ch3-1',
  stars: 2,
  xp: 40,
  coins: 40,
};

export const MEDALS = {
  precise: { fa: 'مدال دقت', how: 'حداقل ۸ سؤال را بار اول درست جواب بده' },
  persist: { fa: 'مدال پشتکار', how: 'بعد از اشتباه دوباره امتحان کن و درست جواب بده' },
  lantern: { fa: 'فانوس‌دار', how: 'یک مرحله را با ۳ ستاره تمام کن' },
  bridge: { fa: 'پل‌ساز', how: 'در مرحله‌ی پل، هر چهار تخته را محکم کن' },
  cards: { fa: 'کارت‌باز ماهر', how: 'در بازی کارت‌ها بهترین عدد را بساز' },
};

export const initialState = () => ({
  v: 1,
  profile: null,
  avatar: { ...DEFAULT_AVATAR },
  xp: 0,
  coins: 0,
  medals: [],
  stages: {},
  missions: { day: '', list: [] },
  specialClaimed: false,
  settings: { reduceMotion: false },
  lastWorld: 'ch3',
});

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const s = JSON.parse(raw);
    if (!s || s.v !== 1) return initialState();
    return { ...initialState(), ...s, avatar: { ...DEFAULT_AVATAR, ...s.avatar } };
  } catch {
    return initialState();
  }
}

export function saveState(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode / blocked storage: the game still works for this session */
  }
}

const freshMissions = (day) => ({
  day,
  list: Object.values(MISSION_DEFS).map((m) => ({ id: m.id, progress: 0, claimed: false })),
});

export function reducer(state, a) {
  switch (a.type) {
    case 'setup':
      return { ...state, profile: { name: a.name }, avatar: { ...state.avatar, ...a.avatar } };
    case 'avatar':
      return { ...state, avatar: { ...state.avatar, ...a.patch } };
    case 'settings':
      return { ...state, settings: { ...state.settings, ...a.patch } };
    case 'world':
      return { ...state, lastWorld: a.id };
    case 'ensureDay':
      return state.missions.day === a.day ? state : { ...state, missions: freshMissions(a.day) };
    case 'reward':
      return { ...state, xp: state.xp + (a.xp || 0), coins: state.coins + (a.coins || 0) };
    case 'event': {
      const list = state.missions.list.map((m) =>
        MISSION_DEFS[m.id]?.event === a.name
          ? { ...m, progress: Math.min(MISSION_DEFS[m.id].target, m.progress + (a.n ?? 1)) }
          : m);
      return { ...state, missions: { ...state.missions, list } };
    }
    case 'claim': {
      const m = state.missions.list.find((x) => x.id === a.id);
      const def = MISSION_DEFS[a.id];
      if (!m || !def || m.claimed || m.progress < def.target) return state;
      return {
        ...state,
        xp: state.xp + def.xp,
        coins: state.coins + def.coins,
        missions: { ...state.missions, list: state.missions.list.map((x) => (x.id === a.id ? { ...x, claimed: true } : x)) },
      };
    }
    case 'claimSpecial': {
      const st = state.stages[SPECIAL.stage];
      if (state.specialClaimed || !st || st.bestStars < SPECIAL.stars) return state;
      return { ...state, specialClaimed: true, xp: state.xp + SPECIAL.xp, coins: state.coins + SPECIAL.coins };
    }
    case 'learned':
      return patchStage(state, a.stageId, { learned: true });
    case 'cardsDone':
      return patchStage(state, a.stageId, { cards: true });
    case 'stageDone': {
      const prev = state.stages[a.stageId] || {};
      const next = {
        ...prev,
        plays: (prev.plays || 0) + 1,
        bestStars: Math.max(prev.bestStars || 0, a.stars),
        mastery: a.mastery,
      };
      const medals = Array.from(new Set([...state.medals, ...(a.medals || [])]));
      return { ...state, medals, stages: { ...state.stages, [a.stageId]: next } };
    }
    case 'addMedal':
      return state.medals.includes(a.id) ? state : { ...state, medals: [...state.medals, a.id] };
    case 'reset':
      return initialState();
    default:
      return state;
  }
}

function patchStage(state, id, patch) {
  return { ...state, stages: { ...state.stages, [id]: { ...(state.stages[id] || {}), ...patch } } };
}
