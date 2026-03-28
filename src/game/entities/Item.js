export class Item {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * (canvasWidth - 100) + 50;
        this.y = -50;
        this.size = 25;
        this.vy = 3;
        this.active = true;
        this.canvasHeight = canvasHeight;
    }
    update(players, triggerUpdate) {
        this.y += this.vy;
        if (this.y > this.canvasHeight) this.active = false;
        this.vy += 0.05;

        players.forEach(p => {
            if (p.lives > 0 && !p.respawning && this.active) {
                if (p.x < this.x + this.size && p.x + p.width > this.x &&
                    p.y < this.y + this.size && p.y + p.height > this.y) {
                    this.collect(p);
                    triggerUpdate();
                }
            }
        });
    }
    collect(p) {
        this.active = false;
        if (p.lives < p.maxLives) p.lives++;
        p.percentage = 0;
        p.spawnParticles(30, '#00ff00', true);
    }
    draw(ctx) {
        if (!this.active) return;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ff00';
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 10, this.y + 5, 5, 15);
        ctx.fillRect(this.x + 5, this.y + 10, 15, 5);
        ctx.shadowBlur = 0;
    }
}
