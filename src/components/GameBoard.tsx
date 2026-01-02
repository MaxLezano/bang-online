import React, { useEffect } from 'react';
import { useGame } from '../GameContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';

export const GameBoard: React.FC = () => {
    const { state, dispatch } = useGame();
    const { t } = useTranslation();

    // Determine "My Player" (always index 0 for this prototype)
    const myPlayerIndex = 0;
    const myPlayer = state.players[myPlayerIndex];
    // REMOVED early return here to avoid Hook Error

    // Filter opponents (ensure we get all of them)
    // Safe check if myPlayer is undefined yet
    const opponents = myPlayer ? state.players.filter(p => p.id !== myPlayer.id) : [];

    const [showDiscardPile, setShowDiscardPile] = React.useState(false); // Can reuse or rename, let's keep for internal toggle if needed, but we'll add specific modal state
    const [showDiscardModal, setShowDiscardModal] = React.useState(false); // Modal for history
    const [inspectedOpponentId, setInspectedOpponentId] = React.useState<string | null>(null);
    const [hoveredHandCardId, setHoveredHandCardId] = React.useState<string | null>(null);
    const [hoveredDiscardCardId, setHoveredDiscardCardId] = React.useState<string | null>(null); // For discard hover tooltip

    // NEW: Role Reveal State
    const [roleRevealed, setRoleRevealed] = React.useState(false);



    const handleOpponentClick = (id: string) => {
        if (state.selectedCardId) {
            handleTargetClick(id);
        } else {
            setInspectedOpponentId(id);
        }
    };

    const handleCardClick = (cardId: string) => {
        if (state.turnIndex !== myPlayerIndex) return;

        // Discard Phase Logic
        if (state.currentPhase === 'discard') {
            dispatch({ type: 'DISCARD_CARD', cardId });
            return;
        }

        if (state.selectedCardId === cardId) {
            dispatch({ type: 'SELECT_CARD', cardId: null });
        } else {
            dispatch({ type: 'SELECT_CARD', cardId });
        }
    };

    const handleTargetClick = (targetId: string) => {
        if (state.selectedCardId && state.turnIndex === myPlayerIndex) {
            const card = myPlayer.hand.find(c => c.id === state.selectedCardId);
            if (card && (card.type === 'Equipment' || card.type === 'Status')) {
                // Check conflicts
                if (card.subType === 'Weapon') {
                    const hasWeapon = myPlayer.table.some(c => c.subType === 'Weapon');
                    if (hasWeapon) {
                        if (!window.confirm(t('confirm_replace_weapon') || "Replace current weapon?")) return;
                    }
                }
                // Note: Other equipment usually stacks unless specific (like Scope), but Bang rules say 1 copy of unique card.
                // For now, only confirm Weapon as requested.
            }
            dispatch({ type: 'PLAY_CARD', cardId: state.selectedCardId, targetId });
        }
    };

    // --- DRAW ANIMATION STATE ---
    const [drawAnim, setDrawAnim] = React.useState<any>(null);
    const [showDraw, setShowDraw] = React.useState(false);
    const lastDrawTimeRef = React.useRef(0);

    useEffect(() => {
        if (state.latestDrawCheck && state.latestDrawCheck.timestamp > lastDrawTimeRef.current) {
            lastDrawTimeRef.current = state.latestDrawCheck.timestamp;
            setDrawAnim(state.latestDrawCheck);
            setShowDraw(true);
            const timer = setTimeout(() => setShowDraw(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [state.latestDrawCheck]);

    // KEYBOARD CONTROLS - Moved ABOVE early return to fix Hook Order
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!myPlayer || state.turnIndex !== myPlayerIndex) return;
            const key = parseInt(e.key);
            if (!isNaN(key) && key > 0 && key <= myPlayer.hand.length) {
                const card = myPlayer.hand[key - 1];
                if (card) handleCardClick(card.id);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.turnIndex, myPlayer?.hand, state.selectedCardId]);

    // CHECK LOADING STATE AFTER HOOKS
    if (!myPlayer) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] text-white">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 border-4 border-t-purple-500 border-cyan-500 rounded-full animate-spin"></div>
                    <p className="text-xl font-bold tracking-widest">{t('loading')}</p>
                </div>
            </div>
        );
    }

    // --- HELPERS ---
    const getCharDescriptionKey = (name: string) => {
        // "Jesse Jones" -> "char_jesse_jones"
        const clean = name.toLowerCase().replace(/ /g, '_');
        return `char_${clean}`;
    };

    // Role Icons
    const getRoleIcon = (role: string) => {
        if (!role) return '❓';
        switch (role.toLowerCase()) {
            case 'sheriff': return '⭐';
            case 'deputy': return '👮';
            case 'outlaw': return '💀';
            case 'renegade': return '🎭';
            default: return '🤠';
        }
    };

    const getCharacterDescKey = (charName: string) => {
        // simple mapping or fallback
        return `char_${charName.replace(/\s+/g, '_').toLowerCase()}`;
    };

    // --- DRAG AND DROP ---
    const handleDragStart = (e: React.DragEvent, cardId: string) => {
        e.dataTransfer.setData('text/plain', cardId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necesssary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropOnSelf = (e: React.DragEvent) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('text/plain');
        if (state.turnIndex === myPlayerIndex && cardId) {
            const card = myPlayer.hand.find(c => c.id === cardId);
            // Allow equipping Weapons/Gear or Self-Target cards (Beer, Stagecoach etc) by dropping on self
            if (card && (card.type === 'Equipment' || card.subType === 'Weapon' || card.effectType === 'heal' || card.effectType === 'draw' || card.effectType === 'saloon')) {
                // Check if replacing weapon
                if (card.subType === 'Weapon') {
                    // Auto-replace
                } else if (card.type === 'Equipment') {
                    const gears = myPlayer.table.filter(c => c.subType !== 'Weapon');
                    if (gears.length >= 2) {
                        if (!window.confirm(`Gear slots full. Replace ${gears[0].name}?`)) return;
                    }
                }
                dispatch({ type: 'PLAY_CARD', cardId, targetId: myPlayer.id });
            }
        }
    };

    const handleSlotClick = (slotType: 'Weapon' | 'Gear') => {
        if (!state.selectedCardId || state.turnIndex !== myPlayerIndex) return;
        const card = myPlayer.hand.find(c => c.id === state.selectedCardId);
        if (!card) return;

        if (slotType === 'Weapon' && card.subType === 'Weapon') {
            dispatch({ type: 'PLAY_CARD', cardId: card.id, targetId: myPlayer.id });
        } else if (slotType === 'Gear' && card.type === 'Equipment' && card.subType !== 'Weapon') {
            const gears = myPlayer.table.filter(c => c.subType !== 'Weapon');
            if (gears.length >= 2) {
                if (!window.confirm(`Gear slots full. Replace ${gears[0].name}?`)) return;
            }
            dispatch({ type: 'PLAY_CARD', cardId: card.id, targetId: myPlayer.id });
        }
    };

    const handleDropOnTable = (e: React.DragEvent) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('text/plain');
        if (state.turnIndex === myPlayerIndex && cardId) {
            const card = myPlayer.hand.find(c => c.id === cardId);
            // Allow Global Cards (Indians, Gatling, Saloon, General Store) AND Beer by dropping on table center
            // Note: Gatling uses 'damage_all'
            if (card && (['indians', 'gatling', 'damage_all', 'saloon', 'general_store', 'heal'].includes(card.effectType))) {
                dispatch({ type: 'PLAY_CARD', cardId });
            }
        }
    };


    const handleGlobalBoardClick = () => {
        if (!state.selectedCardId || state.turnIndex !== myPlayerIndex) return;
        const card = myPlayer.hand.find(c => c.id === state.selectedCardId);
        // Allow Global Cards
        if (card && (['indians', 'gatling', 'damage_all', 'saloon', 'general_store', 'heal'].includes(card.effectType))) {
            dispatch({ type: 'PLAY_CARD', cardId: state.selectedCardId });
        }
    };

    const handleDeckClick = () => {
        if (!state.selectedCardId || state.turnIndex !== myPlayerIndex) return;
        const card = myPlayer.hand.find(c => c.id === state.selectedCardId);
        // Allow playing 'draw' cards (Stagecoach, Wells Fargo, General Store) by clicking the Deck
        if (card && (card.effectType === 'draw' || card.effectType === 'general_store' || card.effectType === 'store')) {
            dispatch({ type: 'PLAY_CARD', cardId: state.selectedCardId, targetId: myPlayer.id });
        }
    };




    // --- CHARACTER SELECTION PHASE ---
    if (state.currentPhase === 'select_character') {
        const pending = state.pendingCharacters?.[myPlayer.id];

        const handleSelectChar = (charName: string) => {
            dispatch({ type: 'CHOOSE_CHARACTER', playerId: myPlayer.id, characterName: charName });
        };

        // --- ROLE REVEAL INTERCEPT ---
        if (!roleRevealed) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-black relative overflow-hidden z-[200]">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-pulse-slow"></div>

                    <div className="z-10 flex flex-col items-center animate-fade-in-up">
                        <div className="text-amber-500 font-bold tracking-[0.5em] mb-8 text-sm uppercase">{t('role_card')}</div>

                        {/* ROLE CARD VISUAL - MATCHING CHARACTER SELECTION STYLE */}
                        <div className="relative w-[22.25rem] h-[34rem] bg-gray-900 rounded-xl shadow-2xl transition-all duration-500 group cursor-pointer ring-1 ring-black/20 hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] hover:-translate-y-2 overflow-hidden">

                            {/* Full Height Role Art */}
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={`/cards/role_${myPlayer.role.toLowerCase()}.png`}
                                    alt={myPlayer.role}
                                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out scale-100 group-hover:scale-110"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                {/* Fallback if image missing */}
                                <div className="hidden w-full h-full bg-[#1a1510] flex flex-col items-center justify-center p-6 border-4 border-amber-600/50">
                                    <div className="text-8xl mb-6 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse">
                                        {getRoleIcon(myPlayer.role)}
                                    </div>
                                </div>
                                {/* Gradient Overlay for Text Readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                            </div>

                            {/* Content (Z-Index above image) */}
                            <div className="relative z-10 h-full w-full flex flex-col justify-end pb-8">

                                {/* Name - Moves up on hover */}
                                <div className="px-5 transition-all duration-500 ease-out transform translate-y-0 group-hover:-translate-y-48">
                                    <h2 className="text-4xl font-black text-amber-100 uppercase tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] text-center font-serif">
                                        {t(`role_${myPlayer.role.toLowerCase()}`)}
                                    </h2>
                                    <div className="w-16 h-1 bg-amber-500/80 mx-auto mt-4 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                </div>

                                {/* Hover Content: Objective & Button */}
                                <div className="absolute left-0 right-0 bottom-0 px-6 pb-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex flex-col gap-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-12">

                                    {/* Objective */}
                                    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-amber-500/30 p-4 shadow-lg transform skew-x-[-2deg]">
                                        <p className="text-center text-amber-50 text-sm italic font-serif leading-relaxed transform skew-x-[2deg]">
                                            "{t(`role_${myPlayer.role.toLowerCase()}_goal`)}"
                                        </p>
                                    </div>

                                    {/* Accept Button */}
                                    <button
                                        onClick={() => setRoleRevealed(true)}
                                        className="w-full py-4 bg-gradient-to-r from-amber-700 to-yellow-600 bg-[length:200%_auto] animate-shimmer rounded font-bold hover:brightness-110 text-white text-lg tracking-[0.25em] uppercase shadow-[0_0_20px_rgba(245,158,11,0.4)] border-t border-amber-300/50 active:scale-95 transition-all"
                                    >
                                        {t('accept_mission')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Hint Text */}
                        <div className="mt-6 text-gray-500 text-sm uppercase tracking-widest animate-pulse group-hover:opacity-0 transition-opacity duration-300">
                            Hover to Reveal Mission
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full h-full flex flex-col items-center justify-start bg-gray-900 text-white relative overflow-y-auto overflow-x-hidden">
                {/* Background ambience */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

                <div className="z-10 flex flex-col items-center gap-8 md:gap-12 animate-fade-in my-auto py-10 w-full px-4">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 tracking-tighter drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]">
                            WANTED
                        </h1>
                        <p className="text-base md:text-xl text-amber-100/80 font-bold uppercase tracking-[0.5em] mt-2">Choose Your Legend</p>
                    </div>

                    {pending ? (
                        <div className="flex flex-wrap justify-center gap-6 md:gap-10 w-full max-w-[90rem]">
                            {pending.map((char) => (
                                <div
                                    key={char.name}
                                    onClick={() => handleSelectChar(char.name)}
                                    className="relative overflow-hidden w-72 h-[30rem] md:w-[22.25rem] md:h-[34rem] bg-gray-900 rounded-xl shadow-2xl transition-all duration-500 group cursor-pointer ring-1 ring-black/20 hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] hover:-translate-y-2 shrink-0"
                                >
                                    {/* Full Height Character Art - Idle: contain/cover to show borders. Hover: Scale up to remove borders. */}
                                    <div className="absolute inset-0 z-0">
                                        <img
                                            src={`/cards/${char.name.toLowerCase().replace(/ /g, '_')}.png`}
                                            alt={char.name}
                                            className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out scale-100 group-hover:scale-125"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                        <div className="hidden w-full h-full bg-gray-700 flex items-center justify-center text-6xl">👾</div>
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>
                                    </div>

                                    {/* Content (Z-Index above image) */}
                                    <div className="relative z-10 h-full w-full">
                                        {/* Name & HP - Absolute Positioned for perfect alignment */}
                                        <div className="absolute left-0 right-0 mx-auto px-5 transition-all duration-500 ease-out bottom-9 group-hover:bottom-56">
                                            <div className="text-center group-hover:mb-2">
                                                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] text-shadow-lg font-serif">{char.name}</h2>
                                                <div className="flex justify-center items-center gap-2 mt-2 opacity-100 transition-all duration-500">
                                                    <div className="flex gap-1 bg-black/40 px-2 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-lg group-hover:bg-black/60">
                                                        {Array.from({ length: 4 + char.hpMod }).map((_, i) => (
                                                            <div key={i} className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_8px_rgba(239,68,68,0.6)] border border-black/30" />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description & Button - Absolute Positioned */}
                                        <div className="absolute left-0 right-0 mx-auto px-5 bottom-8 space-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                                            <div className="bg-black/60 backdrop-blur-md rounded-lg border border-amber-500/20 p-4 shadow-xl transform skew-x-[-2deg]">
                                                <p className="text-sm text-amber-50 leading-relaxed italic text-center font-serif tracking-wide transform skew-x-[2deg] line-clamp-3">
                                                    "{t(char.abilityKey) || char.description}"
                                                </p>
                                            </div>

                                            <button className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 bg-[length:200%_auto] animate-shimmer rounded font-bold hover:brightness-110 text-white text-sm tracking-[0.25em] uppercase shadow-lg border-t border-amber-300/50 active:scale-95 transition-all">
                                                {t('select')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xl text-gray-400 animate-pulse">
                            {t('waiting_for_others')}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative bg-[#1a1a1a] flex items-center justify-center">
            {/* Poker Table Background (Shrunk to give room) */}
            <div
                className="absolute w-[95%] h-[50%] md:w-[80%] md:h-[60%] bg-[#0f0f0f] rounded-[50px] md:rounded-[150px] border-[6px] border-gray-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] z-0 top-[15%] md:top-[20%] cursor-crosshair active:scale-[0.99] transition-transform"
                onClick={handleGlobalBoardClick}
                onDragOver={handleDragOver}
                onDrop={handleDropOnTable}
            >
                <div className="w-full h-full rounded-[140px] border-2 border-purple-900/20 opacity-40 flex items-center justify-center pointer-events-none">
                    <div className="text-[8rem] font-bold text-gray-800/10 tracking-tighter select-none pointer-events-none transform -rotate-12">BANG!</div>
                </div>
            </div>

            {/* --- CENTER TABLE (Deck, Discard) - Adjusted to avoid overlaps --- */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-[80] transform scale-60 md:scale-100 transition-transform"
            >
                {/* SYSTEM STATUS & TURN CONTROLS */}
                <div className="mb-4 flex flex-col items-center gap-2 pointer-events-auto z-[70]">
                    {/* Status Pill */}
                    <div className="flex items-center gap-3 bg-[#1a1a1a]/90 backdrop-blur-md px-5 py-2 rounded-full border border-gray-700 shadow-xl">
                        <div className={`w-2.5 h-2.5 rounded-full ${state.turnIndex === myPlayerIndex ? 'bg-green-500 animate-pulse box-shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500'}`}></div>

                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase mb-0.5">CURRENT STATUS</span>
                            <span className="text-xs text-gray-200 font-bold tracking-wide uppercase">
                                {state.currentPhase === 'draw' ? 'DRAW PHASE' :
                                    state.currentPhase === 'play' ? 'PLAY PHASE' :
                                        state.currentPhase === 'discard' ? 'DISCARD PHASE' :
                                            state.turnIndex === myPlayerIndex ? 'YOUR TURN' :
                                                `WAITING FOR ${state.players[state.turnIndex]?.name.toUpperCase()}`}
                            </span>
                        </div>

                        {/* END TURN BUTTON (Only show if my turn and play phase) */}
                        {state.turnIndex === myPlayerIndex && state.currentPhase === 'play' && (
                            <button
                                onClick={() => dispatch({ type: 'END_TURN' })}
                                className="ml-2 px-3 py-1 bg-red-900/40 hover:bg-red-600 border border-red-700/50 hover:border-red-500 rounded text-[10px] font-bold text-red-200 hover:text-white transition-all uppercase tracking-wider"
                            >
                                End Turn
                            </button>
                        )}
                    </div>
                </div>

                {/* Top Row: Deck & Discard - Scaled down on mobile, full size on hover */}
                <div className="flex gap-4 md:gap-12 mb-8 pointer-events-auto relative z-[75] transform scale-75 origin-top md:scale-100 md:origin-center hover:scale-100 transition-transform duration-300 ease-out hover:z-[100]">
                    {/* Deck */}
                    <div
                        onClick={handleDeckClick}
                        className={`w-24 h-36 bg-[#2a1a10] rounded-lg border-2 border-[#5c3a20] shadow-2xl flex items-center justify-center relative group ${state.selectedCardId ? 'cursor-pointer hover:border-yellow-500' : ''}`}
                    >
                        <div className="absolute inset-2 border border-[#4a2e18] rounded bg-repeating-linear-gradient-45 from-transparent to-black/10"></div>
                        <span className="text-2xl opacity-20">🂠</span>
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black/80 px-2 rounded text-[10px] text-gray-400">DECK</div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/80 px-2 rounded text-[10px] text-gray-400">{state.deck.length}</div>

                        {/* Helper Text for Stagecoach */}
                        {state.selectedCardId && myPlayer.hand.find(c => c.id === state.selectedCardId)?.effectType === 'draw' && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 text-[10px] font-bold animate-bounce whitespace-nowrap bg-black/80 px-2 py-1 rounded z-50">
                                CLICK TO PLAY
                            </div>
                        )}
                    </div>

                    {/* DISCARD PILE - CLICK OPEN HISTORY */}
                    <div
                        className="relative w-24 h-36 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-white/5 cursor-pointer hover:border-gray-400 group/pile transition-colors z-[75]"
                        onClick={(e) => { e.stopPropagation(); setShowDiscardModal(true); }} // Explicit stopProp
                        onMouseEnter={() => state.discardPile.length > 0 && setHoveredDiscardCardId(state.discardPile[state.discardPile.length - 1].id)}
                        onMouseLeave={() => setHoveredDiscardCardId(null)}
                    >
                        <div className="absolute top-2 text-[10px] text-gray-500 font-bold tracking-widest">DISCARD</div>
                        {/* Discard Count Badge */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/80 px-2 rounded text-[10px] text-gray-400 border border-gray-800 z-10">{state.discardPile.length}</div>

                        {state.discardPile.length > 0 ? (
                            <motion.div
                                layoutId={`discard-${state.discardPile[state.discardPile.length - 1].id}`}
                                className="w-full h-full pointer-events-none"
                            >
                                <Card card={state.discardPile[state.discardPile.length - 1]} isSelected={false} className="w-full h-full p-1 shadow-md pointer-events-none" />
                            </motion.div>
                        ) : (
                            <div className="text-gray-700 text-[10px]">Empty</div>
                        )}
                    </div>
                </div>
            </div>



            {/* --- INSPECTORS (Overlays) --- */}

            {/* 1. DISCARD INSPECTOR */}
            <AnimatePresence>
                {showDiscardPile && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="absolute inset-0 z-[200] bg-black/60 flex flex-col items-center justify-start py-12 px-8 overflow-y-auto"
                        onClick={() => setShowDiscardPile(false)}
                    >
                        <h2 className="text-4xl font-black text-white mb-8 tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">Discard Pile ({state.discardPile.length})</h2>
                        <div className="flex flex-wrap justify-center gap-4 max-w-6xl">
                            {state.discardPile.slice().reverse().map((card, i) => (
                                <div key={card.id + i} className="w-32 h-44 hover:scale-110 transition-transform group/discard relative">
                                    <Card card={card} />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-black/95 border border-gray-600 p-2 rounded z-[300] opacity-0 group-hover/discard:opacity-100 transition-opacity pointer-events-none">
                                        <div className="font-bold text-gray-300 text-xs text-center">{card.name}</div>
                                        <div className="text-[10px] text-gray-400 italic text-center">{card.description || t(card.descKey)}</div>
                                    </div>
                                </div>
                            ))}
                            {state.discardPile.length === 0 && <div className="text-gray-500">Empty</div>}
                        </div>
                        <div className="mt-8 text-gray-400 text-sm animate-pulse">Click anywhere to close</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. OPPONENT PINNED INSPECTOR */}
            <AnimatePresence>
                {inspectedOpponentId && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="absolute top-0 right-0 h-full w-96 bg-[#0c0c0c] border-l border-gray-800 z-[150] shadow-2xl p-6 overflow-y-auto"
                    >
                        {(() => {
                            const opp = state.players.find(p => p.id === inspectedOpponentId);
                            if (!opp) return null;
                            return (
                                <div className="flex flex-col gap-6">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">{opp.name}</h2>
                                        <button onClick={() => setInspectedOpponentId(null)} className="text-gray-500 hover:text-white text-xl">✕</button>
                                    </div>

                                    {/* Role & Stats */}
                                    <div className="bg-gray-900 rounded-xl p-4 flex gap-4 items-center border border-gray-800">
                                        <div className="text-4xl">{getRoleIcon(opp.role)}</div>
                                        <div>
                                            <div className="text-gray-400 text-xs uppercase tracking-widest">Role</div>
                                            <div className="text-white font-bold">{opp.role === 'Sheriff' ? 'Sheriff' : 'Unknown'}</div>
                                            <div className="flex gap-1 mt-2">
                                                {Array.from({ length: opp.maxHp }).map((_, i) => (
                                                    <div key={i} className={`w-3 h-3 rounded-full ${i < opp.hp ? 'bg-red-500 shadow-[0_0_5px_currentColor]' : 'bg-gray-800'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Equipped Items */}
                                    <div>
                                        <h3 className="text-gray-500 text-xs uppercase tracking-widest mb-3 border-b border-gray-800 pb-1">Equipped</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {opp.table.map(card => (
                                                <div key={card.id} className="w-full aspect-[2/3]">
                                                    <Card card={card} />
                                                </div>
                                            ))}
                                            {opp.table.length === 0 && <div className="text-gray-600 text-sm italic col-span-2 text-center py-4">No equipment</div>}
                                        </div>
                                    </div>

                                    {/* Character Ability */}
                                    <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-900/50">
                                        <div className="text-blue-400 text-xs uppercase tracking-widest mb-1">Ability: {opp.character}</div>
                                        <p className="text-gray-300 text-sm italic leading-relaxed">"{t(getCharacterDescKey(opp.character)) || opp.character}"</p>
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>


            {/* TURN ANIMATION OVERLAY (Result Checks) */}
            <AnimatePresence>
                {drawAnim && showDraw && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <h2 className="text-3xl font-bold text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                {t('checking') || 'Drawing for'} {drawAnim.reason.toUpperCase()}...
                            </h2>
                            <div className="relative">
                                {/* The Card */}
                                <div className="transform scale-150">
                                    <div className="bg-[#1a0f0a] p-2 rounded-xl border-2 border-[#8B4513] shadow-2xl">
                                        <Card card={drawAnim.card} />
                                    </div>
                                </div>
                                {/* Stamped Result */}
                                <motion.div
                                    initial={{ scale: 2, opacity: 0, rotate: -15 }}
                                    animate={{ scale: 1, opacity: 1, rotate: -15 }}
                                    transition={{ delay: 0.5, type: 'spring' }}
                                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 rounded-xl px-8 py-2 text-6xl font-black uppercase tracking-tighter shadow-2xl backdrop-blur-none whitespace-nowrap ${drawAnim.success
                                        ? 'border-green-500 text-green-500 shadow-[0_0_50px_rgba(34,197,94,0.5)]'
                                        : 'border-red-600 text-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]'
                                        }`}
                                >
                                    {drawAnim.success ? (t('success') || 'PASSED') : (t('failed') || 'FAILED')}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Opponents Grid (Top Row) */}
            <div className="absolute top-2 md:top-6 left-0 right-0 flex justify-center gap-4 md:gap-16 px-4 z-[90] transform scale-60 origin-top md:scale-100 transition-transform">
                {opponents.map((opp) => (
                    <div
                        key={opp.id}
                        className={`pointer-events-auto relative group flex flex-col items-center justify-start bg-black/90 rounded-2xl border-2 p-3 w-40 min-h-[220px] transition-all hover:scale-110 hover:z-50 ${state.turnIndex === opp.position ? 'border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.6)] scale-105' : 'border-gray-800'
                            } ${state.selectedCardId ? 'cursor-crosshair hover:bg-red-900/40 ring-2 ring-red-500' : 'cursor-default hover:bg-gray-900 group-hover:border-gray-500'}`}
                        onClick={() => state.selectedCardId && handleOpponentClick(opp.id)}
                    >
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-600 mb-2 flex items-center justify-center text-3xl shadow-inner group-hover:border-white transition-colors relative overflow-hidden">
                            <img
                                src={`/cards/${opp.character.toLowerCase().replace(/ /g, '_')}.png`}
                                alt={opp.character}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                            <div className="hidden absolute">{opp.role === 'Sheriff' ? '⭐' : '👤'}</div>
                        </div>

                        {/* Name & HP */}
                        <div className="text-center w-full">
                            <div className="text-sm text-gray-200 truncate font-bold mb-1 tracking-wide group-hover:text-white">{opp.name}</div>
                            <div className="flex justify-center my-1 gap-1">
                                {Array.from({ length: opp.maxHp }).map((_, i) => (
                                    <div key={i} className={`w-2 h-4 rounded-sm ${i < opp.hp ? 'bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_5px_rgba(220,38,38,0.8)]' : 'bg-gray-800'}`} />
                                ))}
                            </div>
                        </div>

                        {/* Hand & Range Badges - LARGER & CLEARER */}
                        <div className="flex justify-between w-full text-xs text-gray-400 font-bold font-mono px-3 mt-2 bg-black/80 rounded py-1.5 border border-gray-800 shadow-sm">
                            <span className="flex items-center gap-1.5" title="Cards in Hand">🃏 <span className="text-white text-lg">{opp.hand.length}</span></span>
                            <span className="flex items-center gap-1.5" title="Distance / Range">⌖ <span className="text-cyan-400 text-lg">{opp.weaponRange}</span></span>
                        </div>

                        {/* Equipped Cards Row */}
                        {opp.table.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap justify-center w-full px-2">
                                {opp.table.map(card => (
                                    <div key={card.id} className="relative group/eq cursor-help">
                                        <div className={`w-8 h-10 rounded-sm border ${card.subType === 'Weapon' ? 'border-cyan-500 bg-cyan-900/40' : 'border-blue-500 bg-blue-900/40'} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                                            {card.subType === 'Weapon' ? '🔫' : '⚡'}
                                        </div>
                                        {/* OPPONENT EQUIP TOOLTIP - Added Description */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/eq:block bg-black/95 text-xs p-2 rounded border border-gray-600 z-[200] w-48 text-center pointer-events-none">
                                            <div className="font-bold text-gray-300 mb-1">{card.name}</div>
                                            <div className="text-[10px] text-gray-400 italic leading-tight">{card.description || t(card.descKey)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="text-[10px] text-purple-300 mt-1 font-bold uppercase tracking-widest">{opp.character}</div>

                        {/* Dead Overlay */}
                        {opp.isDead && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-red-600 font-bold rotate-12 border-4 border-red-600 rounded-xl z-20 text-3xl uppercase tracking-widest backdrop-blur-sm">DEAD</div>
                        )}

                        {/* DETAILED HOVER INFO (Replaces simple hint) */}
                        {!state.selectedCardId && (
                            <div className="absolute opacity-0 group-hover:opacity-100 top-full mt-4 w-56 bg-black/95 border border-gray-600 p-3 rounded-lg shadow-2xl transition-opacity pointer-events-none z-[1000] flex flex-col gap-2">
                                <div className="text-gray-400 text-[10px] uppercase font-bold border-b border-gray-800 pb-1 mb-1">Player Intel</div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Hand:</span>
                                    <span className="text-white font-mono">{opp.hand.length} cards</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">HP:</span>
                                    <span className="text-red-400 font-mono">{opp.hp}/{opp.maxHp}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Range:</span>
                                    <span className="text-cyan-400 font-mono">{opp.weaponRange}</span>
                                </div>
                                {/* Show Equipment Icons if any */}
                                {opp.table.length > 0 && (
                                    <div className="mt-2 border-t border-gray-800 pt-2">
                                        <div className="text-[10px] text-gray-500 mb-1">Equipment:</div>
                                        <div className="flex flex-wrap gap-1">
                                            {opp.table.map((c, i) => (
                                                <div key={i} className="px-1.5 py-0.5 bg-blue-900/40 border border-blue-500/30 rounded text-[9px] text-blue-300">
                                                    {c.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="mt-2 border-t border-gray-800 pt-1">
                                    <div className="text-purple-400 font-bold text-xs">{opp.character}</div>
                                    <div className="text-[10px] text-gray-400 italic leading-snug">
                                        {t(getCharacterDescKey(opp.character)) || opp.character}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* --- PLAYER DASHBOARD (Bottom Left) --- */}
            <div
                className="absolute bottom-2 left-2 md:bottom-6 md:left-6 z-[60] flex items-end gap-6 pointer-events-auto transform scale-75 origin-bottom-left md:scale-100 transition-transform"
                onDragOver={handleDragOver}
                onDrop={handleDropOnSelf}
            >
                {/* 1. Character & Equipment Grid (Single Row - 4 Slots) */}
                <div className="bg-[#151515] p-3 rounded-xl border border-gray-700 shadow-2xl flex flex-col gap-2 w-auto relative group">
                    {/* Gloss Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl"></div>

                    {/* Stats Header (Redesigned: Health Bars top, Range/View Compact) */}
                    <div className="flex justify-between items-center bg-black/40 px-4 py-2 rounded-lg border border-gray-800">
                        {/* ROLE ICON WITH HOVER TOOLTIP */}
                        <div className="flex items-center gap-4 group/role relative cursor-help">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{getRoleIcon(myPlayer.role)}</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">ROLE</span>
                                    <span className="text-xs font-bold text-white uppercase leading-none mt-1">{t(`role_${myPlayer.role.toLowerCase()}`) || myPlayer.role}</span>
                                </div>
                            </div>

                            {/* ROLE TOOLTIP - Positioned higher to clear bounds */}
                            <div className="absolute bottom-full left-0 mb-4 w-64 bg-black/95 border border-yellow-600/50 p-4 rounded-lg shadow-2xl opacity-0 group-hover/role:opacity-100 transition-opacity pointer-events-none z-[1000] ring-1 ring-yellow-500/20">
                                <h4 className="text-yellow-500 font-bold text-sm uppercase mb-1 flex items-center gap-2">
                                    <span>{myPlayer.role}</span>
                                    <span className="text-[10px] bg-yellow-900/40 px-1 rounded text-yellow-200/70 border border-yellow-700/30">Objective</span>
                                </h4>
                                <p className="text-xs text-gray-300 leading-relaxed border-t border-gray-800 pt-2 mt-1">
                                    {myPlayer.role === 'Sheriff' ? "Eliminate all Outlaws and the Renegade to restore order." :
                                        myPlayer.role === 'Outlaw' ? "Kill the Sheriff to break the law." :
                                            myPlayer.role === 'Renegade' ? "Be the last character standing. Kill the Sheriff last." :
                                                "Protect the Sheriff at all costs."}
                                </p>
                            </div>

                            <div className="h-6 w-[1px] bg-gray-700 ml-2"></div>
                            {/* Health Bars */}
                            <div className="flex flex-col">
                                <span className="text-[8px] text-red-500 uppercase font-bold">Health</span>
                                <div className="flex gap-[2px] mt-1">
                                    {Array.from({ length: myPlayer.maxHp }).map((_, i) => (
                                        <div key={i} className={`w-3 h-5 rounded-sm ${i < myPlayer.hp ? 'bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_8px_rgba(220,38,38,0.6)]' : 'bg-gray-800'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>



                        {/* Range / View - LARGER ICONS */}
                        {/* Range / View - REDUCED SIZE (Matching Health Label) */}
                        <div className="flex gap-6 text-xs font-mono font-bold text-gray-400 ml-4">
                            <span className="flex flex-col items-center gap-0.5"><span className="text-[10px] text-cyan-500 uppercase tracking-widest">Range</span> <span className="text-white text-lg drop-shadow-md">⌖ {myPlayer.weaponRange}</span></span>
                            <span className="flex flex-col items-center gap-0.5"><span className="text-[10px] text-purple-500 uppercase tracking-widest">View</span> <span className="text-white text-lg drop-shadow-md">👁 {1 + (myPlayer.viewDistance || 0)}</span></span>
                        </div>
                    </div>

                    {/* The 4 Slots: Player, Weapon, Gear 1, Gear 2 */}
                    <div className="flex gap-2">

                        {/* SLOT 1: PLAYER CHARACTER (Vertical Card) */}
                        <div className="w-32 h-48 bg-gray-800 rounded border-2 border-purple-500/50 flex flex-col relative shrink-0 overflow-visible hover:scale-105 transition-transform duration-300 group/char hover:border-purple-500 shadow-lg cursor-help bg-[url('/assets/card-back.png')] bg-cover z-10 hover:z-50">
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 rounded z-20"></div>
                            <img
                                src={`/cards/${myPlayer.character.toLowerCase().replace(/ /g, '_')}.png`}
                                alt={myPlayer.character}
                                className="absolute inset-0 w-full h-full object-cover rounded z-0"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                            <div className="hidden flex-1 flex items-center justify-center text-5xl relative z-10">
                                🤠
                            </div>
                            <div className="bg-black/90 p-2 text-center border-t border-purple-500/30 relative z-30 rounded-b mt-auto w-full">
                                <div className="text-purple-400 font-bold text-[10px] truncate uppercase tracking-wider">{myPlayer.character}</div>
                            </div>

                            {/* Character Tooltip (Redesigned & Fixed Clipping) */}
                            <div className="absolute bottom-full left-0 mb-4 w-72 bg-black/95 border border-purple-500 p-4 rounded-lg text-left shadow-[0_0_30px_rgba(168,85,247,0.4)] opacity-0 group-hover/char:opacity-100 transition-opacity pointer-events-none z-[1000]">
                                <div className="flex justify-start items-baseline gap-2 mb-2 border-b border-purple-500/30 pb-2">
                                    <span className="text-purple-400 font-bold text-sm uppercase">{myPlayer.character}</span>
                                    <span className="text-[10px] text-gray-500 font-mono">ABILITY</span>
                                </div>
                                <div className="text-xs text-gray-200 italic leading-relaxed font-medium">
                                    "{t(getCharDescriptionKey(myPlayer.character))}"
                                </div>
                            </div>
                        </div>

                        {/* SLOT 2: WEAPON */}
                        <div onClick={() => handleSlotClick('Weapon')} className="w-32 h-48 bg-black/60 rounded border-2 border-dashed border-gray-700 flex items-center justify-center relative hover:border-gray-500 transition-colors group/slot cursor-pointer">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#151515] px-2 text-[8px] text-gray-500 uppercase font-bold tracking-widest z-10 border border-gray-800 rounded">Weapon</div>
                            {myPlayer.table.find(c => c.subType === 'Weapon') ? (
                                <div className="absolute inset-0 group/weapon relative flex items-center justify-center p-1">
                                    <Card card={myPlayer.table.find(c => c.subType === 'Weapon')!} isSelected={false} className="w-full h-full shadow-md" disableHover={true} />
                                    {/* Weapon Tooltip */}
                                    <div className="absolute bottom-full mb-2 -left-12 w-48 bg-black/95 border border-gray-600 p-2 rounded z-[100] opacity-0 group-hover/weapon:opacity-100 transition-opacity pointer-events-none">
                                        <div className="font-bold text-gray-300 text-xs">{myPlayer.table.find(c => c.subType === 'Weapon')!.name}</div>
                                        <div className="text-[10px] text-gray-400 italic">{myPlayer.table.find(c => c.subType === 'Weapon')!.description || t(myPlayer.table.find(c => c.subType === 'Weapon')!.descKey)}</div>
                                    </div>
                                </div>
                            ) : <span className="text-3xl opacity-20 group-hover/slot:opacity-40 transition-opacity">🔫</span>}
                        </div>

                        {/* SLOT 3 & 4: GEAR */}
                        {[0, 1].map(i => {
                            const equip = myPlayer.table.filter(c => c.subType !== 'Weapon')[i];
                            return (
                                <div key={i} onClick={() => handleSlotClick('Gear')} className="w-32 h-48 bg-black/60 rounded border-2 border-dashed border-gray-700 flex items-center justify-center relative hover:border-blue-500/30 transition-colors group/slot cursor-pointer">
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#151515] px-2 text-[8px] text-gray-500 uppercase font-bold tracking-widest z-10 border border-gray-800 rounded">Gear {i + 1}</div>
                                    {equip ? (
                                        <div className="absolute inset-0 group/gear relative flex items-center justify-center p-1">
                                            <Card card={equip} isSelected={false} className="w-full h-full shadow-md" disableHover={true} />
                                            <div className="absolute bottom-full mb-2 -left-12 w-48 bg-black/95 border border-gray-600 p-2 rounded z-[100] opacity-0 group-hover/gear:opacity-100 transition-opacity pointer-events-none">
                                                <div className="font-bold text-gray-300 text-xs">{equip.name}</div>
                                                <div className="text-[10px] text-gray-400 italic">{equip.description || t(equip.descKey)}</div>
                                            </div>
                                        </div>
                                    ) : <span className="text-3xl opacity-20 group-hover/slot:opacity-40 transition-opacity">🛡️</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. HAND CARDS (Fan - "Pop Up" Style - SMOOTH STRAIGHTEN) */}
                <div className="absolute bottom-0 left-0 right-0 h-[300px] md:h-auto md:relative md:h-[600px] flex items-end w-full pointer-events-none z-[100]">
                    {/* DYNAMIC SPACING Hand Container */}
                    {(() => {
                        const count = myPlayer.hand.length;
                        // COMPRESSED SPACING LOGIC: Higher negative spacing = More Overlap
                        let spacing = "-space-x-20";
                        if (count > 12) spacing = "-space-x-32";
                        else if (count > 9) spacing = "-space-x-28";
                        else if (count > 6) spacing = "-space-x-24";

                        return (
                            <div className={`flex ${spacing} items-end px-12 pb-8 pt-60 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pointer-events-auto transition-all duration-300`}>
                                {myPlayer.hand.map((card, i) => (
                                    <motion.div
                                        key={card.id}
                                        layoutId={card.id}
                                        // Framer Motion handles the rotation state
                                        initial={false}
                                        animate={{
                                            rotate: (i - (myPlayer.hand.length - 1) / 2) * 5,
                                            y: state.selectedCardId === card.id ? -50 : 0,
                                            scale: state.selectedCardId === card.id ? 1.1 : 1,
                                            zIndex: state.selectedCardId === card.id ? 50 : i
                                        }}
                                        whileHover={{
                                            rotate: 0,
                                            y: -50,
                                            scale: 1.15,
                                            zIndex: 100,
                                            transition: { duration: 0.3, ease: "easeOut" } // "Media lenta" transition
                                        }}
                                        className={`relative w-36 h-52 origin-bottom cursor-grab active:cursor-grabbing shadow-2xl group/card`}
                                        // Removed inline styles and conflicting hover classes
                                        onClick={() => handleCardClick(card.id)}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e as any, card.id)}
                                        onMouseEnter={() => setHoveredHandCardId(card.id)}
                                        onMouseLeave={() => setHoveredHandCardId(null)}
                                        style={{ transformStyle: 'preserve-3d' }} // Helps with rendering crispness
                                    >
                                        <Card card={card} isSelected={state.selectedCardId === card.id} />
                                    </motion.div>
                                ))}
                                {
                                    myPlayer.hand.length === 0 && (
                                        <div className="text-gray-600 italic text-xl p-8 animate-pulse self-center">Your hand is empty...</div>
                                    )
                                }
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* DISCARD HISTORY MODAL - FULL SCREEN BLUR & FLOAT */}
            <AnimatePresence>
                {showDiscardModal && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="fixed inset-0 z-[9000] flex flex-col p-10 bg-black/40 backdrop-blur-md"
                        onClick={() => setShowDiscardModal(false)}
                    >
                        {/* Floating Header */}
                        <div className="w-full flex justify-between items-end mb-8 max-w-[1600px] mx-auto border-b border-gray-700/30 pb-4" onClick={e => e.stopPropagation()}>
                            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500 uppercase tracking-tighter drop-shadow-xl">
                                Graveyard <span className="text-3xl text-gray-600 align-top ml-2">{state.discardPile.length}</span>
                            </h2>
                            <button onClick={() => setShowDiscardModal(false)} className="text-gray-400 hover:text-white text-3xl transition-transform hover:scale-110 active:scale-95">✕</button>
                        </div>

                        {/* Full Screen Grid - Scrollable */}
                        <div className="flex-1 w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                            <div className="flex flex-wrap justify-center gap-8 max-w-[1600px] mx-auto pb-20 pt-10" onClick={e => e.stopPropagation()}>
                                {[...state.discardPile].reverse().map((card, idx) => (
                                    <div
                                        key={`${card.id}_hist_${idx}`}
                                        className="relative group w-36 h-56 perspective-1000 z-0 hover:z-50"
                                        onMouseEnter={() => setHoveredDiscardCardId(card.id)}
                                        onMouseLeave={() => setHoveredDiscardCardId(null)}
                                    >
                                        <div className="w-full h-full transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300 shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                                            <Card card={card} isSelected={false} className="w-full h-full" />
                                        </div>
                                    </div>
                                ))}
                                {state.discardPile.length === 0 && <div className="w-full text-center text-gray-500 italic text-2xl font-light mt-20">The graveyard is empty...</div>}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* FIXED HAND CARD & DISCARD TOOLTIP - Sidebar Position */}
            <AnimatePresence>
                {(hoveredHandCardId || hoveredDiscardCardId) && (() => {
                    const targetId = hoveredHandCardId || hoveredDiscardCardId;
                    const card = myPlayer.hand.find(c => c.id === targetId) || state.discardPile.find(c => c.id === targetId);

                    if (!card) return null;

                    return (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="fixed bottom-10 right-10 z-[10000] w-80 bg-[#0e0e0e]/95 border border-gray-800 p-6 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                        >
                            <div className="flex justify-between items-start mb-4 pb-2 border-b border-gray-800">
                                <h3 className="text-cyan-400 font-black text-xl uppercase tracking-wider">{card.name}</h3>
                                <div className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono uppercase">{card.type}</div>
                            </div>

                            <div className="flex gap-4 items-center mb-4">
                                <div className="text-sm text-gray-300 leading-relaxed font-light font-mono">
                                    {card.description || t(card.descKey)}
                                </div>
                            </div>

                            {/* Suit/Value Badge */}
                            <div className="flex justify-end mt-2">
                                <div className="text-xs text-gray-500 font-mono">
                                    {card.value === 11 ? 'J' : card.value === 12 ? 'Q' : card.value === 13 ? 'K' : card.value === 14 ? 'A' : card.value}
                                    <span className={`ml-1 ${['hearts', 'diamonds'].includes(card.suit) ? 'text-red-500' : 'text-gray-400'}`}>
                                        {card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'spades' ? '♠' : '♣'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* Drop Zone hint */}
            {state.selectedCardId && (
                <div className="absolute inset-0 pointer-events-none border-[12px] border-cyan-500/20 z-50 animate-pulse flex items-center justify-center">
                    <div className="bg-black/80 px-8 py-4 rounded-2xl text-cyan-400 font-bold text-2xl backdrop-blur">
                        SELECT TARGET
                    </div>
                </div>
            )}
            {/* GENERAL STORE OVERLAY */}
            {state.currentPhase === 'general_store' && state.generalStoreCards && (
                <div className="absolute inset-0 bg-black/80 z-[2000] flex flex-col items-center justify-center p-8">
                    <div className="text-4xl text-yellow-500 font-bold mb-8 animate-pulse text-center">
                        GENERAL STORE OPEN
                        <div className="text-xl text-gray-400 mt-2 font-normal">
                            {state.generalStoreTurnIndex === myPlayerIndex ? "YOUR TURN TO PICK!" : `Waiting for ${state.players[state.generalStoreTurnIndex || 0].name}...`}
                        </div>
                    </div>
                    <div className="flex gap-6 flex-wrap justify-center">
                        {state.generalStoreCards.map(card => (
                            <div
                                key={card.id}
                                onClick={() => {
                                    if (state.generalStoreTurnIndex === myPlayerIndex) {
                                        dispatch({ type: 'DRAFT_CARD', cardId: card.id });
                                    }
                                }}
                                className={`relative group transform transition-all duration-300 ${state.generalStoreTurnIndex === myPlayerIndex ? 'hover:scale-110 cursor-pointer hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]' : 'opacity-50 grayscale'}`}
                            >
                                <Card card={card} isSelected={false} className="w-48 h-72" />

                                {/* TOOLTIP */}
                                <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-56 bg-black/95 border border-yellow-600/50 p-3 rounded-lg z-[2100] hidden group-hover:block pointer-events-none shadow-2xl">
                                    <div className="text-yellow-500 font-bold border-b border-gray-700 pb-1 mb-1 text-center">{card.name}</div>
                                    <div className="text-gray-300 text-xs italic text-center leading-relaxed">{card.description || t(card.descKey)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};
