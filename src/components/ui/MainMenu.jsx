import React from 'react';
import { Gamepad2, Cpu, Settings, Volume2 } from 'lucide-react';
import { translations } from '../../utils/i18n';

export default function MainMenu({ setAppState, setIsP2Bot, language }) {
    const t = translations[language];

    const handlePlay = (isBot) => {
        setIsP2Bot(isBot);
        setAppState('SETUP');
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a19]/90 backdrop-blur-md border border-white/10 p-6 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-xl w-full text-center max-h-[95vh] overflow-y-auto">

                <img
                    src="/logo.png"
                    alt="Beat Bouncers Logo"
                    className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-3xl shadow-[0_0_30px_#ff00ff] object-cover mb-4 sm:mb-6 border-2 border-pink-500"
                />

                <h1 className="text-4xl sm:text-5xl font-black mb-2 tracking-tighter" style={{ textShadow: '0 0 10px #ff00ff, 0 0 40px #ff00ff' }}>
                    BEAT BOUNCERS
                </h1>
                <h2 className="text-base sm:text-lg font-bold mb-6 sm:mb-10 text-gray-300 flex items-center justify-center gap-2">
                    <Volume2 className="text-pink-500" /> {t.subtitle}
                </h2>

                <div className="flex flex-col gap-3 sm:gap-4 w-full">
                    <button onClick={() => handlePlay(true)} className="w-full flex justify-center items-center gap-3 py-3 sm:py-4 px-4 text-lg sm:text-xl font-black rounded-xl text-white bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] transition-all">
                        <Cpu size={24} /> {t.vsCpu}
                    </button>
                    <button onClick={() => handlePlay(false)} className="w-full flex justify-center items-center gap-3 py-3 sm:py-4 px-4 text-lg sm:text-xl font-black rounded-xl text-white bg-pink-600 hover:bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_25px_rgba(236,72,153,0.8)] transition-all">
                        <Gamepad2 size={24} /> {t.local}
                    </button>
                    <div className="h-px w-full bg-gray-800 my-1 sm:my-2"></div>
                    <button onClick={() => setAppState('SETTINGS')} className="w-full flex justify-center items-center gap-3 py-2 sm:py-3 px-4 border border-gray-600 text-base sm:text-lg font-bold rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-all">
                        <Settings size={20} /> {t.settings}
                    </button>
                </div>
            </div>
        </div>
    );
}