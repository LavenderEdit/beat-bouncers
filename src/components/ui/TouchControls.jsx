import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Zap } from 'lucide-react';

export default function TouchControls({ engineRef }) {

    const handleTouch = (e, key, isPress) => {
        e.preventDefault();
        if (engineRef.current && engineRef.current.input) {
            if (isPress) engineRef.current.input.simulateKeyPress(key);
            else engineRef.current.input.simulateKeyRelease(key);
        }
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-40 sm:hidden flex justify-between items-end p-6">

            <div className="flex gap-4 pointer-events-auto">
                <button
                    onTouchStart={(e) => handleTouch(e, 'KeyA', true)}
                    onTouchEnd={(e) => handleTouch(e, 'KeyA', false)}
                    onTouchCancel={(e) => handleTouch(e, 'KeyA', false)}
                    className="w-16 h-16 bg-white/20 active:bg-white/50 backdrop-blur-md rounded-full border-2 border-white/30 flex items-center justify-center text-white"
                >
                    <ArrowLeft size={32} />
                </button>

                <button
                    onTouchStart={(e) => handleTouch(e, 'KeyD', true)}
                    onTouchEnd={(e) => handleTouch(e, 'KeyD', false)}
                    onTouchCancel={(e) => handleTouch(e, 'KeyD', false)}
                    className="w-16 h-16 bg-white/20 active:bg-white/50 backdrop-blur-md rounded-full border-2 border-white/30 flex items-center justify-center text-white"
                >
                    <ArrowRight size={32} />
                </button>
            </div>

            <div className="flex flex-col gap-4 pointer-events-auto items-end">
                <button
                    onTouchStart={(e) => handleTouch(e, 'KeyF', true)}
                    onTouchEnd={(e) => handleTouch(e, 'KeyF', false)}
                    onTouchCancel={(e) => handleTouch(e, 'KeyF', false)}
                    className="w-16 h-16 bg-pink-500/40 active:bg-pink-500/80 backdrop-blur-md rounded-full border-2 border-pink-500 flex items-center justify-center text-white mr-8"
                >
                    <Zap size={32} />
                </button>

                <button
                    onTouchStart={(e) => handleTouch(e, 'KeyW', true)}
                    onTouchEnd={(e) => handleTouch(e, 'KeyW', false)}
                    onTouchCancel={(e) => handleTouch(e, 'KeyW', false)}
                    className="w-20 h-20 bg-white/20 active:bg-white/50 backdrop-blur-md rounded-full border-2 border-white/30 flex items-center justify-center text-white"
                >
                    <ArrowUp size={40} />
                </button>
            </div>

        </div>
    );
}