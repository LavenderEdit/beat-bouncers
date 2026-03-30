export class Item {
    constructor(canvasWidth, canvasHeight) {
        this.baseX = Math.random() * (canvasWidth - 100) + 50;
        this.x = this.baseX;
        this.y = -50;
        this.size = 25;
        this.vy = 1.5;
        this.angle = Math.random() * Math.PI * 2;
        this.active = true;
        this.canvasHeight = canvasHeight;

        const rand = Math.random();
        if (rand < 0.15) {
            this.type = 'heal';
            this.color = '#00ff00';
        } else if (rand < 0.40) {
            this.type = 'fly';
            this.color = '#00ffff';
        } else {
            this.type = 'bomb';
            this.color = '#ff0000';
        }
    }

    update(players, triggerUpdate) {
        this.angle += 0.05;
        this.x = this.baseX + Math.sin(this.angle) * 40;
        this.y += this.vy;

        if (this.y > this.canvasHeight) this.active = false;

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
        if (this.type === 'heal') {
            if (p.lives < p.maxLives) p.lives++;
            p.percentage = Math.max(0, p.percentage - 50);
            p.spawnParticles(30, this.color, true);
        } else if (this.type === 'fly') {
            p.flightTimer = 300;
            p.spawnParticles(30, this.color, true);
        } else if (this.type === 'bomb') {
            p.percentage += 30;
            p.vy = -15;
            p.vx = (Math.random() - 0.5) * 20;
            p.spawnParticles(50, '#ffaa00', true);
            p.invulnerable = 30;
        }
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        if (this.type === 'heal') {
            ctx.fillRect(this.x, this.y, this.size, this.size);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 10, this.y + 5, 5, 15);
            ctx.fillRect(this.x + 5, this.y + 10, 15, 5);
        } else if (this.type === 'fly') {
            ctx.beginPath();
            ctx.moveTo(this.x + 12.5, this.y);
            ctx.lineTo(this.x + 25, this.y + 12.5);
            ctx.lineTo(this.x + 12.5, this.y + 25);
            ctx.lineTo(this.x, this.y + 12.5);
            ctx.fill();
        } else if (this.type === 'bomb') {
            let pulse = Math.abs(Math.sin(this.angle * 3)) * 5;
            ctx.beginPath();
            ctx.arc(this.x + 12.5, this.y + 12.5, 10 + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 10, this.y - 5, 5, 10);
        }

        ctx.shadowBlur = 0;
    }
}