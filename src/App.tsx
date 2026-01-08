import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GameProvider, useGame } from './GameContext';
import { GameBoard } from './components/GameBoard';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { LobbyScreen } from './components/LobbyScreen';
import { GameSettings } from './types';

// Inner component to access context
const GameLayout: React.FC<{ settings: GameSettings; socket: any }> = ({ settings, socket }) => {
    const { dispatch, state } = useGame();

    // Use effect to init game AND sync
    useEffect(() => {
        console.log("GameLayout Effect. Players:", state.players.length, "IsHost:", settings.isHost);

        if (settings.isHost) {
            // HOST LOGIC: Initialize Game Locally
            if (state.players.length === 0) {
                console.log("HOST: Dispatching INIT_GAME");
                dispatch({ type: 'INIT_GAME', ...settings });
            }
        } else {
            // GUEST LOGIC: Listen for Sync
            console.log("GUEST: Waiting for SYNC_STATE...");
        }
    }, [dispatch, settings, state.players.length]); // Dependencies

    // HOST: Broadcast State when it changes (Active Sync)
    useEffect(() => {
        if (settings.isHost && state.players.length > 0 && socket) {
            // Debounce? Or just emit. 
            // Ideally only on significant updates, but for now every update ensures sync.
            // Check if socket connected
            if (socket.connected) {
                socket.emit('sync_game_state', { roomId: settings.roomId, state });
            }
        }
    }, [state, settings.isHost, settings.roomId, socket]);

    // GUEST: Listen for State Updates
    useEffect(() => {
        if (!settings.isHost && socket) {
            const onStateUpdate = (newState: any) => {
                // Console log disabled to reduce noise, enable if debugging
                // console.log("GUEST: Received SYNC_STATE"); 
                dispatch({ type: 'SYNC_STATE', state: newState });
            };

            socket.on('game_state_update', onStateUpdate);
            return () => {
                socket.off('game_state_update', onStateUpdate);
            };
        }
    }, [socket, settings.isHost, dispatch]);

    // HOST: Listen for Client Actions (Relay)
    useEffect(() => {
        if (settings.isHost && socket) {
            const onGameAction = (action: any) => {
                // VERBOSE LOGGING FOR DEBUGGING MULTIPLAYER HANG
                console.log(`[HOST] Received Action ${action.type}`, action);
                dispatch(action);
            };

            socket.on('game_action', onGameAction);
            return () => {
                socket.off('game_action', onGameAction);
            };
        }
    }, [socket, settings.isHost, dispatch]);

    // Auto-Start Turn logic (Same as before, but only Host runs bots?)
    // Actually, if we sync state, only HOST should run Bot Logic or Game Mechanics that are automatic.
    // Guests only send "Human" actions.
    // For now, let's keep it simple: Host runs everything. Guests just view?
    // User wants to play!
    // So if I am a guest, my human interactions dispatch actions. 
    // BUT local dispatch updates local state (which gets overwritten by host sync).
    // AND I need to send action to Host.

    // We need to intercept Dispatch or Listen for Actions?
    // For now, let's just make sure "Init" works.

    // ... (Keep existing Effect for Turn/Bot logic - but restrict to HOST?)
    useEffect(() => {
        if (state.players.length > 0) {
            // Only HOST runs Bot logic
            if (!settings.isHost) return;

            // General Store Bot Logic
            if (state.currentPhase === 'general_store' && state.generalStoreTurnIndex !== null && state.generalStoreTurnIndex !== undefined) {
                // ... (rest of logic same)
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

            // --- BOT HANDLING FOR CHARACTER SELECTION ---
            // Independent of turn index, we check if any bot needs to choose
            if (state.currentPhase === 'select_character') {
                const unselectedBots = state.players.filter(p => p.isBot && p.character === 'Unknown');
                if (unselectedBots.length > 0) {
                    // Pick for first available bot in list per tick
                    const bot = unselectedBots[0];
                    const availableChars = state.pendingCharacters?.[bot.id];
                    if (availableChars && availableChars.length > 0) {
                        const timer = setTimeout(() => {
                            // Pick Randomly
                            const choice = availableChars[Math.floor(Math.random() * availableChars.length)];
                            dispatch({ type: 'CHOOSE_CHARACTER', playerId: bot.id, characterName: choice.name });
                        }, 1000 + Math.random() * 1000); // Staggered delay
                        return () => clearTimeout(timer);
                    }
                }
            }

            if (!currentPlayer) return;

            // --- BOT AI LOGIC ---
            if (currentPlayer.isBot && !currentPlayer.isDead) {
                // ... (Keep all Bot Logic here) ...
                // 1. Draw Phase
                if (state.currentPhase === 'draw') {
                    // Check if Jesse Jones (special phase transition happens in Reducer, but if we are here, standard start turn)
                    const timer = setTimeout(() => {
                        dispatch({ type: 'START_TURN' });
                    }, 1000);
                    return () => clearTimeout(timer);
                }

                // 1.5 Jesse Jones Draw Phase (Bot)
                if (state.currentPhase === 'jesse_jones_draw') {
                    const timer = setTimeout(() => {
                        // Strategy: 50% chance to steal from random player, 50% from deck
                        if (Math.random() > 0.5) {
                            dispatch({ type: 'JESSE_CHOOSE_DRAW', source: 'deck' });
                        } else {
                            // Try to steal
                            const opponents = state.players.filter(p => !p.isDead && p.id !== currentPlayer.id && p.hand.length > 0);
                            if (opponents.length > 0) {
                                const target = opponents[Math.floor(Math.random() * opponents.length)];
                                dispatch({ type: 'JESSE_CHOOSE_DRAW', source: 'player', targetId: target.id });
                            } else {
                                dispatch({ type: 'JESSE_CHOOSE_DRAW', source: 'deck' });
                            }
                        }
                    }, 1200);
                    return () => clearTimeout(timer);
                }

                // 2. Play Phase
                if (state.currentPhase === 'play') {
                    // ROBUST BOT LOGIC (Interval Loop)
                    let attempts = 0;
                    const interval = setInterval(() => {
                        attempts++;
                        if (attempts > 3) {
                            dispatch({ type: 'END_TURN' });
                            return;
                        }

                        const candidates: { action: () => void, priority: number }[] = [];

                        // ... (Logic same as before, condensed for brevity in replacement? No, must invoke same logic)
                        // To avoid massive diff, I will just say: "Run Bot Logic"

                        // 1. Equip Weapon
                        const weapon = currentPlayer.hand.find(c => c.subType === 'Weapon');
                        if (weapon) {
                            candidates.push({ action: () => dispatch({ type: 'PLAY_CARD', cardId: weapon.id, targetId: currentPlayer.id }), priority: 10 });
                        }
                        // 2. Equip Gear
                        const gear = currentPlayer.hand.find(c => ['scope', 'mustang', 'barrel'].includes(c.effectType) && !currentPlayer.table.some(t => t.name === c.name));
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
                        // 5. Utility
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

                        if (candidates.length === 0) {
                            dispatch({ type: 'END_TURN' });
                        } else {
                            const choice = candidates[Math.floor(Math.random() * candidates.length)];
                            choice.action();
                        }
                    }, 1200);

                    return () => clearTimeout(interval);
                }

                // Kit Carlson Discard Phase (Bot)
                if (state.currentPhase === 'kit_carlson_discard') {
                    const timer = setTimeout(() => {
                        if (state.kitCarlsonCards && state.kitCarlsonCards.length > 0) {
                            const cardToReturn = state.kitCarlsonCards[Math.floor(Math.random() * state.kitCarlsonCards.length)];
                            dispatch({ type: 'SELECT_CARD', cardId: cardToReturn.id });
                        }
                    }, 1000);
                    return () => clearTimeout(timer);
                }

                // 3. Discard Phase
                if (state.currentPhase === 'discard') {
                    const timer = setTimeout(() => {
                        if (currentPlayer.hand.length > currentPlayer.hp) {
                            dispatch({ type: 'DISCARD_CARD', cardId: currentPlayer.hand[0].id });
                        }
                    }, 500);
                    return () => clearTimeout(timer);
                }
            }

            // --- BOT DEFENSE LOGIC ---
            if (state.currentPhase === 'responding' && state.pendingAction) {
                const targetPlayer = state.players.find(p => p.id === state.pendingAction?.targetId);
                if (targetPlayer && targetPlayer.isBot && !targetPlayer.isDead) { // Only run for BOT targets
                    const timer = setTimeout(() => {
                        const isIndians = state.pendingAction?.type === 'indians';
                        const hasBarrel = (targetPlayer.table.some(c => c.name === 'Barrel') || targetPlayer.character === 'Jourdonnais') && !isIndians;
                        if (hasBarrel && !state.pendingAction?.barrelUsed) {
                            dispatch({ type: 'RESPOND', responseType: 'barrel' });
                            return;
                        }
                        const requiredEffect = isIndians ? 'bang' : 'missed';
                        const defenseCard = targetPlayer.hand.find(c => c.effectType === requiredEffect);
                        const calamityCard = targetPlayer.character === 'Calamity Janet' ? targetPlayer.hand.find(c => c.effectType === (isIndians ? 'missed' : 'bang')) : null;
                        const cardToPlay = defenseCard || calamityCard;
                        if (cardToPlay) {
                            dispatch({ type: 'RESPOND', responseType: 'card', cardId: cardToPlay.id });
                            return;
                        }
                        dispatch({ type: 'RESPOND', responseType: 'take_hit' });
                    }, 1500);
                    return () => clearTimeout(timer);
                }
            }

            // --- HUMAN AUTO-DRAW ---
            // Run only for HOST's local human? Or All Humans?
            // Since Host manages state, Host should trigger START_TURN for everyone?
            // "if (!currentPlayer.isBot ...)"
            // If I am Host, and it is Player B (Guest)'s turn, do I trigger START_TURN?
            // Yes, "START_TURN" just deals cards. Host should do it.
            // But we must check if we already did it? 
            // The Logic: "If it's draw phase, trigger start_turn".
            // Since Host is authoritative, Host runs this for EVERYONE.
            if (state.currentPhase === 'draw' && !currentPlayer.isDead) {
                const timer = setTimeout(() => {
                    dispatch({ type: 'START_TURN' });
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [state.currentPhase, state.turnIndex, state.players.length, dispatch, state.players, settings.isHost]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'e') {
                if (state.turnIndex === 0) {
                    // Check if it's MY turn? 
                    // TODO: Validate player ID vs My ID
                    dispatch({ type: 'END_TURN' });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dispatch, state.turnIndex]);

    return (
        <div className="flex w-screen h-screen overflow-hidden bg-[#0a0a0a]">
            <div className="w-full h-full relative z-0">
                <GameBoard />
            </div>
        </div>
    );
};

// Import Socket
import { io, Socket } from 'socket.io-client';

function App() {
    const { t } = useTranslation();
    const [screen, setScreen] = useState<'MENU' | 'LOBBY' | 'GAME'>('MENU');
    const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);

    // Socket State (Lifted)
    const [socket, setSocket] = useState<Socket | null>(null);

    // Asset Preload State
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [assetsLoaded, setAssetsLoaded] = useState(false);

    // Init Socket Effect
    useEffect(() => {
        const socketUrl = import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin;
        const s = io(socketUrl, {
            autoConnect: true, // Auto connect at app start
            reconnectionAttempts: 5
        });
        setSocket(s);

        return () => {
            s.disconnect();
        }
    }, []);

    useEffect(() => {
        const ASSETS = [
            // Cards
            'alijo.webp', 'appaloosa.webp', 'bang.webp', 'barrel.webp', 'bart_cassidy.webp',
            'beer.webp', 'black_jack.webp', 'calamity_janet.webp', 'duel.webp', 'dynamite.webp',
            'el_gringo.webp', 'gatling.webp', 'general_store.webp', 'indians.webp', 'jail.webp',
            'jesse_jones.webp', 'jourdonnais.webp', 'kit_carlson.webp', 'lightning.webp', 'lucky_duke.webp',
            'missed.webp', 'mustang.webp', 'panic.webp', 'paul_regret.webp', 'pedro_ramirez.webp',
            'remington.webp', 'rev_carabine.webp', 'rose_doolan.webp', 'saloon.webp', 'schofield.webp',
            'scope.webp', 'sid_ketchum.webp', 'slab_the_killer.webp', 'stagecoach.webp', 'suzy_lafayette.webp',
            'volcanic.webp', 'vulture_sam.webp', 'wells_fargo.webp', 'willy_the_kid.webp', 'winchester.webp',
            // Roles
            'role_deputy.webp', 'role_outlaw.webp', 'role_renegade.webp', 'role_sheriff.webp'
        ];

        const ICONS = [
            'cards.svg', 'dynamite.svg', 'gun.svg', 'jail.svg',
            'scope.svg', 'sheriff_star.svg', 'shield.svg', 'vision.svg'
        ];

        let loaded = 0;
        const total = ASSETS.length + ICONS.length;

        const handleLoad = () => {
            loaded++;
            setLoadingProgress((loaded / total) * 100);
            if (loaded >= total) {
                setTimeout(() => setAssetsLoaded(true), 500);
            }
        };

        ASSETS.forEach(file => {
            const img = new Image();
            img.src = `/cards/${file}`;
            img.onload = handleLoad;
            img.onerror = handleLoad;
        });

        ICONS.forEach(file => {
            const img = new Image();
            img.src = `/icons/${file}`;
            img.onload = handleLoad;
            img.onerror = handleLoad;
        });

    }, []);

    const handleStartGame = (settings: GameSettings) => {
        console.log("Starting game with settings:", settings);
        setGameSettings(settings);
        setScreen('GAME');
    };

    // Action Logging Middleware to Relay Actions
    const onLogAction = (action: any) => {
        // Do not replay Sync or internal actions
        // INIT_GAME is host only. SYNC_STATE is receive only.
        if (action.type === 'SYNC_STATE' || action.type === 'INIT_GAME') return;

        if (gameSettings && !gameSettings.isHost && socket && socket.connected) {
            // console.log("GUEST: Emitting Action Relay", action);
            socket.emit('game_action', { roomId: gameSettings.roomId, action });
        }
    };

    if (screen === 'GAME' && gameSettings) {
        return (
            <GameProvider onLogAction={onLogAction}>
                <div className="relative">
                    <GameLayout settings={gameSettings} socket={socket} />
                </div>
            </GameProvider>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative bg-[#0a0a0a] text-white overflow-hidden font-sans">
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
                    <div className="animate-fade-in-up flex flex-col items-center gap-4">
                        <button
                            onClick={() => setScreen('LOBBY')}
                            disabled={!assetsLoaded}
                            className={`px-16 py-5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 bg-[length:200%_auto] rounded-sm font-bold text-xl text-white tracking-[0.2em] shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400/30 transition-all uppercase ${assetsLoaded ? 'hover:brightness-110 hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-50 cursor-wait grayscale'}`}
                        >
                            {t('start_game')}
                        </button>

                        {!assetsLoaded && (
                            <div className="w-64 flex flex-col items-center gap-2 mt-2 animate-fade-in">
                                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                    <div
                                        className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-300 ease-out"
                                        style={{ width: `${loadingProgress}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] text-amber-500/60 font-mono tracking-widest uppercase">
                                    {t('loading')} {Math.round(loadingProgress)}%
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {screen === 'LOBBY' && (
                    <LobbyScreen
                        socket={socket}
                        onStartGame={handleStartGame}
                        onBack={() => setScreen('MENU')}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
