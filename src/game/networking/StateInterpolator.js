/**
 * StateInterpolator
 * Smooths out remote entity movement by interpolating positions between last received server packets.
 */
export class StateInterpolator {
    constructor(interpolationDelayMs = 100) {
        this.buffer = [];
        this.interpolationDelay = interpolationDelayMs;
    }

    /**
     * Push a new server state packet.
     */
    push(state, receiveTime = Date.now()) {
        this.buffer.push({
            timestamp: receiveTime,
            state: JSON.parse(JSON.stringify(state)) // deep copy
        });

        // Retain maximum of 2 seconds of state buffer (120 ticks at 60Hz)
        if (this.buffer.length > 120) {
            this.buffer.shift();
        }
    }

    /**
     * Get interpolated state for rendering at target render time.
     */
    interpolate(renderTime) {
        if (this.buffer.length === 0) return null;
        
        const targetTime = renderTime - this.interpolationDelay;

        // If targetTime is older than our oldest state, return the oldest
        if (targetTime < this.buffer[0].timestamp) {
            return this.buffer[0].state;
        }

        // If targetTime is newer than our latest state, return the latest
        if (targetTime > this.buffer[this.buffer.length - 1].timestamp) {
            return this.buffer[this.buffer.length - 1].state;
        }

        // Find surrounding states
        let stateA = null;
        let stateB = null;

        for (let i = 0; i < this.buffer.length - 1; i++) {
            const current = this.buffer[i];
            const next = this.buffer[i + 1];

            if (targetTime >= current.timestamp && targetTime <= next.timestamp) {
                stateA = current;
                stateB = next;
                break;
            }
        }

        if (!stateA || !stateB) {
            return this.buffer[this.buffer.length - 1].state;
        }

        const total = stateB.timestamp - stateA.timestamp;
        const ratio = total > 0 ? (targetTime - stateA.timestamp) / total : 0;

        // Merge and interpolate positions
        const interpolated = JSON.parse(JSON.stringify(stateA.state));

        interpolated.players.forEach(pA => {
            const pB = stateB.state.players.find(p => p.id === pA.id);
            if (pB) {
                // Smooth linear interpolation (lerp)
                pA.x = pA.x + (pB.x - pA.x) * ratio;
                pA.y = pA.y + (pB.y - pA.y) * ratio;
                pA.vx = pA.vx + (pB.vx - pA.vx) * ratio;
                pA.vy = pA.vy + (pB.vy - pA.vy) * ratio;
            }
        });

        return interpolated;
    }

    clear() {
        this.buffer = [];
    }
}
