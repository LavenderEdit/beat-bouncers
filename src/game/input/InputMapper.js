import { InputState } from './InputState';

export class InputMapper {
    constructor(keyboardSource, gamepadSource, touchSource, bindings = {}) {
        this.keyboard = keyboardSource;
        this.gamepad = gamepadSource;
        this.touch = touchSource;
        
        // bindings map: left, right, jump, dash -> keycodes
        this.bindings = {
            left: 'KeyA',
            right: 'KeyD',
            jump: 'KeyW',
            dash: 'KeyF',
            ...bindings
        };

        this.seq = 0;
    }

    /**
     * Standardizes all active sources into a single InputState
     * @returns {InputState}
     */
    poll() {
        const state = new InputState();
        this.seq++;
        state.seq = this.seq;
        state.timestamp = Date.now();

        // 1. Keyboard polling
        let kbLeft = this.keyboard.isPressed(this.bindings.left);
        let kbRight = this.keyboard.isPressed(this.bindings.right);
        let kbJump = this.keyboard.consumeKey(this.bindings.jump); // consume jump to avoid auto-firing on hold
        let kbDash = this.keyboard.consumeKey(this.bindings.dash);

        // 2. Gamepad polling
        let gpLeft = false;
        let gpRight = false;
        let gpJump = false;
        let gpDash = false;
        let gpAxisX = 0;

        if (this.gamepad) {
            gpAxisX = this.gamepad.getAxis(0); // left stick X
            
            // D-Pad or Left Stick
            gpLeft = gpAxisX < -0.4 || this.gamepad.isButtonPressed(14);
            gpRight = gpAxisX > 0.4 || this.gamepad.isButtonPressed(15);
            
            // Button 0 (A/cross) or Button 12 (D-pad up) for jump
            gpJump = this.gamepad.isButtonPressed(0) || this.gamepad.isButtonPressed(12);
            // Button 2 (X/square) or Button 5 (R1) for dash
            gpDash = this.gamepad.isButtonPressed(2) || this.gamepad.isButtonPressed(5);
        }

        // 3. Touch polling
        let tLeft = this.touch ? this.touch.left : false;
        let tRight = this.touch ? this.touch.right : false;
        let tJump = this.touch ? this.touch.jump : false;
        let tDash = this.touch ? this.touch.dash : false;
        let tAxisX = this.touch ? this.touch.axisX : 0;

        // Clear triggers in touch source so they act as one-shot actions
        if (this.touch) {
            this.touch.jump = false;
            this.touch.dash = false;
        }

        // Combine inputs
        state.left = kbLeft || gpLeft || tLeft;
        state.right = kbRight || gpRight || tRight;
        state.jump = kbJump || gpJump || tJump;
        state.dash = kbDash || gpDash || tDash;

        // X Axis calculation
        if (state.left) state.axisX = -1;
        else if (state.right) state.axisX = 1;
        else if (gpAxisX !== 0) state.axisX = gpAxisX;
        else if (tAxisX !== 0) state.axisX = tAxisX;
        else state.axisX = 0;

        return state;
    }
}
