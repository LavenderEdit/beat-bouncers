import React, { useState } from 'react';
import { ArrowLeft, Play, HelpCircle } from 'lucide-react';
import { translations } from '../../utils/i18n';
import { mediaService } from '../../services/mediaService';

export default function GenerateLevelMenu({ setAppState, setJobId, language }) {
    const t = translations[language];
    const [url, setUrl] = useState('');
    const [difficulty, setDifficulty] = useState('normal');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const validateYoutubeUrl = (rawUrl) => {
        const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})/;
        return regex.test(rawUrl.trim());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!url.trim()) {
            setErrorMsg('Por favor ingresa una URL.');
            return;
        }

        if (!validateYoutubeUrl(url)) {
            setErrorMsg('URL de YouTube no válida. Debe ser un enlace de video estándar.');
            return;
        }

        setLoading(true);
        try {
            const res = await mediaService.generateLevel(url.trim(), difficulty);
            if (res && res.jobId) {
                setJobId(res.jobId);
                setAppState('MEDIA_GENERATION_LOADING');
            } else {
                setErrorMsg('El servidor no devolvió una respuesta válida.');
            }
        } catch (err) {
            setErrorMsg(err.message || 'Error al iniciar la generación de nivel.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a19]/90 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-lg w-full text-center max-h-[95vh] overflow-y-auto">
                <div className="flex items-center mb-6">
                    <button onClick={() => setAppState('MENU')} className="text-gray-400 hover:text-white transition-colors shrink-0">
                        <ArrowLeft size={32} />
                    </button>
                    <h2 className="text-2xl font-black flex-1 text-center pr-8 text-white uppercase tracking-tight">
                        GENERAR NIVEL
                    </h2>
                </div>

                <p className="text-gray-400 text-xs sm:text-sm mb-6">
                    Pega una URL de YouTube para que la inteligencia artificial analice su ritmo y cree un mapa rítmico personalizado.
                </p>

                {errorMsg && (
                    <div className="mb-4 py-2 px-3 bg-red-950/80 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
                    <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                            {t.youtubeUrl}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                disabled={loading}
                                className="w-full py-3 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-amber-500 transition-colors"
                            />
                            <Play className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                            {t.difficulty}
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {['easy', 'normal', 'hard', 'expert'].map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setDifficulty(d)}
                                    disabled={loading}
                                    className={`py-2 px-1 rounded-xl text-xs font-black uppercase border transition-all ${
                                        difficulty === d
                                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                            : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    {d === 'easy' && t.diffEasy}
                                    {d === 'normal' && t.diffNormal}
                                    {d === 'hard' && t.diffHard}
                                    {d === 'expert' && 'Expert'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !url.trim()}
                        className="w-full flex justify-center items-center gap-3 py-3 sm:py-4 px-4 mt-2 text-lg font-black rounded-xl text-white bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase"
                    >
                        <span>{t.generateBtn}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
