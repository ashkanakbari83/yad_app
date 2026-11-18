import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Frame from './components/Frame.jsx';
import { levelInfo } from './data/levels.js';
import { unlockedAt } from './data/avatarItems.js';
import { GameCtx } from './lib/game.jsx';
import { jalaliKey } from './lib/jalali.js';
import { loadState, reducer, saveState } from './lib/store.js';
import Intro from './screens/Intro.jsx';
import Setup from './screens/Setup.jsx';
import Home from './screens/Home.jsx';
import { WorldList, WorldPath } from './screens/Map.jsx';
import Wardrobe from './screens/Wardrobe.jsx';
import Settings from './screens/Settings.jsx';
import StageRunner from './screens/Stage.jsx';
import LevelUp from './screens/LevelUp.jsx';

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [route, setRoute] = useState({ name: 'intro' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [levelUp, setLevelUp] = useState(null);
  const [stagePhase, setStagePhase] = useState('');
  const level = levelInfo(state.xp).level;
  const prevLevel = useRef(level);

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { dispatch({ type: 'ensureDay', day: jalaliKey() }); }, []);
  useEffect(() => {
    if (level > prevLevel.current) {
      const items = [];
      for (let l = prevLevel.current + 1; l <= level; l++) items.push(...unlockedAt(l));
      setLevelUp({ level, items });
    }
    prevLevel.current = level;
  }, [level]);

  const go = useCallback((name, params = {}) => { setStagePhase(''); setRoute({ name, ...params }); }, []);
  const ctx = useMemo(() => ({ state, dispatch, level }), [state, level]);
  const home = () => go(state.profile ? 'home' : 'setup');

  let screen;
  switch (route.name) {
    case 'intro': screen = <Intro onStart={() => go(state.profile ? 'home' : 'setup')} />; break;
    case 'setup': screen = <Setup onDone={() => go('home')} />; break;
    case 'home': screen = <Home go={go} openSettings={() => setSettingsOpen(true)} />; break;
    case 'map': screen = <WorldList go={go} onBack={() => go('home')} />; break;
    case 'world': screen = <WorldPath worldId={route.worldId} go={go} onBack={() => go('map')} />; break;
    case 'ward': screen = <Wardrobe onBack={() => go('home')} />; break;
    case 'stage': screen = <StageRunner key={route.stageId + (route.run || 0)} stageId={route.stageId} onExit={() => go('home')} onMap={() => go('world', { worldId: 'ch3' })} onReplay={() => go('stage', { stageId: route.stageId, run: (route.run || 0) + 1, skipLearn: true })} skipLearn={route.skipLearn} onPhase={setStagePhase} />; break;
    default: screen = <Intro onStart={home} />;
  }
  const world = route.name === 'world' ? route.worldId : 'ch3';
  return (
    <GameCtx.Provider value={ctx}>
      <Frame world={world} reduceMotion={state.settings.reduceMotion}>
        {screen}
        {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} onReset={() => { setSettingsOpen(false); go('intro'); }} />}
        {levelUp && (route.name !== 'stage' || stagePhase === 'result') && <LevelUp info={levelUp} onClose={() => setLevelUp(null)} />}
      </Frame>
    </GameCtx.Provider>
  );
}
