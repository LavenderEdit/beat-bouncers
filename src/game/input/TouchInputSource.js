export class TouchInputSource {
    constructor() {
        this.left = false;
        this.right = false;
        this.jump = false;
        this.dash = false;
        this.axisX = 0;
    }

    setAxisX(value) {
        this.axisX = value;
        this.left = value < -0.3;
        this.right = value > 0.3;
    }

    setJump(pressed) {
        this.jump = pressed;
    }

    setDash(pressed) {
        this.dash = pressed;
    }

    reset() {
        this.left = false;
        this.right = false;
        this.jump = false;
        this.dash = false;
        this.axisX = 0;
    }
}
