import React, { useRef, useEffect } from 'react';

export default function TouchControls({ engineRef }) {
    const joystickRef = useRef({ active: false, startX: 0, startY: 0, currentKey: null });

    const sendKey = (key, code, isPress) => {
        if (!engineRef.current || !engineRef.current.input) return;

        if (isPress) engineRef.current.input.simulateKeyPress(code);
        else engineRef.current.input.simulateKeyRelease(code);

        const eventName = isPress ? 'keydown' : 'keyup';
        const keyboardEvent = new KeyboardEvent(eventName, { key: key, code: code, bubbles: true });
        window.dispatchEvent(keyboardEvent);
    };

    const handleJoystickStart = (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        joystickRef.current = {
            active: true,
            startX: touch.clientX,
            startY: touch.clientY,
            currentKey: null
        };
    };

    const handleJoystickMove = (e) => {
        e.preventDefault();
        if (!joystickRef.current.active) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - joystickRef.current.startX;

        const threshold = 20;

        let newKey = null;
        if (deltaX < -threshold) newKey = 'KeyA';
        else if (deltaX > threshold) newKey = 'KeyD';

        if (newKey !== joystickRef.current.currentKey) {
            if (joystickRef.current.currentKey) {
                sendKey(joystickRef.current.currentKey === 'KeyA' ? 'a' : 'd', joystickRef.current.currentKey, false);
            }
            if (newKey) {
                sendKey(newKey === 'KeyA' ? 'a' : 'd', newKey, true);
            }
            joystickRef.current.currentKey = newKey;
        }
    };

    const handleJoystickEnd = (e) => {
        e.preventDefault();
        if (joystickRef.current.currentKey) {
            sendKey(joystickRef.current.currentKey === 'KeyA' ? 'a' : 'd', joystickRef.current.currentKey, false);
        }
        joystickRef.current = { active: false, startX: 0, startY: 0, currentKey: null };
    };


    const actionRef = useRef({ startY: 0 });

    const handleActionStart = (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        actionRef.current.startY = touch.clientY;
        sendKey('f', 'KeyF', true);
    };

    const handleActionMove = (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const deltaY = touch.clientY - actionRef.current.startY;

        if (deltaY < -30) {
            sendKey('f', 'KeyF', false);
            sendKey('w', 'KeyW', true);
        }
    };

    const handleActionEnd = (e) => {
        e.preventDefault();
        sendKey('f', 'KeyF', false);
        sendKey('w', 'KeyW', false);
    };

    useEffect(() => {
        const preventContext = (e) => e.preventDefault();
        document.addEventListener('contextmenu', preventContext);
        return () => document.removeEventListener('contextmenu', preventContext);
    }, []);

    return (
        <div className="absolute inset-0 z-40 flex pointer-events-none landscape:flex portrait:hidden">

            <div
                onTouchStart={handleJoystickStart}
                onTouchMove={handleJoystickMove}
                onTouchEnd={handleJoystickEnd}
                onTouchCancel={handleJoystickEnd}
                className="w-1/2 h-full pointer-events-auto border-r border-white/5 flex items-end justify-center pb-6 opacity-30 active:opacity-60 active:bg-white/5 transition-all"
            >
                <div className="text-white/50 text-xl font-black mb-8 flex flex-col items-center">
                    <span>← DESLIZA →</span>
                    <span className="text-xs tracking-widest mt-2">PARA MOVERSE</span>
                </div>
            </div>

            <div
                onTouchStart={handleActionStart}
                onTouchMove={handleActionMove}
                onTouchEnd={handleActionEnd}
                onTouchCancel={handleActionEnd}
                className="w-1/2 h-full pointer-events-auto flex items-end justify-center pb-6 opacity-30 active:opacity-60 active:bg-pink-500/10 transition-all relative"
            >
                <div className="text-pink-400/50 text-xl font-black mb-8 flex flex-col items-center">
                    <span>↑ DESLIZA SALTO</span>
                    <span className="text-xs tracking-widest mt-2 border-t border-pink-500/50 pt-2">TOCA PARA DASH</span>
                </div>
            </div>

        </div>
    );
}