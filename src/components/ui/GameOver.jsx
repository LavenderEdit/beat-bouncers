import React from 'react';
import { RotateCcw } from 'lucide-react';
import { translations } from '../../utils/i18n';

export default function GameOver({ endResult, onRestart, language }) {
    const t = translations[language] || translations['es'];

    let resultText = "";
    if (endResult.type === 'tie') resultText = t.tie;
    else if (endResult.type === 'cpu') resultText = t.cpuWins;
    else if (endResult.type === 'p1') resultText = t.p1Wins;
    else if (endResult.type === 'p2') resultText = t.p2Wins;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/90 backdrop-blur-md animate-in fade-in duration-500 p-4 text-center">

            <h2 className="text-gray-400 font-black tracking-[0.2em] sm:tracking-[0.5em] mb-2 sm:mb-4 text-sm sm:text-xl md:text-2xl uppercase">
                {t.gameOver}
            </h2>

            <h1 className={`text-4xl sm:text-5xl md:text-7xl font-black mb-8 sm:mb-10 tracking-tighter uppercase leading-tight ${endResult.color}`} style={{ textShadow: `0 0 30px currentColor` }}>
                {resultText}
            </h1>

            <button
                onClick={onRestart}
                className="flex items-center gap-2 sm:gap-3 py-3 px-6 sm:py-4 sm:px-10 bg-white text-black font-black rounded-full hover:bg-gray-300 hover:scale-105 transition-all text-lg sm:text-2xl"
            >
                <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8" /> {t.rematch}
            </button>

        </div>
    );
}