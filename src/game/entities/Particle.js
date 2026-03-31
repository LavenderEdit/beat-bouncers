export class Particle {
    constructor(x, y, color, isExplosion = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * (isExplosion ? 15 : 5);
        this.speedY = (Math.random() - 0.5) * (isExplosion ? 15 : 5);
        this.maxLife = Math.random() * 20 + 10;
        this.life = this.maxLife;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
    }

    draw(ctx, isMobile = false) {
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;

        ctx.shadowBlur = isMobile ? 0 : 10;
        ctx.shadowColor = this.color;

        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }
}