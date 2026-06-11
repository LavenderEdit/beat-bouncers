export class GamepadInputSource {
    constructor(gamepadIndex = 0) {
        this.gamepadIndex = gamepadIndex;
    }

    getGamepad() {
        if (!navigator.getGamepads) return null;
        const gamepads = navigator.getGamepads();
        return gamepads[this.gamepadIndex] || null;
    }

    getAxis(axisIndex) {
        const pad = this.getGamepad();
        if (!pad || !pad.axes) return 0;
        return pad.axes[axisIndex] || 0;
    }

    isButtonPressed(buttonIndex) {
        const pad = this.getGamepad();
        if (!pad || !pad.buttons || !pad.buttons[buttonIndex]) return false;
        return pad.buttons[buttonIndex].pressed;
    }
}
