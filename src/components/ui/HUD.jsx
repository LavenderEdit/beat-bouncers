import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { translations } from '../../utils/i18n';

export default function HUD({ gameState, isP2Bot, language }) {
    const t = translations[language] || translations['es'];
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768);
    }, []);

    const renderLives = (lives) => Array(Math.max(0, lives)).fill(0).map((_, i) => (
        <Heart key={i} className={isMobile ? "w-4 h-4" : "w-6 h-6"} fill="currentColor" />
    ));

    const getDamageColor = (percent) => percent >= 150 ? 'text-red-500' : (percent > 80 ? 'text-orange-400' : 'text-white');

    if (gameState.sdTransition) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-300 p-4 text-center">
                <h1 className={`font-black text-red-600 uppercase tracking-tighter drop-shadow-[0_0_40px_rgba(220,38,38,1)] ${isMobile ? 'text-5xl mb-4' : 'text-8xl mb-8'}`}>
                    {t.suddenDeath}
                </h1>
                <p className={`text-white font-bold animate-pulse ${isMobile ? 'text-xl mb-2' : 'text-3xl mb-4'}`}>
                    {t.sdWarning}
                </p>
                <p className={`text-yellow-400 font-black tracking-widest uppercase ${isMobile ? 'text-sm mb-6' : 'text-xl mb-10'}`}>
                    {t.sdOnlyDash}
                </p>
                <div className={`font-black italic text-white drop-shadow-lg ${isMobile ? 'text-6xl' : 'text-9xl'}`}>
                    {gameState.sdCountdown}
                </div>
            </div>
        );
    }

    return (
        <div className={`absolute top-0 left-0 w-full flex justify-between items-start z-10 pointer-events-none ${isMobile ? 'p-2 pt-12' : 'p-6'}`
        }>

            <div className={`text-left bg-black/60 backdrop-blur-sm rounded-2xl shadow-lg flex flex-col ${isMobile ? 'p-2 min-w-[100px] border-l-2' : 'p-4 min-w-[200px] border-l-4'} border-pink-500`}>
                <h3 className={`font-black text-pink-500 ${isMobile ? 'text-lg' : 'text-2xl'}`} style={{ textShadow: '0 0 10px #ff00ff' }}>P1</h3>
                <div className={`flex gap-1 text-pink-500 ${isMobile ? 'my-1' : 'my-2'}`}>{renderLives(gameState.p1.lives)}</div>
                <div className="flex flex-col">
                    <p className={`font-black drop-shadow-lg ${getDamageColor(gameState.p1.percent)} ${isMobile ? 'text-4xl' : 'text-6xl'}`}>{gameState.p1.percent}%</p>
                    <p className={`text-gray-400 font-bold tracking-[0.2em] uppercase mt-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Max: 200%</p>
                </div>
                {!isMobile && <p className="text-pink-400 font-bold text-sm mt-3 uppercase">DASH: [F]</p>}
            </div >

            < div className={`text-center bg-black/60 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg flex flex-col items-center ${isMobile ? 'px-4 py-2' : 'px-8 py-3'}`}>
                <div className={`flex items-center justify-center ${isMobile ? 'h-6 mb-1' : 'h-8 mb-2'}`}>
                    {gameState.suddenDeath ? (
                        <p className={`text-red-600 font-black animate-bounce drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] ${isMobile ? 'text-sm' : 'text-2xl'}`}>
                            {t.suddenDeath}
                        </p>
                    ) : (
                        <p className={`text-orange-500 font-black transition-opacity duration-300 ${gameState.erratic ? 'opacity-100 animate-pulse' : 'opacity-0'} ${isMobile ? 'text-xs' : 'text-xl'}`}>
                            {t.erratic}
                        </p>
                    )}
                </div>
                <p className={`text-gray-400 tracking-[0.2em] uppercase font-bold ${isMobile ? 'text-[10px]' : 'text-xs'}`}>{t.time}</p>
                <p className={`font-black font-mono ${gameState.suddenDeath ? 'text-red-400 animate-pulse' : 'text-white'} ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                    {gameState.suddenDeath ? gameState.sdTimeLeft : gameState.time}s
                </p>
            </div >

            < div className={`text-right bg-black/60 backdrop-blur-sm rounded-2xl shadow-lg flex flex-col items-end ${isMobile ? 'p-2 min-w-[100px] border-r-2' : 'p-4 min-w-[200px] border-r-4'} border-cyan-500`}>
                <h3 className={`font-black text-cyan-500 ${isMobile ? 'text-lg' : 'text-2xl'}`} style={{ textShadow: '0 0 10px #00ffff' }}>{isP2Bot ? 'CPU' : 'P2'}</h3>
                <div className={`flex gap-1 text-cyan-500 justify-end ${isMobile ? 'my-1' : 'my-2'}`}>{renderLives(gameState.p2.lives)}</div>
                <div className="flex flex-col items-end">
                    <p className={`font-black drop-shadow-lg ${getDamageColor(gameState.p2.percent)} ${isMobile ? 'text-4xl' : 'text-6xl'}`}>{gameState.p2.percent}%</p>
                    <p className={`text-gray-400 font-bold tracking-[0.2em] uppercase mt-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Max: 200%</p>
                </div>
                {!isMobile && <p className="text-cyan-400 font-bold text-sm mt-3 uppercase">DASH: [SHIFT]</p>}
            </div >

        </div >
    );
}