import React, { useRef, useState, useEffect } from 'react';

export default function TouchControls({ engineRef }) {
    const [opacity, setOpacity] = useState(0.4); // customizable opacity
    const joystickAreaRef = useRef(null);
    const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const activeTouchIdRef = useRef(null);
    const startPosRef = useRef({ x: 0, y: 0 });
    const maxRadius = 45; // max drag radius in pixels

    const getTouchSource = () => {
        if (engineRef.current && engineRef.current.touch) {
            return engineRef.current.touch;
        }
        return null;
    };

    const handleJoystickStart = (e) => {
        const touchSource = getTouchSource();
        if (!touchSource) return;

        const rect = joystickAreaRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        setIsDragging(true);
        activeTouchIdRef.current = e.pointerId;
        
        // Pin center position where user initially pressed
        startPosRef.current = { x: clientX, y: clientY };
        setJoystickPos({ x: 0, y: 0 });

        joystickAreaRef.current.setPointerCapture(e.pointerId);
    };

    const handleJoystickMove = (e) => {
        if (!isDragging || e.pointerId !== activeTouchIdRef.current) return;
        const touchSource = getTouchSource();
        if (!touchSource) return;

        const clientX = e.clientX;
        const clientY = e.clientY;

        let dx = clientX - startPosRef.current.x;
        let dy = clientY - startPosRef.current.y;

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > maxRadius) {
            dx = (dx / distance) * maxRadius;
            dy = (dy / distance) * maxRadius;
        }

        setJoystickPos({ x: dx, y: dy });

        // Calculate normalized axis X value (-1 to 1)
        const axisX = dx / maxRadius;
        touchSource.setAxisX(axisX);
    };

    const handleJoystickEnd = (e) => {
        if (!isDragging || e.pointerId !== activeTouchIdRef.current) return;
        const touchSource = getTouchSource();
        if (touchSource) {
            touchSource.setAxisX(0);
        }

        setIsDragging(false);
        activeTouchIdRef.current = null;
        setJoystickPos({ x: 0, y: 0 });

        if (joystickAreaRef.current) {
            try {
                joystickAreaRef.current.releasePointerCapture(e.pointerId);
            } catch (err) {}
        }
    };

    // Right Action Buttons
    const handleJumpStart = (e) => {
        e.preventDefault();
        const touchSource = getTouchSource();
        if (touchSource) touchSource.setJump(true);
    };

    const handleJumpEnd = (e) => {
        e.preventDefault();
        const touchSource = getTouchSource();
        if (touchSource) touchSource.setJump(false);
    };

    const handleDashStart = (e) => {
        e.preventDefault();
        const touchSource = getTouchSource();
        if (touchSource) touchSource.setDash(true);
    };

    const handleDashEnd = (e) => {
        e.preventDefault();
        const touchSource = getTouchSource();
        if (touchSource) touchSource.setDash(false);
    };

    useEffect(() => {
        const preventDefault = (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
                e.preventDefault();
            }
        };
        // Disable context menu on controls
        document.addEventListener('contextmenu', preventDefault);
        return () => {
            document.removeEventListener('contextmenu', preventDefault);
            const touchSource = getTouchSource();
            if (touchSource) touchSource.reset();
        };
    }, []);

    return (
        <div 
            className="absolute inset-x-0 bottom-0 top-auto h-48 z-40 flex justify-between pointer-events-none select-none px-6 pb-6 pt-2 select-none"
            style={{ 
                opacity: opacity, 
                paddingLeft: 'calc(1.5rem + window.safeAreaInsetsLeft || 0px)',
                paddingRight: 'calc(1.5rem + window.safeAreaInsetsRight || 0px)' 
            }}
        >
            {/* Opacity Control slider */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 bg-black/60 py-1 px-3 rounded-full border border-white/10 scale-90">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Opacidad</span>
                <input 
                    type="range" 
                    min="0.1" 
                    max="0.9" 
                    step="0.1" 
                    value={opacity} 
                    onChange={(e) => setOpacity(parseFloat(e.target.value))} 
                    className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>

            {/* Left Analog Joystick */}
            <div 
                ref={joystickAreaRef}
                onPointerDown={handleJoystickStart}
                onPointerMove={handleJoystickMove}
                onPointerUp={handleJoystickEnd}
                onPointerCancel={handleJoystickEnd}
                className="w-40 h-40 rounded-full bg-white/5 border-2 border-white/10 relative flex items-center justify-center pointer-events-auto cursor-pointer"
                style={{ touchAction: 'none' }}
            >
                {/* Outer Ring Guideline */}
                <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center">
                    <span className="text-[9px] text-white/30 font-black tracking-widest">MOVE</span>
                </div>

                {/* Joystick Stick Knob */}
                <div 
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] border border-cyan-300/40 absolute transition-transform duration-75 pointer-events-none"
                    style={{ 
                        transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` 
                    }}
                />
            </div>

            {/* Right Buttons Zone */}
            <div className="flex gap-4 items-center justify-end pointer-events-none">
                {/* DASH Button */}
                <button
                    onPointerDown={handleDashStart}
                    onPointerUp={handleDashEnd}
                    onPointerCancel={handleDashEnd}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-300/20 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center pointer-events-auto active:scale-95 transition-transform"
                    style={{ touchAction: 'none' }}
                >
                    DASH
                </button>

                {/* JUMP Button */}
                <button
                    onPointerDown={handleJumpStart}
                    onPointerUp={handleJumpEnd}
                    onPointerCancel={handleJumpEnd}
                    className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-600 to-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)] border border-pink-300/20 text-white font-black text-lg uppercase tracking-wider flex items-center justify-center pointer-events-auto active:scale-95 transition-transform"
                    style={{ touchAction: 'none' }}
                >
                    JUMP
                </button>
            </div>
        </div>
    );
}