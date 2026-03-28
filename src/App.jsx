import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { GameEngine } from './game/core/GameEngine';
import { loadSettings } from './utils/storage';
import { translations } from './utils/i18n';

import MainMenu from './components/ui/MainMenu';
import SetupMenu from './components/ui/SetupMenu';
import SettingsMenu from './components/ui/SettingsMenu';
import ReadyRoom from './components/ui/ReadyRoom';
import HUD from './components/ui/HUD';
import GameOver from './components/ui/GameOver';
import GameCanvas from './components/GameCanvas';

export default function App() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  const [appState, setAppState] = useState('MENU');
  const [isP2Bot, setIsP2Bot] = useState(false);
  const [endResult, setEndResult] = useState({ type: '', color: '' });

  const [settings, setSettings] = useState(loadSettings());
  const t = translations[settings.language] || translations.es;

  const [gameState, setGameState] = useState({
    p1: { lives: settings.lives, percent: 0 },
    p2: { lives: settings.lives, percent: 0 },
    erratic: false,
    time: "0.0"
  });

  const handleStateUpdate = useCallback((newState) => {
    setGameState(prev => ({ ...prev, ...newState }));
  }, []);

  const handleGameOver = useCallback((result) => {
    setEndResult(result);
    setAppState('GAMEOVER');
  }, []);

  const prepareGame = async (sourceType, file = null) => {
    setAppState('LOADING');

    if (engineRef.current) engineRef.current.cleanup();
    engineRef.current = new GameEngine(canvasRef.current, handleStateUpdate, handleGameOver, settings);

    try {
      await engineRef.current.initAudio(sourceType, isP2Bot, file);
      setAppState('READY_ROOM');
      setGameState({
        p1: { lives: settings.lives, percent: 0 },
        p2: { lives: settings.lives, percent: 0 },
        erratic: false,
        time: "0.0"
      });
    } catch (err) {
      console.error(err);
      alert("Error al inicializar audio. Verifica permisos o usa un archivo válido.");
      setAppState('MENU');
    }
  };

  const startMatch = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.startMatch();
      setAppState('PLAYING');
    }
  }, []);

  const returnToMenu = () => {
    if (engineRef.current) engineRef.current.cleanup();
    setAppState('MENU');
  };

  useEffect(() => {
    return () => {
      if (engineRef.current) engineRef.current.cleanup();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#050510] text-white overflow-hidden font-sans select-none">

      <GameCanvas canvasRef={canvasRef} />

      {appState === 'MENU' && (
        <MainMenu setAppState={setAppState} setIsP2Bot={setIsP2Bot} language={settings.language} />
      )}

      {appState === 'SETUP' && (
        <SetupMenu isP2Bot={isP2Bot} setAppState={setAppState} onStartFile={(file) => prepareGame('file', file)} onStartMic={() => prepareGame('mic')} language={settings.language} />
      )}

      {appState === 'SETTINGS' && (
        <SettingsMenu settings={settings} setSettings={setSettings} setAppState={setAppState} />
      )}

      {appState === 'LOADING' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80">
          <div className="text-pink-400 font-bold text-2xl animate-pulse flex items-center gap-3">
            <Volume2 className="animate-bounce" size={32} />
            {t.loading}
          </div>
        </div>
      )}

      {appState === 'READY_ROOM' && (
        <ReadyRoom engineRef={engineRef} isP2Bot={isP2Bot} language={settings.language} onStartMatch={startMatch} />
      )}

      {appState === 'PLAYING' && (
        <HUD gameState={gameState} isP2Bot={isP2Bot} language={settings.language} />
      )}

      {appState === 'GAMEOVER' && (
        <GameOver endResult={endResult} onRestart={returnToMenu} language={settings.language} />
      )}
    </div>
  );
}