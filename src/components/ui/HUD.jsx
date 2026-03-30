import React from 'react';
import { Heart } from 'lucide-react';
import { translations } from '../../utils/i18n';

export default function HUD({ gameState, isP2Bot, language }) {
    const t = translations[language];
    const renderLives = (lives) => Array(Math.max(0, lives)).fill(0).map((_, i) => <Heart key={i} size={24} fill="currentColor" />);
    const getDamageColor = (percent) => percent >= 150 ? 'text-red-500' : (percent > 80 ? 'text-orange-400' : 'text-white');

    if (gameState.sdTransition) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                <h1 className="text-8xl font-black text-red-600 mb-8 uppercase tracking-tighter drop-shadow-[0_0_40px_rgba(220,38,38,1)]">
                    {t.suddenDeath}
                </h1>
                <p className="text-3xl text-white font-bold mb-4 animate-pulse">
                    {t.sdWarning}
                </p>
                <p className="text-xl text-yellow-400 font-black mb-10 tracking-widest uppercase">
                    {t.sdOnlyDash}
                </p>
                <div className="text-9xl font-black italic text-white drop-shadow-lg">
                    {gameState.sdCountdown}
                </div>
            </div>
        );
    }

    return (
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">

            <div className="text-left bg-black/60 backdrop-blur-sm p-4 rounded-2xl border-l-4 border-pink-500 shadow-lg min-w-[200px]">
                <h3 className="text-2xl font-black text-pink-500" style={{ textShadow: '0 0 10px #ff00ff' }}>P1</h3>
                <div className="flex gap-1 text-pink-500 my-2">{renderLives(gameState.p1.lives)}</div>
                <div className="flex flex-col">
                    <p className={`text-6xl font-black drop-shadow-lg ${getDamageColor(gameState.p1.percent)}`}>{gameState.p1.percent}%</p>
                    <p className="text-xs text-gray-400 font-bold tracking-[0.2em] mt-1 uppercase">Max: 200%</p>
                </div>
                <p className="text-pink-400 font-bold text-sm mt-3 uppercase">DASH: [F]</p>
            </div>

            <div className="text-center bg-black/60 backdrop-blur-sm px-8 py-3 rounded-2xl border border-white/10 shadow-lg flex flex-col items-center">
                <div className="h-8 mb-2 flex items-center justify-center">
                    {gameState.suddenDeath ? (
                        <p className="text-red-600 font-black text-2xl animate-bounce drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">
                            {t.suddenDeath}
                        </p>
                    ) : (
                        <p className={`text-orange-500 font-black text-xl transition-opacity duration-300 ${gameState.erratic ? 'opacity-100 animate-pulse' : 'opacity-0'}`}>
                            {t.erratic}
                        </p>
                    )}
                </div>

                <p className="text-gray-400 text-xs tracking-[0.2em] uppercase font-bold">{t.time}</p>
                <p className={`text-4xl font-black font-mono ${gameState.suddenDeath ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {gameState.suddenDeath ? gameState.sdTimeLeft : gameState.time}s
                </p>
            </div>

            <div className="text-right bg-black/60 backdrop-blur-sm p-4 rounded-2xl border-r-4 border-cyan-500 shadow-lg min-w-[200px]">
                <h3 className="text-2xl font-black text-cyan-500" style={{ textShadow: '0 0 10px #00ffff' }}>{isP2Bot ? 'CPU' : 'P2'}</h3>
                <div className="flex gap-1 text-cyan-500 my-2 justify-end">{renderLives(gameState.p2.lives)}</div>
                <div className="flex flex-col items-end">
                    <p className={`text-6xl font-black drop-shadow-lg ${getDamageColor(gameState.p2.percent)}`}>{gameState.p2.percent}%</p>
                    <p className="text-xs text-gray-400 font-bold tracking-[0.2em] mt-1 uppercase">Max: 200%</p>
                </div>
                <p className="text-cyan-400 font-bold text-sm mt-3 uppercase">DASH: [SHIFT]</p>
            </div>
        </div>
    );
}