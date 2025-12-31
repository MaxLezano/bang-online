import React, { createContext, useContext, useReducer } from 'react';
import { GameState, Action } from './types';
import { gameReducer, INITIAL_STATE } from './gameEngine';

interface GameContextProps {
    state: GameState;
    dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

    // Removed auto-init useEffect to prevents crash when settings are undefined
    // GameLayout handles INIT_GAME with proper settings

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
