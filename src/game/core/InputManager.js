export class InputManager {
    constructor() {
        this.keys = {};
        this.handleKeyDown = (e) => {
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

    simulateKeyPress(keyCode) {
        this.keys[keyCode] = true;
    }

    simulateKeyRelease(keyCode) {
        this.keys[keyCode] = false;
    }

    isPressed(keyCode, playerIdx = -1) {
        if (this.keys[keyCode]) return true;

        if (playerIdx >= 0) {
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            const pad = gamepads[playerIdx];

            if (pad) {
                if (keyCode === 'KeyA' || keyCode === 'ArrowLeft') {
                    return pad.axes[0] < -0.4 || pad.buttons[14]?.pressed;
                }
                if (keyCode === 'KeyD' || keyCode === 'ArrowRight') {
                    return pad.axes[0] > 0.4 || pad.buttons[15]?.pressed;
                }
                if (keyCode === 'KeyW' || keyCode === 'ArrowUp') {
                    return pad.axes[1] < -0.4 || pad.buttons[12]?.pressed || pad.buttons[0]?.pressed;
                }
                if (keyCode === 'KeyF' || keyCode === 'Shift') {
                    return pad.buttons[2]?.pressed || pad.buttons[5]?.pressed;
                }
                if (keyCode === 'KeyS' || keyCode === 'ArrowDown') {
                    return pad.buttons[0]?.pressed || pad.buttons[9]?.pressed;
                }
            }
        }
        return false;
    }
}