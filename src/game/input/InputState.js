/**
 * Canonical Input State representing a single frame of player actions.
 */
export class InputState {
    constructor() {
        this.left = false;
        this.right = false;
        this.jump = false;
        this.dash = false;
        this.axisX = 0;
        this.seq = 0;
        this.timestamp = Date.now();
    }

    clone() {
        const copy = new InputState();
        copy.left = this.left;
        copy.right = this.right;
        copy.jump = this.jump;
        copy.dash = this.dash;
        copy.axisX = this.axisX;
        copy.seq = this.seq;
        copy.timestamp = this.timestamp;
        return copy;
    }
}
