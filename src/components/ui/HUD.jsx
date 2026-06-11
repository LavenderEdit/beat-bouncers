import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { translations } from '../../utils/i18n';

export default function HUD({ gameState, language }) {
    const t = translations[language] || translations['es'];
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768);
    }, []);

    const renderLives = (lives, color) => Array(Math.max(0, lives)).fill(0).map((_, i) => (
        <Heart key={i} className={isMobile ? "w-3 h-3" : "w-5 h-5"} style={{ color: color }} fill="currentColor" />
    ));

    const getDamageColor = (percent) => percent >= 150 ? 'text-red-500 font-extrabold animate-pulse' : (percent > 80 ? 'text-orange-400 font-bold' : 'text-white');

    if (gameState.sdTransition) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-300 p-4 text-center">
                <h1 className={`font-black text-red-600 uppercase tracking-tighter drop-shadow-[0_0_40px_rgba(220,38,38,1)] font-orbitron ${isMobile ? 'text-5xl mb-4' : 'text-8xl mb-8'}`}>
                    {t.suddenDeath}
                </h1>
                <p className={`text-white font-bold animate-pulse ${isMobile ? 'text-xl mb-2' : 'text-3xl mb-4'}`}>
                    {t.sdWarning}
                </p>
                <p className={`text-yellow-400 font-black tracking-widest uppercase ${isMobile ? 'text-sm mb-6' : 'text-xl mb-10'}`}>
                    {t.sdOnlyDash}
                </p>
                <div className={`font-black italic text-white drop-shadow-lg font-orbitron ${isMobile ? 'text-6xl' : 'text-9xl'}`}>
                    {gameState.sdCountdown}
                </div>
            </div>
        );
    }

    const players = gameState.players || [];

    return (
        <div className={`absolute top-0 left-0 w-full flex flex-col items-center z-10 pointer-events-none ${isMobile ? 'p-2 pt-12' : 'p-4'}`}>
            
            {/* Top Bar: Match Timer & Global Info */}
            <div className={`text-center bg-black/60 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg flex flex-col items-center ${isMobile ? 'px-4 py-1.5' : 'px-8 py-2.5'} mb-3`}>
                <div className={`flex items-center justify-center ${isMobile ? 'h-4' : 'h-6 mb-1'}`}>
                    {gameState.suddenDeath ? (
                        <p className={`text-red-600 font-black animate-bounce drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] ${isMobile ? 'text-xs' : 'text-lg'}`}>
                            {t.suddenDeath}
                        </p>
                    ) : (
                        gameState.erratic && (
                            <p className={`text-orange-500 font-black animate-pulse ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
                                {t.erratic}
                            </p>
                        )
                    )}
                </div>
                <p className={`text-gray-400 tracking-[0.2em] uppercase font-bold ${isMobile ? 'text-[8px]' : 'text-[10px]'}`}>{t.time}</p>
                <p className={`font-black font-mono ${gameState.suddenDeath ? 'text-red-400 animate-pulse' : 'text-white'} ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                    {gameState.suddenDeath ? gameState.sdTimeLeft : gameState.time}s
                </p>
                {gameState.trackTitle && (
                    <p className={`text-cyan-400 font-bold tracking-wide mt-1 truncate max-w-[150px] sm:max-w-[280px] ${isMobile ? 'text-[8px]' : 'text-xs animate-pulse'}`}>
                         🎵 {gameState.trackTitle}
                    </p>
                )}
            </div>

            {/* Players Grid: Dynamic Row of cards */}
            <div className="w-full flex flex-wrap justify-center items-stretch gap-2 px-2 max-w-7xl">
                {players.map((p) => {
                    const isDead = p.lives <= 0;
                    return (
                        <div
                            key={p.id}
                            className={`flex flex-col bg-black/60 backdrop-blur-sm rounded-2xl shadow-lg border-t-4 transition-all duration-300 ${
                                isMobile ? 'p-2 min-w-[95px] max-w-[130px] flex-1' : 'p-4 min-w-[170px]'
                            } ${isDead ? 'opacity-40' : ''}`}
                            style={{ borderTopColor: p.color, boxShadow: isDead ? 'none' : `0 4px 15px rgba(0,0,0,0.5)` }}
                        >
                            <div className="flex justify-between items-center gap-1">
                                <h3 className={`font-black uppercase truncate ${isMobile ? 'text-xs' : 'text-base'}`} style={{ color: p.color, textShadow: `0 0 5px ${p.color}80` }}>
                                    {p.name || p.id}
                                </h3>
                                {p.isBot && (
                                    <span className="bg-white/10 text-white text-[8px] font-bold px-1 rounded">BOT</span>
                                )}
                            </div>

                            <div className={`flex gap-0.5 my-1 ${isMobile ? 'scale-90 origin-left' : ''}`}>
                                {isDead ? (
                                    <span className="text-red-500 font-black text-xs uppercase">ELIMINADO</span>
                                ) : (
                                    renderLives(p.lives, p.color)
                                )}
                            </div>

                            <div className="flex flex-col mt-1">
                                <p className={`font-black drop-shadow-lg ${getDamageColor(p.percentage)} ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                                    {p.percentage}%
                                </p>
                            </div>

                            {/* Dash cooldown progress */}
                            {!isDead && p.dashCooldown > 0 && (
                                <div className="w-full bg-white/5 rounded-full h-1 mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-white transition-all duration-100"
                                        style={{ width: `${Math.max(0, 100 - (p.dashCooldown / 120) * 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}