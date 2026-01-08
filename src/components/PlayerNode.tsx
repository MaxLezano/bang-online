import React from 'react';
import { Player } from '../types';
import { clsx } from 'clsx';
import { useGame } from '../GameContext';
import { motion } from 'framer-motion';

interface PlayerNodeProps {
    player: Player;
    isCurrentTurn: boolean;
    angle: number;
}

export const PlayerNode: React.FC<PlayerNodeProps> = ({ player, isCurrentTurn, angle }) => {
    const { state, dispatch } = useGame();

    // Is this the "local" player? (In this prototype, we assume Player 0 is the local user)
    const isLocalPlayer = player.id === 'player-0';

    // Calculate position logic for click targeting
    const handleClick = () => {
        if (state.selectedCardId && !isLocalPlayer) {
            // Attempt to play selected card on this player
            dispatch({ type: 'PLAY_CARD', cardId: state.selectedCardId, targetId: player.id });
        }
    };

    const getRoleColor = () => {
        // Only show role colors for Admin or for everyone if game over (simplified)
        if (isLocalPlayer) return 'text-white'; // Local always known
        return 'text-gray-400'; // Hidden
    };

    return (
        <motion.div
            className={clsx(
                "absolute w-32 h-32 -ml-16 -mt-16 flex flex-col items-center justify-center rounded-full border-2 bg-black/80 backdrop-blur-md transition-all duration-300",
                isCurrentTurn ? "border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] z-20" : "border-gray-700 z-10",
                player.isDead ? "opacity-30 grayscale" : "opacity-100",
                state.selectedCardId && !isLocalPlayer && !player.isDead ? "cursor-crosshair hover:border-red-500 hover:shadow-[0_0_15px_red]" : "cursor-default"
            )}
            style={{
                transform: `rotate(${angle}deg) translate(280px) rotate(-${angle}deg)` // Circular positioning logic
            }}
            onClick={handleClick}
        >
            <div className="font-bold text-lg mb-1">{player.name}</div>
            <div className={clsx("text-xs uppercase tracking-widest mb-2", getRoleColor())}>
                {isLocalPlayer || player.isDead ? player.role : '???'}
            </div>

            {/* HP Bar */}
            <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <div
                    className={clsx("h-full transition-all duration-500",
                        player.hp > 2 ? "bg-green-500 shadow-[0_0_8px_lime]" : "bg-red-500 shadow-[0_0_8px_red]"
                    )}
                    style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                />
            </div>
            <div className="text-xs mt-1 text-gray-400">{player.hp} / {player.maxHp} HP</div>

            {player.weaponRange > 1 && (
                <div className="absolute -top-2 -right-2 bg-yellow-900 border border-yellow-500 text-yellow-500 text-[10px] px-1 rounded">
                    Rnge +{player.weaponRange - 1}
                </div>
            )}
        </motion.div>
    );
};
