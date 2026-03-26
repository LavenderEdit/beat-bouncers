import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function GameOver({ endResult, onRestart }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
            <h2 className="text-gray-400 font-black tracking-[0.5em] mb-4 text-2xl">¡FIN DE LA PARTIDA!</h2>
            <h1 className={`text-7xl font-black mb-10 tracking-tighter uppercase ${endResult.color}`} style={{ textShadow: `0 0 30px currentColor` }}>
                {endResult.text}
            </h1>
            <button
                onClick={onRestart}
                className="flex items-center gap-3 py-4 px-10 bg-white text-black font-black rounded-full hover:bg-gray-300 hover:scale-105 transition-all text-2xl"
            >
                <RotateCcw size={28} />
                MENÚ PRINCIPAL
            </button>
        </div>
    );
}
