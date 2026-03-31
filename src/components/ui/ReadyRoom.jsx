import React, { useState, useEffect } from 'react';
import { translations } from '../../utils/i18n';

export default function ReadyRoom({ engineRef, isP2Bot, language, onStartMatch }) {
    const t = translations[language];
    const [p1Ready, setP1Ready] = useState(false);
    const [p2Ready, setP2Ready] = useState(isP2Bot);
    const [countdown, setCountdown] = useState(null);

    useEffect(() => {
        if (countdown !== null) return;

        let frameId;
        const checkInput = () => {
            if (engineRef.current && engineRef.current.input) {
                const input = engineRef.current.input;
                if (!p1Ready && (input.isPressed('KeyW') || input.isPressed('KeyS') || input.isPressed('w') || input.isPressed('W'))) {
                    setP1Ready(true);
                }
                if (!p2Ready && (input.isPressed('ArrowUp') || input.isPressed('ArrowDown'))) {
                    setP2Ready(true);
                }
            }
            frameId = requestAnimationFrame(checkInput);
        };

        frameId = requestAnimationFrame(checkInput);
        return () => cancelAnimationFrame(frameId);
    }, [countdown, p1Ready, p2Ready, engineRef]);

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
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between items-center py-10 sm:py-20">

            {countdown === null && (
                <div className="w-full flex justify-between px-4 sm:px-20 mt-10 sm:mt-0">
                    <div className={`p-2 sm:p-4 rounded-xl backdrop-blur-sm border-2 sm:border-4 transition-all duration-300 ${p1Ready ? 'bg-pink-500/20 border-pink-500' : 'bg-black/50 border-gray-600'}`}>
                        <h2 className={`text-sm sm:text-2xl font-black ${p1Ready ? 'text-pink-400' : 'text-gray-400'}`}>
                            {p1Ready ? t.ready : t.waitingP1}
                        </h2>
                    </div>

                    <div className={`p-2 sm:p-4 rounded-xl backdrop-blur-sm border-2 sm:border-4 transition-all duration-300 ${p2Ready ? 'bg-cyan-500/20 border-cyan-500' : 'bg-black/50 border-gray-600'}`}>
                        <h2 className={`text-sm sm:text-2xl font-black ${p2Ready ? 'text-cyan-400' : 'text-gray-400'}`}>
                            {p2Ready ? t.ready : t.waitingP2}
                        </h2>
                    </div>
                </div>
            )}

            {countdown !== null && (
                <div className="flex-1 flex items-center justify-center animate-in zoom-in duration-300 px-4 w-full">
                    <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black italic drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] text-white text-center leading-tight break-words max-w-full">
                        {countdown}
                    </h1>
                </div>
            )}

            {countdown === null && (
                <div className="animate-pulse bg-black/60 px-6 sm:px-8 py-2 sm:py-3 rounded-full backdrop-blur-sm text-gray-300 font-bold tracking-widest text-xs sm:text-base mb-24 sm:mb-0">
                    SALTA PARA CONFIRMAR
                </div>
            )}
        </div>
    );
}