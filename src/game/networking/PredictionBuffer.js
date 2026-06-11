/**
 * PredictionBuffer
 * Caches inputs locally until they are acknowledged by the server.
 */
export class PredictionBuffer {
    constructor() {
        this.inputs = [];
    }

    /**
     * Cache local input packet.
     */
    add(inputState) {
        this.inputs.push(inputState.clone());
    }

    /**
     * Clear inputs up to the last processed sequence number from the server.
     */
    discardUpTo(seq) {
        this.inputs = this.inputs.filter(input => input.seq > seq);
    }

    getPending() {
        return this.inputs;
    }

    clear() {
        this.inputs = [];
    }
}
