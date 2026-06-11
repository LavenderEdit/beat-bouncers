import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { translations } from '../../utils/i18n';
import { checkBackendHealth } from '../../services/backendStatus';
import { socketClient } from '../../services/socketClient';

export default function MultiplayerMenu({ setAppState, setNickname, nickname, language }) {
    const t = translations[language];
    const [status, setStatus] = useState('checking'); // checking | online | offline
    const [localName, setLocalName] = useState(nickname || localStorage.getItem('nickname') || '');
    const [connecting, setConnecting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const verifyHealth = async () => {
        setStatus('checking');
        const isHealthy = await checkBackendHealth();
        setStatus(isHealthy ? 'online' : 'offline');
    };

    useEffect(() => {
        verifyHealth();
    }, []);

    const handleConnect = async (e) => {
        e.preventDefault();
        if (!localName.trim()) {
            setErrorMsg('Por favor ingresa un apodo válido.');
            return;
        }
        setErrorMsg('');
        setConnecting(true);
        
        localStorage.setItem('nickname', localName);
        setNickname(localName);

        try {
            socketClient.connect(
                localName,
                () => {
                    setConnecting(false);
                    setAppState('MULTIPLAYER_QUEUE');
                },
                (reason) => {
                    setConnecting(false);
                    setErrorMsg(`Desconectado: ${reason}`);
                },
                (err) => {
                    setConnecting(false);
                    setErrorMsg(`Error de conexión: ${err.message || err}`);
                }
            );
        } catch (err) {
            setConnecting(false);
            setErrorMsg(err.message || 'Error al inicializar la conexión.');
        }
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a19]/90 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-md w-full text-center relative max-h-[95vh] overflow-y-auto">
                <div className="flex items-center mb-6">
                    <button onClick={() => setAppState('MENU')} className="text-gray-400 hover:text-white transition-colors shrink-0">
                        <ArrowLeft size={32} />
                    </button>
                    <h2 className="text-2xl font-black flex-1 text-center pr-8 text-white uppercase tracking-tight">
                        {t.onlinePlay}
                    </h2>
                </div>

                <div className="flex items-center justify-center gap-2 mb-6 py-2 px-4 rounded-xl bg-white/5 border border-white/5">
                    {status === 'checking' && (
                        <>
                            <RefreshCw className="animate-spin text-amber-400" size={18} />
                            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Verificando Servidor...</span>
                        </>
                    )}
                    {status === 'online' && (
                        <>
                            <Wifi className="text-cyan-400 animate-pulse" size={18} />
                            <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Servidor En Línea</span>
                        </>
                    )}
                    {status === 'offline' && (
                        <>
                            <WifiOff className="text-red-500" size={18} />
                            <span className="text-xs text-red-500 font-bold uppercase tracking-wider">{t.offlineWarn}</span>
                        </>
                    )}
                    <button onClick={verifyHealth} className="ml-auto text-gray-400 hover:text-white transition-all">
                        <RefreshCw size={14} />
                    </button>
                </div>

                {errorMsg && (
                    <div className="mb-4 py-2 px-3 bg-red-950/80 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleConnect} className="flex flex-col gap-4">
                    <div className="text-left">
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                            {t.enterNickname}
                        </label>
                        <input
                            type="text"
                            maxLength={15}
                            value={localName}
                            onChange={(e) => setLocalName(e.target.value)}
                            disabled={status !== 'online' || connecting}
                            placeholder="Ej. SonicBouncer"
                            className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status !== 'online' || connecting || !localName.trim()}
                        className="w-full flex justify-center items-center gap-3 py-3 sm:py-4 px-4 text-lg font-black rounded-xl text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {connecting ? (
                            <>
                                <RefreshCw className="animate-spin" size={20} />
                                <span>{t.connecting}</span>
                            </>
                        ) : (
                            <>
                                <Globe size={20} />
                                <span>CONECTAR</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
