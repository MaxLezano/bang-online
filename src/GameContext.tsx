import React, { createContext, useContext, useReducer } from 'react';
import { GameState, Action } from './types';
import { gameReducer, INITIAL_STATE } from './gameEngine';

interface GameContextProps {
    state: GameState;
    dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode; onLogAction?: (action: Action) => void }> = ({ children, onLogAction }) => {
    const [state, dispatchOrigin] = useReducer(gameReducer, INITIAL_STATE);

    const dispatch: React.Dispatch<Action> = (action) => {
        if (onLogAction) onLogAction(action);
        dispatchOrigin(action);
    };

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
