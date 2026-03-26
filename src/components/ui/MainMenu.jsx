import React from 'react';
import { Upload, Mic, Gamepad2, Cpu, Volume2 } from 'lucide-react';

export default function MainMenu({ isP2Bot, setIsP2Bot, onStartFile, onStartMic }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm">
            <div className="bg-[#0a0a19]/90 backdrop-blur-md border border-white/10 p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-2xl w-full text-center">

                <h1 className="text-6xl font-black mb-2 tracking-tighter" style={{ textShadow: '0 0 10px #ff00ff, 0 0 40px #ff00ff' }}>
                    BEAT BRAWLERS
                </h1>
                <h2 className="text-2xl font-bold mb-6 text-gray-300 flex items-center justify-center gap-2">
                    <Volume2 className="text-pink-500" /> SUPERVIVENCIA SÓNICA
                </h2>

                <p className="text-gray-400 mb-6 text-sm">
                    Choca contra tu rival para subir su %. Las barras desaparecen con el silencio. ¡Empuja a tu enemigo al vacío al ritmo del Drop!<br />
                    <span className="text-pink-400 font-bold tracking-widest mt-2 inline-block">P1: W A D</span> &nbsp;|&nbsp; <span className="text-cyan-400 font-bold tracking-widest mt-2 inline-block">P2: FLECHAS</span>
                </p>

                <div className="mb-8 bg-black/60 p-4 rounded-xl border border-gray-700/50 flex justify-center items-center gap-4 transition-colors">
                    <span className="text-lg font-bold text-gray-300 flex items-center gap-2"><Gamepad2 size={20} /> Oponente:</span>
                    <button
                        onClick={() => setIsP2Bot(!isP2Bot)}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${isP2Bot ? 'bg-cyan-500' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isP2Bot ? 'translate-x-9' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-lg font-bold w-28 text-left ${isP2Bot ? 'text-cyan-400' : 'text-gray-400'}`}>
                        {isP2Bot ? <><Cpu size={18} className="inline mr-1" /> CPU</> : 'Humano'}
                    </span>
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <label className="group relative w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-pink-600 hover:bg-pink-500 cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_25px_rgba(236,72,153,0.8)] transition-all">
                        <Upload size={24} />
                        <span>Cargar Pista (MP3/WAV)</span>
                        <input type="file" accept="audio/*" className="sr-only" onChange={(e) => { if (e.target.files.length) onStartFile(e.target.files[0]) }} />
                    </label>

                    <div className="text-gray-600 font-black text-sm">- O -</div>

                    <button
                        onClick={onStartMic}
                        className="w-full flex justify-center items-center gap-3 py-4 px-4 border-2 border-cyan-500 text-lg font-bold rounded-xl text-cyan-400 hover:bg-cyan-950/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all"
                    >
                        <Mic size={24} />
                        Usar Micrófono (Canta para pelear)
                    </button>
                </div>
            </div>
        </div>
    );
}
