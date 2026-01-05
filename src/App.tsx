import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GameProvider, useGame } from './GameContext';
import { GameBoard } from './components/GameBoard';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { LobbyScreen } from './components/LobbyScreen';
import { GameSettings } from './types';

// Inner component to access context
const GameLayout: React.FC<{ settings: GameSettings }> = ({ settings }) => {
    const { dispatch, state } = useGame();

    // Use effect to init game once
    useEffect(() => {
        console.log("GameLayout Effect. Players:", state.players.length);
        if (state.players.length === 0) {
            console.log("Dispatching INIT_GAME");
            dispatch({ type: 'INIT_GAME', ...settings });
        }
    }, [dispatch, settings, state.players.length]);

    // Auto-Start Turn logic if it's 'draw' phase and it's someone's turn and no pending action.
    // Ideally this goes in the Engine Effect, but putting it here for simple loop.
    useEffect(() => {
        if (state.players.length > 0) {
            // General Store Bot Logic
            if (state.currentPhase === 'general_store' && state.generalStoreTurnIndex !== null && state.generalStoreTurnIndex !== undefined) {
                const picker = state.players[state.generalStoreTurnIndex];
                if (picker.isBot && !picker.isDead && state.generalStoreCards && state.generalStoreCards.length > 0) {
                    const cards = state.generalStoreCards;
                    const timer = setTimeout(() => {
                        const randomCard = cards[Math.floor(Math.random() * cards.length)];
                        dispatch({ type: 'DRAFT_CARD', cardId: randomCard.id });
                    }, 1500);
                    return () => clearTimeout(timer);
                }
            }

            const currentPlayer = state.players[state.turnIndex];
            if (!currentPlayer) return;

            // --- BOT AI LOGIC ---
            if (currentPlayer.isBot && !currentPlayer.isDead) {
                // 1. Draw Phase
                if (state.currentPhase === 'draw') {
                    const timer = setTimeout(() => {
                        dispatch({ type: 'START_TURN' });
                    }, 1000);
                    return () => clearTimeout(timer);
                }

                // 2. Play Phase
                if (state.currentPhase === 'play') {
                    // ROBUST BOT LOGIC (Interval Loop)
                    // We use attempts to prevent freezing. Local var persists in closure until effect re-runs.
                    let attempts = 0;

                    const interval = setInterval(() => {
                        attempts++;
                        // Failsafe: If we tried 4 times with no state change (meaning invalid moves), END TURN.
                        if (attempts > 3) {
                            dispatch({ type: 'END_TURN' });
                            return;
                        }

                        // Collect Candidates
                        const candidates: { action: () => void, priority: number }[] = [];

                        // 1. Equip Weapon
                        const weapon = currentPlayer.hand.find(c => c.subType === 'Weapon');
                        if (weapon) {
                            candidates.push({ action: () => dispatch({ type: 'PLAY_CARD', cardId: weapon.id, targetId: currentPlayer.id }), priority: 10 });
                        }

                        // 2. Equip Gear
                        // Filter for unique items (cannot equip if already have it)
                        const gear = currentPlayer.hand.find(c =>
                            ['scope', 'mustang', 'barrel'].includes(c.effectType) &&
                            !currentPlayer.table.some(t => t.name === c.name)
                        );
                        if (gear) {
                            candidates.push({ action: () => dispatch({ type: 'PLAY_CARD', cardId: gear.id, targetId: currentPlayer.id }), priority: 9 });
                        }

                        // 3. Heal
                        const heal = currentPlayer.hand.find(c => ['heal', 'saloon'].includes(c.effectType));
                        if (heal && currentPlayer.hp < currentPlayer.maxHp) {
                            candidates.push({ action: () => dispatch({ type: 'PLAY_CARD', cardId: heal.id, targetId: currentPlayer.id }), priority: 8 });
                        }

                        // 4. Global
                        const globalDmg = currentPlayer.hand.find(c => ['indians', 'gatling', 'damage_all'].includes(c.effectType));
                        if (globalDmg) {
                            candidates.push({ action: () => dispatch({ type: 'PLAY_CARD', cardId: globalDmg.id }), priority: 7 });
                        }

                        // 5. Utility (Draw/Store)
                        const utility = currentPlayer.hand.find(c => ['draw', 'store', 'general_store'].includes(c.effectType));
                        if (utility) {
                            candidates.push({ action: () => dispatch({ type: 'PLAY_CARD', cardId: utility.id }), priority: 6 });
                        }

                        // 6. BANG! / Duel
                        const bang = currentPlayer.hand.find(c => ['bang', 'duel'].includes(c.effectType));
                        if (bang) {
                            const opponents = state.players.filter(p => p.id !== currentPlayer.id && !p.isDead);
                            if (opponents.length > 0) {
                                const target = opponents[Math.floor(Math.random() * opponents.length)];
                                candidates.push({ action: () => dispatch({ type: 'PLAY_CARD', cardId: bang.id, targetId: target.id }), priority: 5 });
                            }
                        }

                        // DECISION:
                        if (candidates.length === 0) {
                            // No moves? End Turn.
                            dispatch({ type: 'END_TURN' });
                        } else {
                            // Sort by priority, but allow randomness.
                            // To fix the "Freeze on Invalid High Priority":
                            // We pick a random one from top 3? Or just random?
                            // Let's just pick RANDOM from the candidates to ensure we don't get stuck on one bad card.
                            const choice = candidates[Math.floor(Math.random() * candidates.length)];
                            choice.action();
                        }
                    }, 1200); // Tick every 1.2s

                    return () => clearTimeout(interval);
                }

                // Kit Carlson Discard Phase (Bot)
                if (state.currentPhase === 'kit_carlson_discard') {
                    const timer = setTimeout(() => {
                        // FIX: Use temp cards, not hand
                        if (state.kitCarlsonCards && state.kitCarlsonCards.length > 0) {
                            const cardToReturn = state.kitCarlsonCards[Math.floor(Math.random() * state.kitCarlsonCards.length)];
                            dispatch({ type: 'SELECT_CARD', cardId: cardToReturn.id });
                        }
                    }, 1000);
                    return () => clearTimeout(timer);
                }

                // 3. Discard Phase (Auto discard random until Hand <= HP)
                if (state.currentPhase === 'discard') {
                    const timer = setTimeout(() => {
                        if (currentPlayer.hand.length > currentPlayer.hp) {
                            // Discard valid card
                            dispatch({ type: 'DISCARD_CARD', cardId: currentPlayer.hand[0].id });
                        }
                    }, 500); // Faster tick to clear hand quickly
                    return () => clearTimeout(timer);
                }
            }

            // --- BOT DEFENSE LOGIC (Interactive Response) ---
            if (state.currentPhase === 'responding' && state.pendingAction) {
                const targetPlayer = state.players.find(p => p.id === state.pendingAction?.targetId);

                if (targetPlayer && targetPlayer.isBot && !targetPlayer.isDead) {
                    const timer = setTimeout(() => {
                        const isIndians = state.pendingAction?.type === 'indians';

                        // Priority 1: Use Barrel (if available and not used) -- CANNOT USE AGAINST INDIANS
                        const hasBarrel = (targetPlayer.table.some(c => c.name === 'Barrel') || targetPlayer.character === 'Jourdonnais') && !isIndians;
                        if (hasBarrel && !state.pendingAction?.barrelUsed) {
                            dispatch({ type: 'RESPOND', responseType: 'barrel' });
                            return;
                        }

                        // Priority 2: Play Correct Defense Card
                        const requiredEffect = isIndians ? 'bang' : 'missed';

                        const defenseCard = targetPlayer.hand.find(c => c.effectType === requiredEffect);
                        const calamityCard = targetPlayer.character === 'Calamity Janet' ? targetPlayer.hand.find(c => c.effectType === (isIndians ? 'missed' : 'bang')) : null;

                        const cardToPlay = defenseCard || calamityCard;

                        if (cardToPlay) {
                            dispatch({ type: 'RESPOND', responseType: 'card', cardId: cardToPlay.id });
                            return;
                        }

                        // Priority 3: Take Hit
                        dispatch({ type: 'RESPOND', responseType: 'take_hit' });

                    }, 1500); // 1.5s delay for "thinking"
                    return () => clearTimeout(timer);
                }
            }

            // --- HUMAN AUTO-DRAW (Optional, but good for flow) ---
            // If it's the start of turn (phase 'draw') we trigger START_TURN Action to actually draw
            // BUT we must avoid infinite loop. The Reducer sets phase to 'play' after START_TURN.
            if (!currentPlayer.isBot && state.currentPhase === 'draw' && !currentPlayer.isDead) {
                const timer = setTimeout(() => {
                    dispatch({ type: 'START_TURN' });
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [state.currentPhase, state.turnIndex, state.players.length, dispatch, state.players]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'e') {
                // simple check to ensure it's our turn
                if (state.turnIndex === 0) {
                    dispatch({ type: 'END_TURN' });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dispatch, state.turnIndex]);

    return (
        <div className="flex w-screen h-screen overflow-hidden bg-[#0a0a0a]">
            {/* Full Width Game Board */}
            <div className="w-full h-full relative z-0">
                <GameBoard />
            </div>
        </div>
    );
};

function App() {
    const { t } = useTranslation();
    const [screen, setScreen] = useState<'MENU' | 'LOBBY' | 'GAME'>('MENU');
    const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);

    const handleStartGame = (settings: GameSettings) => {
        console.log("Starting game with settings:", settings);
        setGameSettings(settings);
        setScreen('GAME');
    };

    if (screen === 'GAME' && gameSettings) {
        return (
            <GameProvider>
                <div className="relative">
                    <GameLayout settings={gameSettings} />
                </div>
            </GameProvider>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative bg-[#0a0a0a] text-white overflow-hidden font-sans">
            {/* Background ambience */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-[#0a0a0a] to-[#0a0a0a] z-0 pointer-events-none"></div>

            <LanguageSwitcher />

            <div className="z-10 flex flex-col items-center w-full animate-fade-in">
                {screen === 'MENU' && (
                    <div className="text-center mb-20 scale-110 animate-fade-in">
                        <h1 className="text-9xl md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-700 tracking-tighter drop-shadow-[0_5px_0_rgba(180,83,9,1)] transform -rotate-3 animate-pulse-slow font-serif" style={{ WebkitTextStroke: '2px #78350f' }}>
                            BANG!
                        </h1>
                        <h2 className="text-3xl md:text-5xl font-black text-yellow-300 tracking-[0.1em] uppercase mt-4 mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] animate-pulse">
                            {t('welcome')}
                        </h2>
                        <div className="h-[1px] w-64 bg-amber-700/50 mx-auto my-6 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                        <p className="text-xs md:text-sm text-amber-100/40 font-light uppercase tracking-[1em]">
                            {t('description')}
                        </p>
                    </div>
                )}

                {screen === 'MENU' && (
                    <div className="animate-fade-in-up">
                        <button
                            onClick={() => setScreen('LOBBY')}
                            className="px-16 py-5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 bg-[length:200%_auto] rounded-sm font-bold text-xl text-white tracking-[0.2em] shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400/30 hover:brightness-110 hover:scale-105 active:scale-95 transition-all uppercase"
                        >
                            {t('start_game')}
                        </button>
                    </div>
                )}

                {screen === 'LOBBY' && (
                    <LobbyScreen
                        onStartGame={handleStartGame}
                        onBack={() => setScreen('MENU')}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
