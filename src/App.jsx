import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, RotateCcw } from 'lucide-react';
import { loadSettings } from './utils/storage';
import { translations } from './utils/i18n';

// Engine & Render System
import { LocalGameEngine } from './game/core/LocalGameEngine';
import { NetworkGameEngine } from './game/core/NetworkGameEngine';
import { GameLoop } from './game/core/GameLoop';
import { CanvasRenderer } from './game/rendering/CanvasRenderer';

// UI Screens
import MainMenu from './components/ui/MainMenu';
import SetupMenu from './components/ui/SetupMenu';
import SettingsMenu from './components/ui/SettingsMenu';
import ReadyRoom from './components/ui/ReadyRoom';
import HUD from './components/ui/HUD';
import GameOver from './components/ui/GameOver';
import GameCanvas from './components/GameCanvas';
import TouchControls from './components/ui/TouchControls';

// Multiplayer UI Screens
import MultiplayerMenu from './components/ui/MultiplayerMenu';
import MultiplayerQueue from './components/ui/MultiplayerQueue';
import MultiplayerReadyRoom from './components/ui/MultiplayerReadyRoom';

// YouTube Generation UI Screens
import GenerateLevelMenu from './components/ui/GenerateLevelMenu';
import GenerationProgress from './components/ui/GenerationProgress';
import GeneratedReadyScreen from './components/ui/GeneratedReadyScreen';

export default function App() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const loopRef = useRef(null);

  const [appState, setAppState] = useState('MENU');
  const [isP2Bot, setIsP2Bot] = useState(false);
  const [endResult, setEndResult] = useState({ type: '', color: '' });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Nickname & Online states
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [initialRoomState, setInitialRoomState] = useState(null);
  const [jobId, setJobId] = useState('');
  const [generatedLevel, setGeneratedLevel] = useState(null);

  const [settings, setSettings] = useState(loadSettings());
  const t = translations[settings.language] || translations.es;

  const [gameState, setGameState] = useState({
    players: [],
    erratic: false,
    suddenDeath: false,
    sdTransition: false,
    sdCountdown: 0,
    sdTimeLeft: 0,
    trackTitle: '',
    time: "0.0"
  });

  const handleStateUpdate = useCallback((newState) => {
    setGameState(prev => ({ ...prev, ...newState }));
  }, []);

  const handleGameOver = useCallback((result) => {
    setEndResult(result);
    
    // Stop loops
    if (loopRef.current) loopRef.current.stop();
    
    // Set appropriate gameover state
    setAppState(prev => prev === 'MULTIPLAYER_PLAYING' ? 'MULTIPLAYER_GAMEOVER' : 'GAMEOVER');
  }, []);

  /**
   * Initializes a local offline game (Standard track, mic, or YouTube generated level).
   */
  const prepareGame = async (sourceType, fileOrUrl = null) => {
    setAppState('LOADING');

    if (loopRef.current) loopRef.current.stop();
    if (engineRef.current) engineRef.current.cleanup();

    const isGenerated = sourceType === 'generated';
    const levelConfig = isGenerated ? fileOrUrl : null;
    const audioData = isGenerated ? fileOrUrl : fileOrUrl;

    const engine = new LocalGameEngine(
      canvasRef.current, 
      handleStateUpdate, 
      handleGameOver, 
      settings, 
      levelConfig
    );
    engineRef.current = engine;

    try {
      await engine.initAudio(sourceType, isP2Bot, audioData);
      setAppState('READY_ROOM');

      // Populate initial HUD player slots
      setGameState({
        players: engine.players.map(p => ({
            id: p.id,
            name: p.name,
            color: p.color,
            lives: p.lives,
            percentage: p.percentage,
            dashCooldown: p.dashCooldown
        })),
        erratic: false,
        suddenDeath: false,
        sdTransition: false,
        sdCountdown: 0,
        sdTimeLeft: 0,
        trackTitle: isGenerated ? levelConfig.title : "Pista Local",
        time: "0.0"
      });

      // Start Logic/Render Game Loop
      const loop = new GameLoop();
      loopRef.current = loop;
      const renderer = new CanvasRenderer();

      loop.start(
        (stepMs) => {
          if (engineRef.current) {
            engineRef.current.update(stepMs);
          }
        },
        () => {
          if (canvasRef.current && engineRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            const state = engineRef.current.getState();
            renderer.draw(ctx, state, settings);
          }
        }
      );

    } catch (err) {
      console.error(err);
      alert("Error al inicializar audio. Verifica permisos o usa un archivo válido.");
      setAppState('MENU');
    }
  };

  /**
   * Triggers starting of a local match.
   */
  const startMatch = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.startMatch();
      setAppState('PLAYING');
    }
  }, []);

  /**
   * Initializes an online multiplayer game.
   */
  const startMultiplayerGame = useCallback(() => {
    if (loopRef.current) loopRef.current.stop();
    if (engineRef.current) engineRef.current.cleanup();

    const engine = new NetworkGameEngine(
      canvasRef.current,
      handleStateUpdate,
      handleGameOver,
      settings,
      roomId
    );
    engineRef.current = engine;

    // Start Multiplayer Loop
    const loop = new GameLoop();
    loopRef.current = loop;
    const renderer = new CanvasRenderer();

    loop.start(
      (stepMs) => {
        if (engineRef.current) {
          engineRef.current.update(stepMs);
        }
      },
      () => {
        if (canvasRef.current && engineRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          const state = engineRef.current.getState();
          renderer.draw(ctx, state, settings);
        }
      }
    );
  }, [roomId, settings]);

  const returnToMenu = () => {
    if (loopRef.current) loopRef.current.stop();
    if (engineRef.current) engineRef.current.cleanup();
    setAppState('MENU');
  };

  // Trigger loading multiplayer arena once room transitions to PLAYING
  useEffect(() => {
    if (appState === 'MULTIPLAYER_PLAYING') {
      startMultiplayerGame();
    }
  }, [appState]);

  useEffect(() => {
    setIsTouchDevice(('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    return () => {
      if (loopRef.current) loopRef.current.stop();
      if (engineRef.current) engineRef.current.cleanup();
    };
  }, []);

  return (
    <div className="relative w-screen h-[100dvh] bg-[#050510] text-white overflow-hidden font-sans select-none">

      <div className="fixed inset-0 z-[9999] bg-[#050510] flex-col items-center justify-center text-white hidden portrait:flex">
        <RotateCcw size={64} className="mb-6 animate-spin text-pink-500" />
        <h2 className="text-3xl font-black text-center mb-2 tracking-tighter">¡GIRA TU TELÉFONO!</h2>
        <p className="text-gray-400 text-center px-8 text-sm">Beat Bouncers requiere modo horizontal (Landscape) para jugarse correctamente.</p>
      </div>

      <GameCanvas canvasRef={canvasRef} />

      {/* Main Menus */}
      {appState === 'MENU' && (
        <MainMenu setAppState={setAppState} setIsP2Bot={setIsP2Bot} language={settings.language} />
      )}

      {appState === 'SETUP' && (
        <SetupMenu
          isP2Bot={isP2Bot}
          setAppState={setAppState}
          onStartFile={(file) => prepareGame('file', file)}
          onStartMic={() => prepareGame('mic')}
          onStartUrl={(url) => prepareGame('url', url)}
          language={settings.language}
        />
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
        <HUD gameState={gameState} language={settings.language} />
      )}

      {appState === 'GAMEOVER' && (
        <GameOver endResult={endResult} onRestart={returnToMenu} language={settings.language} />
      )}

      {/* 🌐 MULTIPLAYER FLOW SCREENS */}
      {appState === 'MULTIPLAYER_MENU' && (
        <MultiplayerMenu
          setAppState={setAppState}
          nickname={nickname}
          setNickname={setNickname}
          language={settings.language}
        />
      )}

      {appState === 'MULTIPLAYER_QUEUE' && (
        <MultiplayerQueue
          setAppState={setAppState}
          roomId={roomId}
          setRoomId={setRoomId}
          setInitialRoomState={setInitialRoomState}
          language={settings.language}
        />
      )}

      {appState === 'MULTIPLAYER_READY' && (
        <MultiplayerReadyRoom
          setAppState={setAppState}
          roomId={roomId}
          initialRoomState={initialRoomState}
          language={settings.language}
        />
      )}

      {appState === 'MULTIPLAYER_PLAYING' && (
        <HUD gameState={gameState} language={settings.language} />
      )}

      {appState === 'MULTIPLAYER_GAMEOVER' && (
        <GameOver endResult={endResult} onRestart={returnToMenu} language={settings.language} />
      )}

      {/* 📹 YOUTUBE LEVEL GENERATION FLOW SCREENS */}
      {appState === 'MEDIA_GENERATION_MENU' && (
        <GenerateLevelMenu
          setAppState={setAppState}
          setJobId={setJobId}
          language={settings.language}
        />
      )}

      {appState === 'MEDIA_GENERATION_LOADING' && (
        <GenerationProgress
          setAppState={setAppState}
          jobId={jobId}
          setGeneratedLevel={setGeneratedLevel}
          language={settings.language}
        />
      )}

      {appState === 'MEDIA_GENERATION_READY' && (
        <GeneratedReadyScreen
          setAppState={setAppState}
          generatedLevel={generatedLevel}
          setIsP2Bot={setIsP2Bot}
          onLaunchGeneratedGame={(levelData) => prepareGame('generated', levelData)}
          language={settings.language}
        />
      )}

      {/* 📱 TOUCH CONTROLS */}
      {isTouchDevice && (appState === 'PLAYING' || appState === 'READY_ROOM' || appState === 'MULTIPLAYER_PLAYING') && (
        <TouchControls engineRef={engineRef} />
      )}
    </div>
  );
}