import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { GameEngine } from './game/core/GameEngine';
import MainMenu from './components/ui/MainMenu';
import HUD from './components/ui/HUD';
import GameOver from './components/ui/GameOver';
import GameCanvas from './components/GameCanvas';

export default function App() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  
  const [appState, setAppState] = useState('MENU'); 
  const [isP2Bot, setIsP2Bot] = useState(false);
  const [endResult, setEndResult] = useState({ text: '', color: '' });
  
  const [gameState, setGameState] = useState({
    p1: { lives: 3, percent: 0 },
    p2: { lives: 3, percent: 0 },
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

  const startGame = async (sourceType, file = null) => {
    setAppState('LOADING');
    
    if (engineRef.current) engineRef.current.cleanup();
    engineRef.current = new GameEngine(canvasRef.current, handleStateUpdate, handleGameOver);
    
    try {
      await engineRef.current.initAudio(sourceType, isP2Bot, file);
      setAppState('PLAYING');
    } catch (err) {
      console.error(err);
      alert("Error al inicializar audio. Verifica permisos o usa un archivo válido.");
      setAppState('MENU');
    }
  };

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
      
      <GameCanvas 
        canvasRef={canvasRef} 
        engineRef={engineRef} 
        onStateUpdate={handleStateUpdate} 
        onGameOver={handleGameOver} 
      />

      {appState === 'MENU' && (
        <MainMenu 
          isP2Bot={isP2Bot} 
          setIsP2Bot={setIsP2Bot} 
          onStartFile={(file) => startGame('file', file)}
          onStartMic={() => startGame('mic')}
        />
      )}

      {appState === 'LOADING' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80">
          <div className="text-pink-400 font-bold text-2xl animate-pulse flex items-center gap-3">
            <Volume2 className="animate-bounce" size={32} />
            Iniciando motor de físicas y audio...
          </div>
        </div>
      )}

      {appState === 'PLAYING' && (
        <HUD gameState={gameState} isP2Bot={isP2Bot} />
      )}

      {appState === 'GAMEOVER' && (
        <GameOver endResult={endResult} onRestart={returnToMenu} />
      )}

    </div>
  );
}