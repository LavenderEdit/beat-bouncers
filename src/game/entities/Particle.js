export class Particle {
    constructor(x, y, color, isExplosion = false) {
        this.x = x;
        this.y = y;
        const speedMulti = isExplosion ? 3 : 1;
        this.vx = (Math.random() - 0.5) * 15 * speedMulti;
        this.vy = (Math.random() - 0.5) * 15 * speedMulti - 2;
        this.life = 1.0;
        this.color = color;
        this.size = Math.random() * 5 + 2;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.04;
    }
    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}
