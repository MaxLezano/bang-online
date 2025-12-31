import React, { useEffect, useRef } from 'react';
import { useGame } from '../GameContext';
// import { useTranslation } from 'react-i18next';

export const GameLog: React.FC = () => {
    const { state } = useGame();
    // const { t } = useTranslation(); // Removed unused t
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.logs.length]);

    return (
        <div className="h-full bg-black/80 border-r border-gray-800 flex flex-col p-4 animate-fade-in">
            <h2 className="text-xl font-bold text-green-500 mb-4 tracking-widest border-b border-green-900/50 pb-2">
                SYSTEM LOGS
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar font-mono text-sm">
                {state.logs.map((log, idx) => (
                    <div key={idx} className="text-green-400/80 border-l-2 border-green-900 pl-2">
                        <span className="text-green-700 mr-2">[{idx}]</span>
                        {log}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
