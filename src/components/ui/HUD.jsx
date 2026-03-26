import React from 'react';
import { Heart } from 'lucide-react';

export default function HUD({ gameState, isP2Bot }) {
    const renderLives = (lives) => Array(Math.max(0, lives)).fill(0).map((_, i) => <Heart key={i} size={24} fill="currentColor" />);
    const getDamageColor = (percent) => percent > 100 ? 'text-red-500' : (percent > 50 ? 'text-orange-400' : 'text-white');

    return (
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
            <div className="text-left bg-black/60 backdrop-blur-sm p-4 rounded-2xl border-l-4 border-pink-500 shadow-lg min-w-[200px]">
                <h3 className="text-2xl font-black text-pink-500" style={{ textShadow: '0 0 10px #ff00ff' }}>P1</h3>
                <div className="flex gap-1 text-pink-500 my-2">{renderLives(gameState.p1.lives)}</div>
                <p className={`text-6xl font-black drop-shadow-lg ${getDamageColor(gameState.p1.percent)}`}>{gameState.p1.percent}%</p>
            </div>

            <div className="text-center bg-black/60 backdrop-blur-sm px-8 py-3 rounded-2xl border border-white/10 shadow-lg">
                <p className={`text-red-500 font-black text-xl mb-1 transition-opacity duration-300 ${gameState.erratic ? 'opacity-100 animate-pulse' : 'opacity-0'}`}>
                    ¡TERRENO ERRÁTICO!
                </p>
                <p className="text-gray-400 text-xs tracking-[0.2em] uppercase font-bold">Tiempo</p>
                <p className="text-4xl font-black text-white font-mono">{gameState.time}s</p>
            </div>

            <div className="text-right bg-black/60 backdrop-blur-sm p-4 rounded-2xl border-r-4 border-cyan-500 shadow-lg min-w-[200px]">
                <h3 className="text-2xl font-black text-cyan-500" style={{ textShadow: '0 0 10px #00ffff' }}>{isP2Bot ? 'CPU' : 'P2'}</h3>
                <div className="flex gap-1 text-cyan-500 my-2 justify-end">{renderLives(gameState.p2.lives)}</div>
                <p className={`text-6xl font-black drop-shadow-lg ${getDamageColor(gameState.p2.percent)}`}>{gameState.p2.percent}%</p>
            </div>
        </div>
    );
}