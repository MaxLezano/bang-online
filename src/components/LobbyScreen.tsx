
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Socket } from 'socket.io-client';
import { GameSettings } from '../types';

interface LobbyScreenProps {
    socket: Socket | null;
    onStartGame: (settings: GameSettings) => void;
    onBack: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ socket, onStartGame, onBack }) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'MAIN' | 'CREATE' | 'JOIN'>('MAIN');
    const [name, setName] = useState('');

    // Multiplayer State (Managed by Parent)
    const [roomCode, setRoomCode] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [myId, setMyId] = useState<string>(''); // Track own ID for highlighting

    // Lobby State
    const MAX_PLAYERS = 7;
    const [participants, setParticipants] = useState<{ name: string, isBot: boolean, id?: string }[]>([]);
    const [copied, setCopied] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [joinError, setJoinError] = useState('');

    const [isConnecting, setIsConnecting] = useState(false);

    // Listeners for Socket Events
    useEffect(() => {
        if (!socket) return;

        // Update ID if already connected
        if (socket.id) setMyId(socket.id);

        const onConnect = () => {
            console.log('Connected to server:', socket.id);
            if (socket.id) setMyId(socket.id);
            setIsConnecting(false);
        };

        const onDisconnect = () => {
            console.log('Disconnected');
            setIsConnecting(false);
        };

        const onConnectError = (err: any) => {
            console.error('Connection error:', err);
            setJoinError('Connection failed: ' + err.message);
            setIsConnecting(false);
        };

        const onPlayerJoined = (players: any[]) => {
            console.log('Player joined update:', players);
            const mapped = players.map(p => ({
                name: p.name,
                isBot: false,
                id: p.id
            }));
            setParticipants(mapped);
        };

        const onGameStarted = (settings: GameSettings) => {
            console.log('Host started game!', settings);
            onStartGame(settings);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);
        socket.on('player_joined', onPlayerJoined);
        socket.on('game_started', onGameStarted);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
            socket.off('player_joined', onPlayerJoined);
            socket.off('game_started', onGameStarted);
        };
    }, [socket, onStartGame]);

    const handleCreateLobby = () => {
        if (!socket) return;

        if (!socket.connected) {
            socket.connect(); // Try to connect if not
            setIsConnecting(true);
            // We can't emit immediately, wait for connect event
            return;
        }

        console.log("Emitting create_room...");
        socket.emit('create_room', name, (response: any) => {
            console.log("create_room received:", response);
            if (response.roomId) {
                setRoomCode(response.roomId);
                setIsHost(true);
                setView('CREATE');
                // Set self
                if (socket.id) setMyId(socket.id);
                setParticipants([{ name: name, isBot: false, id: socket.id }]);
            } else {
                console.error("Failed to create room:", response);
            }
        });
    };

    const handleJoinLobby = () => {
        if (!socket) return;
        if (!joinCodeInput) return;

        if (!socket.connected) {
            socket.connect();
            setIsConnecting(true);
            return;
        }

        console.log("Emitting join_room...");
        socket.emit('join_room', { roomId: joinCodeInput.toUpperCase(), playerName: name }, (response: any) => {
            if (response.error) {
                setJoinError(response.error);
            } else {
                setRoomCode(joinCodeInput.toUpperCase());
                setIsHost(false);
                setView('CREATE'); // Using same view for lobby
                // Update participants
                if (socket.id) setMyId(socket.id);
                if (response.players) {
                    setParticipants(response.players.map((p: any) => ({ name: p.name, isBot: false, id: p.id })));
                }
            }
        });
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const addBot = () => {
        if (!isHost) return;
        if (participants.length < MAX_PLAYERS) {
            // Local bot addition? 
            // In MP, bots must be known to server?
            // For now, let's say Host adds bots locally, BUT server needs to know count?
            // Server implementation didn't explicitly handle bots in the user list.
            // Simpler: Just add a "Bot" placeholder locally, and when Starting Game, send botCount.
            setParticipants([...participants, { name: 'Bot', isBot: true }]);
        }
    };

    const removeBot = (index: number) => {
        if (!isHost) return;
        if (index === 0) return; // Cant remove self (host) - though index 0 might not be host in list if unsorted
        const p = participants[index];
        if (!p.isBot) return; // Can't kick real players yet (server logic needed)

        const newParticipants = [...participants];
        newParticipants.splice(index, 1);
        setParticipants(newParticipants);
    };

    const handleStart = () => {
        if (!isHost) return;

        const activeCount = participants.length;
        if (activeCount < 2) return; // Allow 2 players for testing? Original was 3.

        const botCount = participants.filter(p => p.isBot).length;

        const settings: GameSettings = {
            playerName: name,
            mode: 'MULTIPLAYER',
            playerCount: activeCount,
            botCount: botCount,
            roomId: roomCode,
            isHost: true,
            players: participants.map(p => ({
                id: p.id || 'bot-' + Math.random(), // Ensure ID
                name: p.name,
                isBot: p.isBot
            }))
        };

        // Notify server to start game for everyone?
        if (socket) {
            socket.emit('start_game_request', { roomId: roomCode, settings });
        }

        // Also start for self immediately? Server event will handle it essentially.
        // But let's rely on server event 'game_started' for everyone including host.
    };

    const activeParticipants = participants.length;
    const canStart = activeParticipants >= 3; // Min 3 rules

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
                        onClick={handleCreateLobby}
                        disabled={!name.trim() || isConnecting}
                        className={`flex-1 py-4 rounded-sm bg-gradient-to-r from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 border border-amber-400/50 text-white font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider ${!isConnecting && 'hover:scale-105 active:scale-95'}`}
                    >
                        {isConnecting ? t('connecting') : t('create_lobby')}
                    </button>
                    {joinError && <div className="absolute top-full mt-2 text-red-500 font-bold text-sm bg-black/80 p-2 rounded w-full text-center">{joinError}</div>}
                </div>

                <button onClick={onBack} className="text-amber-700 hover:text-amber-500 text-sm mt-4 uppercase tracking-widest font-bold">
                    {t('back')}
                </button>
            </div>
        );
    }

    if (view === 'JOIN') {
        return (
            <div className="flex flex-col items-center gap-6 w-full max-w-md animate-fade-in bg-black/90 p-8 rounded-sm border-2 border-amber-900/50">
                <h2 className="text-2xl font-bold text-amber-100 uppercase tracking-widest">{t('join_room_title')}</h2>

                <div className="w-full">
                    <label className="block text-amber-500/80 text-sm mb-2 tracking-widest uppercase font-bold">{t('room_code_input_label')}</label>
                    <input
                        type="text"
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="w-full bg-black/60 border-2 border-amber-700/50 rounded-sm px-4 py-4 text-center text-2xl font-mono text-amber-100 placeholder-amber-900/50 focus:outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all tracking-widest"
                        placeholder="ABCXYZ"
                    />
                </div>

                {joinError && (
                    <p className="text-red-500 text-sm font-bold animate-pulse">{joinError}</p>
                )}

                <div className="flex gap-4 w-full">
                    <button
                        onClick={() => setView('MAIN')}
                        className="flex-1 py-3 rounded-sm bg-transparent border border-amber-800/50 text-amber-700 hover:text-amber-400 uppercase font-bold"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleJoinLobby}
                        disabled={!joinCodeInput || joinCodeInput.length < 6}
                        className="flex-1 py-3 rounded-sm bg-amber-700 text-white font-bold hover:bg-amber-600 disabled:opacity-50 uppercase tracking-widest"
                    >
                        {t('join_action')}
                    </button>
                </div>
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
                                    {copied ? '✓' : t('copy_code')}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-amber-500/60 font-bold uppercase tracking-wide">{t('total_players')}: {activeParticipants} / {MAX_PLAYERS}</span>
                    </div>
                </div>

                {/* Participants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                    {participants.map((p, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-4 rounded-sm border-2 transition-all ${p.isBot
                                ? 'border-stone-800 bg-black/40 opacity-60' // Dim bots significantly
                                : p.id === myId
                                    ? 'border-yellow-500 bg-amber-900/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]' // Highlight Self (Solid Yellow Border)
                                    : 'border-stone-600/50 bg-stone-900/40 opacity-100' // Normal Other Player
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar: Initial in Circle (Yellow for Humans, Grey for Bots) */}
                                <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center relative shadow-lg ring-1 ring-white/80 ${p.isBot
                                    ? 'bg-stone-700 ring-stone-500' // Darker avatar for bots
                                    : 'bg-gradient-to-br from-yellow-500 to-amber-600'
                                    }`}>
                                    <span className="text-white font-serif font-bold text-xl drop-shadow-md">
                                        {p.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <div className={`font-bold uppercase tracking-wider ${p.isBot ? 'text-stone-500' : (p.id === myId ? 'text-amber-400' : 'text-stone-300')
                                        }`}>
                                        {p.name} {!p.isBot && p.id === myId ? t('indicator_you') : ''}
                                    </div>
                                    <div className="text-xs text-stone-500 font-serif italic">
                                        {p.isBot ? t('ai_controlled') : t('human_player')}
                                    </div>
                                </div>
                            </div>

                            {/* Host can remove bots */}
                            {isHost && p.isBot && (
                                <button
                                    onClick={() => removeBot(index)}
                                    className="text-red-600 hover:text-red-400 transition-all p-2 rounded-full hover:bg-red-900/20 flex-shrink-0 active:scale-95 hover:scale-110"
                                    title={t('remove_bot')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {isHost && (
                    <button
                        onClick={addBot}
                        disabled={activeParticipants >= MAX_PLAYERS}
                        className={`w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-all ${activeParticipants >= MAX_PLAYERS
                            ? 'border-gray-800 text-gray-700 cursor-not-allowed'
                            : 'border-amber-900/30 text-amber-700 hover:border-amber-500 hover:text-amber-400 hover:bg-amber-900/10'
                            }`}
                    >
                        {t('add_bot')}
                    </button>
                )}

                <div className="mt-4 border-t border-amber-800/30 pt-4">
                    {!canStart && (
                        <p className="text-center text-white/80 text-sm mb-2 animate-pulse font-serif tracking-wide">
                            {t('needs_3_players')} ({activeParticipants}/3)
                        </p>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                // Disconnect on manual back?
                                // Let's keep it simple: just go back to main menu view, socket stays? 
                                // Actually better to force disconnect to cleanup room.
                                if (socket) socket.disconnect();
                                setView('MAIN');
                                setIsHost(false);
                                setParticipants([]);
                                setRoomCode('');
                            }}
                            className="flex-1 py-3 rounded-sm bg-transparent border border-amber-800/50 text-amber-700 hover:text-amber-400 hover:border-amber-500 transition-colors uppercase font-bold tracking-wider"
                        >
                            {t('back')}
                        </button>

                        {isHost ? (
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
                        ) : (
                            <div className="flex-[2] py-3 text-center text-amber-500 animate-pulse uppercase tracking-widest font-bold">
                                {t('waiting_for_host')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
