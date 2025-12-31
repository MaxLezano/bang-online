import React from 'react';
import { useGame } from '../GameContext';
import { useTranslation } from 'react-i18next';

export const GameStats: React.FC = () => {
    const { state, dispatch } = useGame();
    const { t } = useTranslation();

    const deckCount = state.deck.length;
    const discardCount = state.discardPile.length;

    // Get top of discard if available
    const topDiscard = state.discardPile[state.discardPile.length - 1];

    // Helper to get my player
    const myPlayerIndex = 0;
    const myPlayer = state.players[myPlayerIndex];

    return (
        <div className="h-full bg-black/80 border-l border-gray-800 flex flex-col p-4 animate-fade-in relative z-50">
            <h2 className="text-xl font-bold text-yellow-500 mb-4 tracking-widest border-b border-yellow-900/50 pb-2">
                {t('stats')}
            </h2>

            <div className="space-y-6 flex flex-col h-full">
                {/* DECK */}
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-cyan-400 font-bold mb-2">{t('deck')}</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">{t('remaining')}</span>
                        <span className="text-xl font-mono text-cyan-300">{deckCount}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 mt-2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-cyan-600"
                            style={{ width: `${Math.min(100, (deckCount / 60) * 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* DISCARD */}
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-purple-400 font-bold mb-2">{t('discard')}</h3>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Total</span>
                        <span className="text-xl font-mono text-purple-300">{discardCount}</span>
                    </div>

                    {topDiscard ? (
                        <div className="mt-2 text-center group/discard relative cursor-help">
                            <div className="text-xs text-gray-500 mb-1">{t('last_card')}</div>
                            <div className="inline-block px-3 py-2 border border-purple-500 rounded text-purple-300 font-bold text-sm bg-purple-900/10">
                                {t(topDiscard.nameKey)}
                            </div>

                            {/* Discard Description Tooltip - Shows to the Left */}
                            <div className="absolute right-full -top-2 mr-3 w-48 bg-black/95 border border-purple-500 p-3 rounded-lg text-left shadow-[0_0_20px_rgba(168,85,247,0.3)] opacity-0 group-hover/discard:opacity-100 transition-opacity pointer-events-none z-[100]">
                                <div className="text-purple-400 font-bold text-xs uppercase mb-1 border-b border-purple-500/30 pb-1">{topDiscard.name}</div>
                                <div className="text-[10px] text-gray-300 leading-relaxed">
                                    {t(topDiscard.descKey) || topDiscard.description}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-600 text-center italic">{t('empty_slot')}</div>
                    )}
                </div>

                {/* SYSTEM STATUS (Moved from Board) */}
                <div className="mt-auto pt-4 border-t border-gray-800">
                    <div className="bg-[#151515] p-4 rounded-xl border border-gray-700 shadow-inner">
                        <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
                            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">System Status</span>
                            <div className={`w-2 h-2 rounded-full ${state.turnIndex === myPlayerIndex ? 'bg-cyan-400 animate-pulse' : 'bg-yellow-600'}`}></div>
                        </div>

                        {state.turnIndex === myPlayerIndex ? (
                            <div className="flex flex-col gap-3">
                                <div className="text-center">
                                    <div className="text-xs text-gray-500 uppercase">Current Phase</div>
                                    <div className="text-xl font-black text-white uppercase tracking-wider">
                                        {state.currentPhase === 'discard' ? t('discard_phase') : t('your_turn')}
                                    </div>
                                </div>

                                {/* End Turn Button */}
                                {state.currentPhase === 'play' && (
                                    <button
                                        onClick={() => dispatch({ type: 'END_TURN' })}
                                        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all uppercase text-xs tracking-widest hover:scale-105 active:scale-95"
                                    >
                                        {t('end_turn')}
                                    </button>
                                )}

                                {/* Discard Hint */}
                                {state.currentPhase === 'discard' && (
                                    <div className="p-2 bg-red-900/20 border border-red-900/50 rounded text-center">
                                        <div className="text-red-400 text-xs font-bold animate-pulse">
                                            {t('force_discard', { count: (myPlayer?.hand?.length || 0) - (myPlayer?.hp || 0) })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-2">
                                <div className="text-xs text-yellow-500 font-mono uppercase animate-pulse mb-1">Waiting for Signal...</div>
                                <div className="text-sm font-bold text-gray-300 truncate">
                                    {state.players[state.turnIndex]?.name || "Unknown"}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
