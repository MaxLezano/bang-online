import React from 'react';
import { Card as CardType } from '../types';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface CardProps {
    card: CardType;
    isSelected?: boolean;
    onClick?: () => void;
    className?: string;
    disableHover?: boolean;
    variant?: 'standard' | 'mini' | 'hand' | 'equipped';
}

export const Card: React.FC<CardProps> = ({ card, isSelected, onClick, className, disableHover, variant = 'standard' }) => {
    const { t } = useTranslation();
    const [imageError, setImageError] = React.useState(false);

    React.useEffect(() => {
        setImageError(false);
    }, [card.id]);

    const getBorderColor = () => {
        if (card.type === 'Equipment' || card.type === 'Status') return 'border-blue-500 shadow-blue-500/50';
        return 'border-[#8B4513] shadow-[#8B4513]/50';
    };

    const getImagePath = () => {
        const cleanName = card.nameKey.replace('card_', '').replace('_name', '');
        return `/cards/${cleanName}.webp`;
    };

    const getSuitIcon = (suit: string) => {
        switch (suit.toLowerCase()) {
            case 'hearts': return '♥';
            case 'diamonds': return '♦';
            case 'clubs': return '♣';
            case 'spades': return '♠';
            default: return '';
        }
    };

    const getDisplayValue = (val: number) => {
        switch (val) {
            case 11: return 'J';
            case 12: return 'Q';
            case 13: return 'K';
            case 14:
            case 1: return 'A';
            default: return val.toString();
        }
    };

    const suitColor = (card.suit === 'hearts' || card.suit === 'diamonds') ? 'text-red-500' : 'text-gray-200';

    return (
        <motion.div
            whileHover={disableHover ? undefined : { scale: 1.05, y: -5 }}
            whileTap={disableHover ? undefined : { scale: 0.95 }}
            onClick={onClick}
            className={clsx(
                "relative rounded-xl flex flex-col justify-end cursor-pointer transition-all duration-300 bg-[#1a0f0a] text-white overflow-hidden",
                className || "w-32 h-48",
                isSelected
                    ? 'border-4 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.6)] scale-110 z-20'
                    : `border-2 ${getBorderColor()} shadow-lg`
            )}
        >
            {/* Full Bleed Image */}
            <div className="absolute inset-0 z-0 bg-black/50">
                {!imageError ? (
                    <img
                        src={getImagePath()}
                        alt={card.name}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center">
                        <div className="text-4xl opacity-50 mb-2">
                            {card.effectType === 'bang' ? '💥' :
                                card.effectType === 'missed' ? '🛡️' :
                                    card.effectType === 'heal' ? '🍺' : '🃏'}
                        </div>
                        <span className="text-xs uppercase font-serif tracking-widest opacity-50">{card.name}</span>
                    </div>
                )}
            </div>

            {/* Overlays */}

            {/* Top Badge: Name */}
            <div className="absolute top-0 left-0 right-0 p-2 z-10 bg-gradient-to-b from-black/80 to-transparent pt-3 pb-6">
                <div className="text-center font-bold text-sm leading-none text-amber-100 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] uppercase tracking-wide font-serif">
                    {t(card.nameKey) || card.name}
                </div>
            </div>

            {/* Bottom Badge: Suit & Rank - Moved to Bottom Left */}
            {variant !== 'mini' && variant !== 'equipped' && (
                <div className="absolute bottom-2 left-2 z-10 flex flex-col items-start gap-1">
                    <div className={`flex items-center gap-1.5 text-lg font-bold bg-black/80 px-3 py-1 rounded-full border border-white/10 shadow-lg ${suitColor} ${variant === 'hand' ? 'scale-75 origin-bottom-left' : ''}`}>
                        <span>{getDisplayValue(card.value)}</span>
                        <span className="text-xl leading-none">{getSuitIcon(card.suit)}</span>
                    </div>
                </div>
            )}

            {/* Card Type Icons (Equipment etc) - Range Removed */}
            {variant !== 'mini' && variant !== 'equipped' && (
                <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
                    {/* Icons removed as requested */}
                </div>
            )}

        </motion.div>
    );
};
