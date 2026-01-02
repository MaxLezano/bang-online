import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { GameSettings } from '../types';

interface LobbyScreenProps {
    onStartGame: (settings: GameSettings) => void;
    onBack: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ onStartGame, onBack }) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'MAIN' | 'CREATE' | 'JOIN'>('MAIN');
    const [name, setName] = useState('');

    // Lobby State
    const MAX_PLAYERS = 7;
    // Participants list: Index 0 is always 'ME'. Others are 'BOT' (or real players in future).
    const [participants, setParticipants] = useState<('ME' | 'BOT')[]>(['ME']);
    const [roomCode, setRoomCode] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (view === 'CREATE') {
            // Generate random 6-char code
            setRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
            // Reset participants
            setParticipants(['ME']);
        }
    }, [view]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const addBot = () => {
        if (participants.length < MAX_PLAYERS) {
            setParticipants([...participants, 'BOT']);
        }
    };

    const removeBot = (index: number) => {
        // Can't remove self (index 0)
        if (index === 0) return;
        const newParticipants = [...participants];
        newParticipants.splice(index, 1);
        setParticipants(newParticipants);
    };

    const handleStart = () => {
        if (!name.trim()) return;

        const activeCount = participants.length;
        if (activeCount < 3) return;

        const botCount = participants.filter(p => p === 'BOT').length;

        onStartGame({
            playerName: name,
            mode: 'SINGLE',
            playerCount: activeCount,
            botCount: botCount
        });
    };

    const activeParticipants = participants.length;
    const canStart = activeParticipants >= 3;
    // const slotsRemaining = MAX_PLAYERS - activeParticipants; // Removed unused

    if (view === 'MAIN') {
        return (
            <div className="flex flex-col items-center gap-6 w-full max-w-md animate-fade-in">
                <div className="w-full">
                    <label className="block text-amber-500/80 text-sm mb-2 tracking-widest uppercase font-bold">{t('enter_name')}</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/60 border-2 border-amber-700/50 rounded-sm px-4 py-4 text-amber-100 placeholder-amber-900/50 focus:outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all font-serif tracking-wider text-lg"
                        placeholder="Django"
                    />
                </div>

                <div className="flex gap-4 w-full">
                    <button
                        onClick={() => setView('JOIN')}
                        disabled={!name.trim()}
                        className="flex-1 py-4 rounded-sm bg-gray-900/80 border border-amber-800/50 hover:border-amber-500 text-amber-500 hover:text-amber-200 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                        {t('join_lobby')}
                    </button>
                    <button
                        onClick={() => setView('CREATE')}
                        disabled={!name.trim()}
                        className="flex-1 py-4 rounded-sm bg-gradient-to-r from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 border border-amber-400/50 text-white font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider hover:scale-105 active:scale-95"
                    >
                        {t('create_lobby')}
                    </button>
                </div>

                <button onClick={onBack} className="text-amber-700 hover:text-amber-500 text-sm mt-4 uppercase tracking-widest font-bold">
                    {t('back')}
                </button>
            </div>
        );
    }

    if (view === 'CREATE') {
        return (
            <div className="flex flex-col gap-6 w-full max-w-xl animate-fade-in bg-black/90 p-8 rounded-sm border-2 border-amber-900/50 backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <div className="flex justify-between items-center mb-4 border-b border-amber-800/30 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-amber-100 uppercase tracking-widest">{t('waiting_room')}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-amber-600 font-bold">{t('room_code')}:</span>
                            <div className="flex items-center gap-2 bg-amber-900/20 px-2 rounded border border-amber-700/50">
                                <span className="text-lg font-mono font-bold text-amber-400 tracking-widest">
                                    {roomCode}
                                </span>
                                <button
                                    onClick={handleCopyCode}
                                    className="p-1 hover:bg-amber-500/20 rounded transition-colors text-amber-600 hover:text-amber-300 relative group"
                                    title={t('copy_code')}
                                >
                                    {copied ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                        </svg>
                                    )}
                                    {/* Tooltip-ish feedback */}
                                    {copied && (
                                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-100 transition-opacity whitespace-nowrap">
                                            {t('copied')}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-amber-500/60 font-bold uppercase tracking-wide">Total: {activeParticipants} / {MAX_PLAYERS}</span>
                    </div>
                </div>

                {/* Participants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                    {participants.map((type, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-4 rounded-sm border-2 transition-all ${type === 'ME'
                                ? 'border-amber-500/50 bg-amber-900/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                : 'border-stone-600/50 bg-stone-900/40 opacity-80'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center relative overflow-hidden ring-2 ring-white/10">
                                    {/* Character Art */}
                                    <img
                                        src={`/cards/${type === 'ME' ? 'player' : 'bot'}.png`}
                                        alt={type === 'ME' ? 'Player' : 'Bot'}
                                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                    <div className="hidden absolute font-bold text-lg text-amber-200">{type === 'ME' ? 'ME' : 'B'}</div>
                                </div>
                                <div>
                                    <div className={`font-bold uppercase tracking-wider ${type === 'ME' ? 'text-amber-400' : 'text-stone-400'
                                        }`}>
                                        {type === 'ME' ? name : t('bot_unit')}
                                    </div>
                                    <div className="text-xs text-stone-500 font-serif italic">
                                        {type === 'ME' ? t('role_admin') : t('ai_controlled')}
                                    </div>
                                </div>
                            </div>

                            {/* Remove Button for Bots */}
                            {type !== 'ME' && (
                                <button
                                    onClick={() => removeBot(index)}
                                    className="p-2 rounded-full text-red-500 hover:bg-red-900/20 transition-colors"
                                    title={t('remove_bot')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Single Add Bot Button */}
                <button
                    onClick={addBot}
                    disabled={activeParticipants >= MAX_PLAYERS}
                    className={`w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-all ${activeParticipants >= MAX_PLAYERS
                        ? 'border-gray-800 text-gray-700 cursor-not-allowed'
                        : 'border-amber-900/30 text-amber-700 hover:border-amber-500 hover:text-amber-400 hover:bg-amber-900/10'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {t('add_bot')} {activeParticipants >= MAX_PLAYERS && '(Max)'}
                </button>

                <div className="mt-4 border-t border-amber-800/30 pt-4">
                    {!canStart && (
                        <p className="text-center text-white/80 text-sm mb-2 animate-pulse font-serif tracking-wide">
                            {t('needs_3_players')} ({activeParticipants}/3)
                        </p>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={() => setView('MAIN')}
                            className="flex-1 py-3 rounded-sm bg-transparent border border-amber-800/50 text-amber-700 hover:text-amber-400 hover:border-amber-500 transition-colors uppercase font-bold tracking-wider"
                        >
                            {t('back')}
                        </button>
                        <button
                            onClick={handleStart}
                            disabled={!canStart}
                            className={`flex-[2] py-3 rounded-sm font-bold shadow-lg transition-all transform uppercase tracking-widest ${canStart
                                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                                : 'bg-stone-900/40 text-stone-600 cursor-not-allowed border border-stone-800'
                                }`}
                        >
                            {t('start_match')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Placeholder for Join functionality
    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-md animate-fade-in text-center p-8">
            <h2 className="text-xl text-gray-300">Searching for lobbies...</h2>
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <button
                onClick={() => setView('MAIN')}
                className="mt-4 text-gray-500 hover:text-gray-300"
            >
                {t('back')}
            </button>
        </div>
    );
}
