import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import { translations } from '../../utils/i18n';
import { mediaService } from '../../services/mediaService';

export default function GenerationProgress({ setAppState, jobId, setGeneratedLevel, language }) {
    const t = translations[language];
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('waiting'); // waiting | active | completed | failed | error
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        let isMounted = true;
        let pollTimer = null;

        const pollStatus = async () => {
            try {
                const job = await mediaService.getJobStatus(jobId);
                if (!isMounted) return;

                if (job.status === 'completed' && job.result) {
                    setStatus('completed');
                    setProgress(100);
                    
                    // Fetch full level JSON configuration
                    const levelData = await mediaService.getLevel(job.result.levelId);
                    
                    if (isMounted) {
                        setGeneratedLevel(levelData);
                        setAppState('MEDIA_GENERATION_READY');
                    }
                } else if (job.status === 'failed') {
                    setStatus('failed');
                    setErrorMsg(job.failedReason || t.genError);
                } else {
                    // Update progress if available
                    if (typeof job.progress === 'number') {
                        setProgress(job.progress);
                    }
                    setStatus(job.status || 'active');
                    
                    // Poll again in 1.5 seconds
                    pollTimer = setTimeout(pollStatus, 1500);
                }
            } catch (err) {
                if (isMounted) {
                    setStatus('error');
                    setErrorMsg(err.message || 'Error al conectar con el servidor.');
                }
            }
        };

        pollStatus();

        return () => {
            isMounted = false;
            if (pollTimer) clearTimeout(pollTimer);
        };
    }, [jobId]);

    const handleBack = () => {
        setAppState('MEDIA_GENERATION_MENU');
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a19]/90 backdrop-blur-md border border-white/10 p-6 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-md w-full text-center max-h-[95vh] overflow-y-auto">
                
                {status === 'failed' || status === 'error' ? (
                    <>
                        <AlertTriangle className="text-red-500 mx-auto mb-6 w-16 h-16" />
                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                            ERROR DE ANÁLISIS
                        </h2>
                        <p className="text-gray-400 text-xs sm:text-sm mb-6">
                            {errorMsg || 'No se pudo procesar la pista de audio.'}
                        </p>
                        <button
                            onClick={handleBack}
                            className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-600 text-base font-bold rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-all uppercase"
                        >
                            <ArrowLeft size={18} />
                            <span>VOLVER</span>
                        </button>
                    </>
                ) : (
                    <>
                        <RefreshCw className="animate-spin text-amber-500 mx-auto mb-6 w-12 h-12 sm:w-16 sm:h-16" />
                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                            {t.generating}
                        </h2>
                        <p className="text-gray-400 text-xs sm:text-sm mb-6">
                            Descargando audio y extrayendo el ritmo. Esto puede tomar hasta un minuto.
                        </p>

                        <div className="w-full bg-white/5 rounded-full h-3 border border-white/10 overflow-hidden mb-4">
                            <div
                                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-400 font-bold font-mono">
                            <span className="uppercase">{status}</span>
                            <span>{progress}%</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
