import React from 'react';
import { Upload, Mic, ArrowLeft, Disc } from 'lucide-react';
import { translations } from '../../utils/i18n';

export default function SetupMenu({ isP2Bot, onStartFile, onStartMic, onStartUrl, setAppState, language }) {
    const t = translations[language];

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm">
            <div className="bg-[#0a0a19]/90 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-xl w-full text-center">
                <div className="flex items-center mb-6">
                    <button onClick={() => setAppState('MENU')} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={32} />
                    </button>
                    <h2 className="text-3xl font-black flex-1 text-center pr-8 text-white uppercase">
                        {isP2Bot ? t.modeCpu : t.modeLocal}
                    </h2>
                </div>
                <p className="text-gray-400 mb-6 text-sm">{t.uploadDesc}</p>

                <div className="flex flex-col gap-4 w-full">
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => onStartUrl('/audio/tracks/track1.mp3')} className="flex flex-col justify-center items-center gap-2 py-4 px-2 border-2 border-purple-500 rounded-xl text-purple-400 hover:bg-purple-900/50 hover:scale-105 transition-all font-bold">
                            <Disc size={24} /> {t.track1Btn}
                        </button>
                        <button onClick={() => onStartUrl('/audio/tracks/track2.mp3')} className="flex flex-col justify-center items-center gap-2 py-4 px-2 border-2 border-indigo-500 rounded-xl text-indigo-400 hover:bg-indigo-900/50 hover:scale-105 transition-all font-bold">
                            <Disc size={24} /> {t.track2Btn}
                        </button>
                        <button onClick={() => onStartUrl('/audio/tracks/track3.mp3')} className="flex flex-col justify-center items-center gap-2 py-4 px-2 border-2 border-indigo-500 rounded-xl text-indigo-400 hover:bg-indigo-900/50 hover:scale-105 transition-all font-bold">
                            <Disc size={24} /> {t.track3Btn}
                        </button>
                        <button onClick={() => onStartUrl('/audio/tracks/track4.mp3')} className="flex flex-col justify-center items-center gap-2 py-4 px-2 border-2 border-indigo-500 rounded-xl text-indigo-400 hover:bg-indigo-900/50 hover:scale-105 transition-all font-bold">
                            <Disc size={24} /> {t.track4Btn}
                        </button>
                    </div>

                    <div className="text-gray-600 font-black text-sm my-2">- O -</div>

                    <label className="group relative w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent text-xl font-bold rounded-xl text-white bg-pink-600 hover:bg-pink-500 cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:scale-105 transition-all">
                        <Upload size={28} />
                        <span>{t.uploadBtn}</span>
                        <input type="file" accept="audio/*" className="sr-only" onChange={(e) => { if (e.target.files.length) onStartFile(e.target.files[0]) }} />
                    </label>

                    <button onClick={onStartMic} className="w-full flex justify-center items-center gap-3 py-4 px-4 border-2 border-cyan-500 text-xl font-bold rounded-xl text-cyan-400 hover:bg-cyan-950/80 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:scale-105 transition-all">
                        <Mic size={28} /> {t.micBtn}
                    </button>
                </div>
            </div>
        </div>
    );
}