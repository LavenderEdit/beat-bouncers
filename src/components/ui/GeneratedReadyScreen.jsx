import React from 'react';
import { ArrowLeft, Cpu, Gamepad2, Music, Clock, BarChart } from 'lucide-react';
import { translations } from '../../utils/i18n';

export default function GeneratedReadyScreen({ setAppState, generatedLevel, setIsP2Bot, onLaunchGeneratedGame, language }) {
    const t = translations[language];

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleStart = (isBot) => {
        setIsP2Bot(isBot);
        onLaunchGeneratedGame(generatedLevel);
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a19]/90 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-lg w-full text-center max-h-[95vh] overflow-y-auto">
                <div className="flex items-center mb-6">
                    <button onClick={() => setAppState('MEDIA_GENERATION_MENU')} className="text-gray-400 hover:text-white transition-colors shrink-0">
                        <ArrowLeft size={32} />
                    </button>
                    <h2 className="text-2xl font-black flex-1 text-center pr-8 text-white uppercase tracking-tight">
                        PISTA COMPILADA
                    </h2>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Music className="text-amber-500 shrink-0" size={24} />
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Título de la Canción</p>
                            <p className="text-white font-black text-lg truncate max-w-[320px]">{generatedLevel?.title || 'Canción Desconocida'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                        <div>
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase mb-1">
                                <Clock size={14} />
                                <span>Duración</span>
                            </div>
                            <p className="text-white font-black text-lg">{formatDuration(generatedLevel?.duration || 0)}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase mb-1">
                                <BarChart size={14} />
                                <span>BPM</span>
                            </div>
                            <p className="text-white font-black text-lg">{generatedLevel?.bpm || 120}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase mb-1 text-amber-400/80">
                                <span>Dificultad</span>
                            </div>
                            <p className="text-amber-400 font-black text-lg uppercase">{generatedLevel?.difficulty || 'Normal'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <button onClick={() => handleStart(true)} className="w-full flex justify-center items-center gap-3 py-3 sm:py-4 px-4 text-lg font-black rounded-xl text-white bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                        <Cpu size={24} /> {t.vsCpu}
                    </button>
                    <button onClick={() => handleStart(false)} className="w-full flex justify-center items-center gap-3 py-3 sm:py-4 px-4 text-lg font-black rounded-xl text-white bg-pink-600 hover:bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all">
                        <Gamepad2 size={24} /> {t.local}
                    </button>
                </div>
            </div>
        </div>
    );
}
