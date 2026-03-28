import React from 'react';
import { Upload, Mic, ArrowLeft } from 'lucide-react';
import { translations } from '../../utils/i18n';

export default function SetupMenu({ isP2Bot, onStartFile, onStartMic, setAppState, language }) {
    const t = translations[language];

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm">
            <div className="bg-[#0a0a19]/90 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-xl w-full text-center">
                <div className="flex items-center mb-8">
                    <button onClick={() => setAppState('MENU')} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={32} />
                    </button>
                    <h2 className="text-3xl font-black flex-1 text-center pr-8 text-white uppercase">
                        {isP2Bot ? t.modeCpu : t.modeLocal}
                    </h2>
                </div>
                <p className="text-gray-400 mb-8 text-sm">{t.uploadDesc}</p>

                <div className="flex flex-col gap-4 w-full">
                    <label className="group relative w-full flex justify-center items-center gap-3 py-5 px-4 border border-transparent text-xl font-bold rounded-xl text-white bg-pink-600 hover:bg-pink-500 cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:scale-105 transition-all">
                        <Upload size={28} />
                        <span>{t.uploadBtn}</span>
                        <input type="file" accept="audio/*" className="sr-only" onChange={(e) => { if (e.target.files.length) onStartFile(e.target.files[0]) }} />
                    </label>
                    <div className="text-gray-600 font-black text-sm my-2">- O -</div>
                    <button onClick={onStartMic} className="w-full flex justify-center items-center gap-3 py-5 px-4 border-2 border-cyan-500 text-xl font-bold rounded-xl text-cyan-400 hover:bg-cyan-950/80 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:scale-105 transition-all">
                        <Mic size={28} /> {t.micBtn}
                    </button>
                </div>
            </div>
        </div>
    );
}