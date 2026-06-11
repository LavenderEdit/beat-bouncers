import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { translations } from '../../utils/i18n';
import { matchmakingService } from '../../services/matchmakingService';
import { socketClient } from '../../services/socketClient';

export default function MultiplayerQueue({ setAppState, language, roomId, setRoomId, setInitialRoomState }) {
    const t = translations[language];
    const [queueLen, setQueueLen] = useState(1);
    const [elapsed, setElapsed] = useState(0);

    const handleCancel = () => {
        matchmakingService.leaveQueue();
        socketClient.disconnect();
        setAppState('MULTIPLAYER_MENU');
    };

    useEffect(() => {
        // Automatically request joining the queue
        matchmakingService.joinQueue();

        const onQueueStatus = (data) => {
            if (data && typeof data.queueLength === 'number') {
                setQueueLen(data.queueLength);
            }
        };

        const onRoomCreated = (data) => {
            console.log('[Queue] Match found! Room created:', data);
            setRoomId(data.roomId);
            setInitialRoomState(data);
            setAppState('MULTIPLAYER_READY');
        };

        socketClient.on('server:queueStatus', onQueueStatus);
        socketClient.on('server:roomCreated', onRoomCreated);

        const timer = setInterval(() => {
            setElapsed(prev => prev + 1);
        }, 1000);

        return () => {
            socketClient.off('server:queueStatus', onQueueStatus);
            socketClient.off('server:roomCreated', onRoomCreated);
            clearInterval(timer);
        };
    }, []);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a19]/90 backdrop-blur-md border border-white/10 p-6 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-md w-full text-center max-h-[95vh] overflow-y-auto">
                <Loader2 className="animate-spin text-purple-500 mx-auto mb-6 sm:w-16 sm:h-16 w-12 h-12" />

                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 uppercase tracking-tight">
                    {t.joinQueue}
                </h2>
                
                <p className="text-gray-400 font-mono text-xl sm:text-2xl font-bold mb-6">
                    {formatTime(elapsed)}
                </p>

                <div className="bg-white/5 border border-white/5 rounded-2xl py-4 px-6 mb-8 flex justify-between items-center text-left">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">{t.playersInQueue}</span>
                    <span className="text-purple-400 font-black text-2xl">{queueLen}</span>
                </div>

                <button
                    onClick={handleCancel}
                    className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-600 text-base font-bold rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-all uppercase"
                >
                    <ArrowLeft size={18} />
                    <span>{t.leaveQueue}</span>
                </button>
            </div>
        </div>
    );
}
