import { createContext, useContext } from 'react';
export const GameCtx = createContext(null);
export const useGame = () => useContext(GameCtx);
