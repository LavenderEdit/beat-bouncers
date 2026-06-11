import React, { useState, useEffect } from 'react';
import { translations } from '../../utils/i18n';
import { socketClient } from '../../services/socketClient';
import { matchmakingService } from '../../services/matchmakingService';
import { ArrowLeft, Check, Users } from 'lucide-react';

export default function MultiplayerReadyRoom({ setAppState, roomId, initialRoomState, language }) {
    const t = translations[language];
    const [players, setPlayers] = useState(initialRoomState?.players || []);
    const [isReady, setIsReady] = useState(false);
    const [countdown, setCountdown] = useState(null);

    const handleToggleReady = () => {
        const nextReady = !isReady;
        setIsReady(nextReady);
        matchmakingService.sendReady(roomId, nextReady);
    };

    const handleLeave = () => {
        matchmakingService.disconnectMatch();
        socketClient.disconnect();
        setAppState('MULTIPLAYER_MENU');
    };

    useEffect(() => {
        // Request current state of room upon entry
        matchmakingService.requestRoomState(roomId);

        const onStateUpdate = (roomState) => {
            if (roomState && roomState.players) {
                setPlayers(roomState.players);
            }
        };

        const onPlayerJoined = (player) => {
            console.log('[Room] Player joined:', player);
            setPlayers(prev => {
                if (prev.find(p => p.id === player.id)) return prev;
                return [...prev, player];
            });
        };

        const onPlayerLeft = (data) => {
            console.log('[Room] Player left:', data);
            setPlayers(prev => prev.filter(p => p.id !== data.playerId));
        };

        const onCountdown = (data) => {
            // e.g. { countdown: number }
            setCountdown(data.countdown);
        };

        const onMatchStart = (data) => {
            console.log('[Room] Match starting!');
            setAppState('MULTIPLAYER_PLAYING');
        };

        socketClient.on('server:state', onStateUpdate);
        socketClient.on('server:playerJoined', onPlayerJoined);
        socketClient.on('server:playerLeft', onPlayerLeft);
        socketClient.on('server:playerDisconnected', onPlayerLeft);
        socketClient.on('server:matchCountdown', onCountdown);
        socketClient.on('server:matchStart', onMatchStart);

        return () => {
            socketClient.off('server:state', onStateUpdate);
            socketClient.off('server:playerJoined', onPlayerJoined);
            socketClient.off('server:playerLeft', onPlayerLeft);
            socketClient.off('server:playerDisconnected', onPlayerLeft);
            socketClient.off('server:matchCountdown', onCountdown);
            socketClient.off('server:matchStart', onMatchStart);
        };
    }, [roomId]);

    return (
        <div className="absolute inset-0 z-10 flex flex-col justify-between items-center py-10 px-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-[#0a0a19]/90 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-xl w-full text-center">
                
                <div className="flex items-center mb-6">
                    {countdown === null && (
                        <button onClick={handleLeave} className="text-gray-400 hover:text-white transition-colors shrink-0 pointer-events-auto">
                            <ArrowLeft size={32} />
                        </button>
                    )}
                    <h2 className="text-2xl font-black flex-1 text-center pr-8 text-white uppercase tracking-tight flex items-center justify-center gap-2">
                        <Users className="text-purple-500" /> SALA DE ESPERA
                    </h2>
                </div>

                {countdown !== null ? (
                    <div className="py-8 animate-pulse">
                        <p className="text-purple-400 font-bold uppercase tracking-widest text-lg mb-2">PARTIDA POR COMENZAR</p>
                        <h1 className="text-7xl sm:text-9xl font-black text-white italic drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                            {countdown}
                        </h1>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-400 text-xs sm:text-sm mb-6">
                            Sala ID: <span className="font-mono text-white font-bold">{roomId}</span>. Esperando a que todos los jugadores marquen "Listo".
                        </p>

                        <div className="flex flex-col gap-3 mb-8 max-h-[30vh] overflow-y-auto pr-1">
                            {players.map((p) => {
                                const isMe = p.id === socketClient.getId();
                                const ready = p.ready; // from backend player state
                                return (
                                    <div
                                        key={p.id}
                                        className="flex justify-between items-center py-3 px-4 rounded-xl border bg-white/5"
                                        style={{ borderColor: ready ? `${p.color}50` : 'rgba(255,255,255,0.05)' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }} />
                                            <span className="text-white font-bold text-sm sm:text-base">
                                                {p.name} {isMe && <span className="text-purple-400 text-xs font-normal font-sans">(Tú)</span>}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {ready ? (
                                                <div className="flex items-center gap-1 text-green-400 font-bold text-xs uppercase tracking-wider">
                                                    <Check size={14} /> LISTO
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">ESPERANDO</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleToggleReady}
                            className={`w-full py-4 px-6 text-lg font-black rounded-xl text-white transition-all uppercase pointer-events-auto border ${
                                isReady 
                                    ? 'bg-green-600 hover:bg-green-500 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                                    : 'bg-purple-600 hover:bg-purple-500 border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                            }`}
                        >
                            {isReady ? '¡ESTOY LISTO!' : 'MARCAR LISTO'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
