import { Particle } from './Particle';

export class DissonanceOrb {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = -50;
        this.radius = 15;
        this.vx = (Math.random() - 0.5) * 15;
        this.vy = (Math.random() * 5) + 5;
        this.active = true;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    update(players, triggerUpdate, engine) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > this.canvasWidth) this.vx *= -1;
        if (this.y < 0 || this.y > this.canvasHeight) this.vy *= -1;

        players.forEach(p => {
            if (p.lives > 0 && !p.respawning && this.active && p.invulnerable <= 0) {
                let testX = this.x;
                let testY = this.y;

                if (this.x < p.x) testX = p.x;
                else if (this.x > p.x + p.width) testX = p.x + p.width;
                if (this.y < p.y) testY = p.y;
                else if (this.y > p.y + p.height) testY = p.y + p.height;

                let distX = this.x - testX;
                let distY = this.y - testY;
                let distance = Math.sqrt((distX * distX) + (distY * distY));

                if (distance <= this.radius) {
                    this.active = false;
                    p.percentage += 15;
                    p.vy = -12;
                    p.vx = this.vx * 1.5;
                    p.invulnerable = 20;
                    p.spawnParticles(40, '#ff0055', true);
                    engine.shakeScreen(15);
                    triggerUpdate();
                }
            }
        });
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0055';
        ctx.fillStyle = '#ff0055';

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x - 4, this.y - 4, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}