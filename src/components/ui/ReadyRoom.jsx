import React, { useState, useEffect } from 'react';
import { translations } from '../../utils/i18n';

export default function ReadyRoom({ engineRef, isP2Bot, language, onStartMatch }) {
    const t = translations[language];
    const [p1Ready, setP1Ready] = useState(false);
    const [p2Ready, setP2Ready] = useState(isP2Bot);
    const [countdown, setCountdown] = useState(null);

    useEffect(() => {
        if (countdown !== null) return;

        const handleKeyDown = (e) => {
            if (['w', 'W', 's', 'S'].includes(e.key)) {
                setP1Ready(true);
            }
            if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
                setP2Ready(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [countdown]);

    useEffect(() => {
        if (p1Ready && p2Ready && countdown === null) {
            setCountdown(3);
        }
    }, [p1Ready, p2Ready, countdown]);

    useEffect(() => {
        if (countdown === null) return;

        if (typeof countdown === 'number' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCountdown(t.iconicPhrase);
        } else if (countdown === t.iconicPhrase) {
            const timer = setTimeout(() => onStartMatch(), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown, onStartMatch, t.iconicPhrase]);

    return (
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between items-center py-20">

            {countdown === null && (
                <div className="w-full flex justify-between px-20">
                    <div className={`p-4 rounded-xl backdrop-blur-sm border-4 transition-all duration-300 ${p1Ready ? 'bg-pink-500/20 border-pink-500' : 'bg-black/50 border-gray-600'}`}>
                        <h2 className={`text-2xl font-black ${p1Ready ? 'text-pink-400' : 'text-gray-400'}`}>
                            {p1Ready ? t.ready : t.waitingP1}
                        </h2>
                    </div>

                    <div className={`p-4 rounded-xl backdrop-blur-sm border-4 transition-all duration-300 ${p2Ready ? 'bg-cyan-500/20 border-cyan-500' : 'bg-black/50 border-gray-600'}`}>
                        <h2 className={`text-2xl font-black ${p2Ready ? 'text-cyan-400' : 'text-gray-400'}`}>
                            {p2Ready ? t.ready : t.waitingP2}
                        </h2>
                    </div>
                </div>
            )}

            {countdown !== null && (
                <div className="flex-1 flex items-center justify-center animate-in zoom-in duration-300">
                    <h1 className="text-9xl font-black italic drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] text-white text-center">
                        {countdown}
                    </h1>
                </div>
            )}

            {countdown === null && (
                <div className="animate-pulse bg-black/60 px-8 py-3 rounded-full backdrop-blur-sm text-gray-300 font-bold tracking-widest">
                    SALTA PARA CONFIRMAR
                </div>
            )}
        </div>
    );
}
