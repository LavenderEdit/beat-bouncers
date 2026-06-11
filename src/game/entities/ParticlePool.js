import { Particle } from './Particle';

export class ParticlePool {
    constructor(maxSize = 500) {
        this.maxSize = maxSize;
        this.pool = Array.from({ length: maxSize }, () => new Particle(0, 0, '#ffffff'));
        
        // Deactivate all initially
        this.pool.forEach(p => {
            p.life = 0;
        });

        this.nextIndex = 0;
    }

    /**
     * Spawn a particle from the pool.
     */
    spawn(x, y, color, isExplosion = false) {
        // Find next reusable slot
        let found = false;
        let p = null;
        
        for (let i = 0; i < this.maxSize; i++) {
            const idx = (this.nextIndex + i) % this.maxSize;
            if (this.pool[idx].life <= 0) {
                p = this.pool[idx];
                this.nextIndex = (idx + 1) % this.maxSize;
                found = true;
                break;
            }
        }

        // If no inactive particle is found, override oldest (nextIndex)
        if (!found) {
            p = this.pool[this.nextIndex];
            this.nextIndex = (this.nextIndex + 1) % this.maxSize;
        }

        p.x = x;
        p.y = y;
        p.color = color;
        p.size = Math.random() * 3 + 1.5;
        p.speedX = (Math.random() - 0.5) * (isExplosion ? 12 : 4);
        p.speedY = (Math.random() - 0.5) * (isExplosion ? 12 : 4);
        p.maxLife = Math.random() * 20 + 8;
        p.life = p.maxLife;
    }

    /**
     * Update active particles in place.
     */
    update() {
        this.pool.forEach(p => {
            if (p.life > 0) {
                p.update();
            }
        });
    }

    /**
     * Returns a list of active particles for the renderer to draw.
     */
    getActiveParticles() {
        return this.pool.filter(p => p.life > 0);
    }

    reset() {
        this.pool.forEach(p => {
            p.life = 0;
        });
    }
}
