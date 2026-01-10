import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type SoundName =
    | 'bang' // Shoot
    | 'missed' // Missed
    | 'beer' // Heal
    | 'dynamite' // Explosion
    | 'jail' // Jail
    | 'draw' // Draw card
    | 'equip' // Equip weapon/item
    | 'turn_start' // Your turn
    | 'win' // Game Win
    | 'lose' // Game Lose
    | 'click' // Generic click
    | 'playing'; // Generic card play

interface SoundContextType {
    playSound: (sound: SoundName) => void;
    volume: number;
    setVolume: (vol: number) => void;
    muted: boolean;
    setMuted: (muted: boolean) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [volume, setVolume] = useState(0.5);
    const [muted, setMuted] = useState(false);
    const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

    const getAudio = (sound: SoundName) => {
        if (!audioCache.current.has(sound)) {
            const audio = new Audio(`/sounds/${sound}.mp3`);
            audioCache.current.set(sound, audio);
        }
        return audioCache.current.get(sound)!;
    };

    const playSound = (sound: SoundName) => {
        if (muted) return;

        try {
            const audio = getAudio(sound);
            audio.currentTime = 0;
            audio.volume = volume;
            audio.play().catch(e => {
                // Ignore errors if file doesn't exist or user hasn't interacted yet
                console.warn(`Failed to play sound: ${sound}`, e);
            });
        } catch (e) {
            console.error("Audio error:", e);
        }
    };

    return (
        <SoundContext.Provider value={{ playSound, volume, setVolume, muted, setMuted }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};
