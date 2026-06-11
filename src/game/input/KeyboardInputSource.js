export class KeyboardInputSource {
    constructor() {
        this.keys = {};
        
        this.handleKeyDown = (e) => {
            // Ignore auto-repeated keypress events
            if (e.repeat) return;
            this.keys[e.code] = true;
            this.keys[e.key] = true;
        };

        this.handleKeyUp = (e) => {
            this.keys[e.code] = false;
            this.keys[e.key] = false;
        };
    }

    start() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    stop() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.keys = {};
    }

    isPressed(keyCode) {
        return !!this.keys[keyCode];
    }
    
    consumeKey(keyCode) {
        const pressed = !!this.keys[keyCode];
        if (pressed) {
            this.keys[keyCode] = false;
        }
        return pressed;
    }
}
