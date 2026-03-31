import React, { useState } from 'react';
import { ArrowLeft, Save, Volume2 } from 'lucide-react';
import { saveSettings, defaultSettings } from '../../utils/storage';
import { translations } from '../../utils/i18n';

export default function SettingsMenu({ settings, setSettings, setAppState }) {
    const [localSet, setLocalSet] = useState(settings || defaultSettings);
    const t = translations[localSet.language];

    const handleSave = () => {
        saveSettings(localSet);
        setSettings(localSet);
        setAppState('MENU');
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/60 backdrop-blur-md p-4">
            <div className="bg-[#0a0a19]/90 border border-white/10 p-6 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-lg w-full text-center max-h-[95vh] overflow-y-auto">
                <h2 className="text-3xl sm:text-4xl font-black mb-6 text-white">{t.settings}</h2>

                <div className="flex flex-col gap-4 sm:gap-5 text-left mb-6 sm:mb-8">

                    <div>
                        <label className="text-gray-300 font-bold mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <Volume2 size={20} /> {t.volMaster}: {Math.round(localSet.volume * 100)}%
                        </label>
                        <input type="range" min="0" max="1" step="0.05" value={localSet.volume} onChange={(e) => setLocalSet({ ...localSet, volume: parseFloat(e.target.value) })} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="text-gray-300 font-bold mb-1 block text-sm sm:text-base">{t.language}</label>
                            <select value={localSet.language} onChange={(e) => setLocalSet({ ...localSet, language: e.target.value })} className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 sm:p-3 outline-none text-sm sm:text-base">
                                <option value="es">Español</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-gray-300 font-bold mb-1 block text-sm sm:text-base">{t.lives}</label>
                            <select value={localSet.lives} onChange={(e) => setLocalSet({ ...localSet, lives: parseInt(e.target.value) })} className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 sm:p-3 outline-none text-sm sm:text-base">
                                <option value={1}>1</option>
                                <option value={3}>3</option>
                                <option value={5}>5</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="text-gray-300 font-bold mb-1 block text-sm sm:text-base">{t.theme}</label>
                            <select value={localSet.theme} onChange={(e) => setLocalSet({ ...localSet, theme: e.target.value })} className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 sm:p-3 outline-none text-sm sm:text-base">
                                <option value="neon">{t.themeNeon}</option>
                                <option value="matrix">{t.themeMatrix}</option>
                                <option value="blood">{t.themeBlood}</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-gray-300 font-bold mb-1 block text-sm sm:text-base">{t.botDifficulty}</label>
                            <select value={localSet.botDifficulty} onChange={(e) => setLocalSet({ ...localSet, botDifficulty: e.target.value })} className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 sm:p-3 outline-none text-sm sm:text-base">
                                <option value="easy">{t.diffEasy}</option>
                                <option value="normal">{t.diffNormal}</option>
                                <option value="hard">{t.diffHard}</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 sm:mt-2">
                        <label className="text-gray-300 font-bold text-sm sm:text-base">{t.particles}</label>
                        <input type="checkbox" checked={localSet.particles} onChange={(e) => setLocalSet({ ...localSet, particles: e.target.checked })} className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-gray-800 border-gray-600 accent-cyan-500 cursor-pointer" />
                    </div>
                </div>

                <div className="flex justify-between gap-3 sm:gap-4">
                    <button onClick={() => setAppState('MENU')} className="flex-1 py-2 sm:py-3 px-4 border border-gray-600 font-bold rounded-xl text-gray-300 hover:bg-gray-800 transition-all text-sm sm:text-base">{t.cancel}</button>
                    <button onClick={handleSave} className="flex-1 py-2 sm:py-3 px-4 font-bold rounded-xl text-white bg-pink-600 hover:bg-pink-500 transition-all flex justify-center items-center gap-2 text-sm sm:text-base"><Save size={18} /> {t.save}</button>
                </div>
            </div>
        </div>
    );
}