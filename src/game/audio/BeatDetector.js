export class BeatDetector {
    constructor(historyLength = 40) {
        this.history = [];
        this.historyLength = historyLength;
        this.cooldownFrames = 8;
        this.cooldownTimer = 0;
        this.thresholdMult = 1.25;
    }

    /**
     * Detect beats based on instant energy compared to average energy history.
     */
    detect(instantBassEnergy) {
        if (this.cooldownTimer > 0) {
            this.cooldownTimer--;
        }

        this.history.push(instantBassEnergy);
        if (this.history.length > this.historyLength) {
            this.history.shift();
        }

        if (this.history.length < 15) return false;

        const sum = this.history.reduce((a, b) => a + b, 0);
        const avg = sum / this.history.length;

        // Trigger beat if energy exceeds average by threshold multiplier and is above absolute noise floor
        if (instantBassEnergy > avg * this.thresholdMult && this.cooldownTimer === 0 && instantBassEnergy > 45) {
            this.cooldownTimer = this.cooldownFrames;
            return true;
        }

        return false;
    }
}
