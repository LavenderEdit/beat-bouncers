/**
 * GameLoop
 * Manages fixed-timestep updates and requestAnimationFrame renders.
 */
export class GameLoop {
    constructor() {
        this.animationId = null;
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60; // 60Hz logic ticks (16.67ms)
        this.isActive = false;
    }

    /**
     * Start the loop.
     * @param {Function} onUpdate - Called at 60Hz. Receives step in ms.
     * @param {Function} onRender - Called every animation frame.
     */
    start(onUpdate, onRender) {
        if (this.isActive) return;
        this.isActive = true;
        this.lastTime = performance.now();
        this.accumulator = 0;

        const loop = (now) => {
            if (!this.isActive) return;

            let deltaTime = now - this.lastTime;
            this.lastTime = now;

            // Prevent spiral of death on tab suspension or lag spike
            if (deltaTime > 250) deltaTime = 250;

            this.accumulator += deltaTime;

            while (this.accumulator >= this.timeStep) {
                onUpdate(this.timeStep);
                this.accumulator -= this.timeStep;
            }

            onRender();

            this.animationId = requestAnimationFrame(loop);
        };

        this.animationId = requestAnimationFrame(loop);
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}
