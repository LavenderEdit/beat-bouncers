import React, { useEffect } from 'react';
import { GameEngine } from '../game/core/GameEngine';

export default function GameCanvas({ canvasRef, engineRef, onStateUpdate, onGameOver }) {
    // Inicialización controlada por el padre (App.jsx)
    return <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />;
}
