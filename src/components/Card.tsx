import React from 'react';
import { Card as CardType } from '../types';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface CardProps {
    card: CardType;
    isSelected?: boolean;
    onClick?: () => void;
    className?: string;
    disableHover?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, isSelected, onClick, className, disableHover }) => {
    const [imageError, setImageError] = React.useState(false);

    const getBorderColor = () => {
        // Blue: Equipment (Weapons, Mustangs, Scopes, Barrels, Jail, Dynamite)
        // In Bang!, blue border = played in front of you.
        if (card.type === 'Equipment' || card.type === 'Status') return 'border-blue-500 shadow-blue-500/50';

        // Brown: Action Cards (Bang!, Missed!, Beer, Panic, Cat Balou, etc)
        // In Bang!, brown border = play and discard.
        // We generally default to Brown unless it's Equipment.
        return 'border-[#8B4513] shadow-[#8B4513]/50';
    };

    const getImagePath = () => {
        // Logic: card_bang_name -> bang.png
        const cleanName = card.nameKey.replace('card_', '').replace('_name', '');
        return `/cards/${cleanName}.png`;
    };

    return (
        <motion.div
            whileHover={disableHover ? undefined : { scale: 1.05, y: -5 }}
            whileTap={disableHover ? undefined : { scale: 0.95 }}
            onClick={onClick}
            className={clsx(
                "relative rounded-xl p-1 flex flex-col justify-between cursor-pointer transition-all duration-300 backdrop-blur-md bg-black/90 text-white overflow-hidden",
                className || "w-32 h-48",
                isSelected
                    ? 'border-4 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.6)] scale-110 z-20'
                    : `border-2 ${getBorderColor()} opacity-95 hover:opacity-100 hover:border-gray-400`
            )}
        >
            {/* Header: Name Only */}
            <div className="flex justify-center items-center border-b border-white/20 pb-1 mb-1 z-10 relative bg-black/50 rounded-t pt-1">
                <div className="text-center font-bold text-sm leading-tight drop-shadow-md break-words w-full px-1">
                    {card.name}
                </div>
            </div>

            {/* Content: Image or Fallback Icon */}
            <div className="flex flex-col items-center justify-center flex-grow relative w-full h-full overflow-hidden rounded my-1">
                {!imageError ? (
                    <img
                        src={getImagePath()}
                        alt={card.name}
                        onError={() => setImageError(true)}
                        className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="text-2xs uppercase tracking-widest opacity-60 mb-1">{card.subType}</div>
                        <div className="text-4xl opacity-80 animate-pulse">
                            {card.effectType === 'bang' && '💥'}
                            {card.effectType === 'missed' && '🛡️'}
                            {card.effectType === 'heal' && '🍺'}
                            {card.effectType === 'barrel' && '🛢️'}
                            {card.effectType === 'jail' && '⛓️'}
                            {card.effectType === 'dynamite' && '🧨'}
                            {card.subType === 'Weapon' && '🔫'}
                            {card.effectType === 'draw' && '🃏'}
                            {card.effectType === 'discard' && '🗑️'}
                            {card.effectType === 'store' && '🏪'}
                            {card.effectType === 'general_store' && '🏪'}
                            {card.effectType === 'duel' && '⚔️'}
                            {card.effectType === 'indians' && '🏹'}
                            {card.effectType === 'damage_all' && '🌪️'} {/* Gatling */}
                            {card.effectType === 'saloon' && '🍻'}
                            {card.effectType === 'steal' && '😨'} {/* Panic */}
                            {card.effectType === 'discard' && '😼'} {/* Cat Balou */}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer: Description */}
            <div className="border-t border-white/20 pt-1 mt-1 z-10 relative bg-black/60 rounded-b pb-1">
                <div className="flex justify-center gap-2 text-xs font-mono mb-1">
                    {card.range && <span className="text-cyan-400">⌖{card.range}</span>}
                    {card.type === 'Equipment' && <span className="text-blue-400">⚡</span>}
                    {card.type === 'Status' && <span className="text-red-400">⚠️</span>}
                    <span className={card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-gray-400'}>
                        {card.suit === 'hearts' && '♥'}
                        {card.suit === 'diamonds' && '♦'}
                        {card.suit === 'clubs' && '♣'}
                        {card.suit === 'spades' && '♠'}
                        <span className="ml-0.5">{card.value <= 10 ? card.value : (card.value === 11 ? 'J' : (card.value === 12 ? 'Q' : (card.value === 13 ? 'K' : 'A')))}</span>
                    </span>
                </div>
                <p className="text-[9px] opacity-90 text-center leading-tight line-clamp-3 px-1 text-gray-200">
                    {card.description}
                </p>
            </div>
        </motion.div>
    );
};
