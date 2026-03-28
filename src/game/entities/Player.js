import { GRAVITY, TERMINAL_VELOCITY } from '../../config/constants';
import { Particle } from './Particle';

export class Player {
    constructor(id, color, startX, controls, isBot, engine, maxLives) {
        this.id = id;
        this.engine = engine;
        this.width = 35;
        this.height = 35;
        this.x = startX;
        this.y = 100;
        this.vx = 0;
        this.vy = 0;
        this.color = color;
        this.controls = controls;
        this.isBot = isBot;

        this.speed = 8;
        this.jumpForce = -15;
        this.isGrounded = false;
        this.jumps = 2;

        this.maxLives = maxLives;
        this.lives = maxLives;
        this.percentage = 0;
        this.invulnerable = 0;
        this.respawning = false;
    }

    update(opponent) {
        if (this.lives <= 0) return;
        if (this.invulnerable > 0) this.invulnerable--;

        if (this.respawning) {
            this.y += 2;
            if (this.y > this.engine.canvas.height / 3) this.respawning = false;
            return;
        }

        if (this.isBot) {
            this.doBotLogic(opponent);
        } else {
            if (this.engine.input.isPressed(this.controls.left)) this.vx -= 1.5;
            else if (this.engine.input.isPressed(this.controls.right)) this.vx += 1.5;

            if (this.engine.input.isPressed(this.controls.up)) {
                if (this.isGrounded || this.jumps > 0) {
                    this.vy = this.jumpForce;
                    this.isGrounded = false;
                    this.jumps--;
                    this.engine.input.keys[this.controls.up] = false;
                    this.spawnParticles(5, this.color);
                }
            }
        }

        this.vx *= this.isGrounded ? 0.8 : 0.95;
        if (Math.abs(this.vx) > this.speed && this.invulnerable === 0) {
            this.vx = Math.sign(this.vx) * this.speed;
        }

        this.vy += GRAVITY;
        if (this.vy > TERMINAL_VELOCITY && this.invulnerable === 0) this.vy = TERMINAL_VELOCITY;

        this.x += this.vx;
        this.y += this.vy;

        if (this.y > this.engine.canvas.height + 50 || this.x < -100 || this.x > this.engine.canvas.width + 100) {
            this.loseLife();
        } else {
            this.checkCollisions();
        }
    }

    doBotLogic(opp) {
        let targetX = this.engine.canvas.width / 2;
        if (opp.lives > 0 && !opp.respawning) targetX = opp.x;

        let closestItem = this.engine.items.find(i => i.active && i.y > 0);
        if (closestItem && this.percentage > 30) targetX = closestItem.x;

        if (targetX < this.x - 20) this.vx -= 1;
        else if (targetX > this.x + 20) this.vx += 1;

        let platformBelow = this.engine.platforms.find(p => this.x > p.x - 20 && this.x < p.x + p.width + 20 && p.targetY > 0 && p.targetY < this.engine.canvas.height);
        let dangerFalling = this.y > this.engine.canvas.height - 200 && !platformBelow;
        let enemyAbove = (opp.lives > 0 && opp.y < this.y - 100 && Math.abs(opp.x - this.x) < 100);

        if (dangerFalling || enemyAbove) {
            if ((this.isGrounded || this.jumps > 0) && Math.random() > 0.1) {
                this.vy = this.jumpForce;
                this.isGrounded = false;
                this.jumps--;
                this.spawnParticles(5, this.color);
            }
        }
    }

    checkCollisions() {
        this.isGrounded = false;
        for (let plat of this.engine.platforms) {
            if (plat.y > this.engine.canvas.height - 10) continue;
            if (this.x < plat.x + plat.width &&
                this.x + this.width > plat.x &&
                this.y + this.height >= plat.y &&
                this.y + this.height <= plat.y + 30 + this.vy) {

                this.isGrounded = true;
                this.jumps = 2;
                this.y = plat.y - this.height;
                this.vy = 0;
                plat.registerTouch();
            }
        }
    }

    loseLife() {
        this.lives--;
        this.percentage = 0;
        this.spawnParticles(50, this.color, true);
        this.engine.triggerUpdate();

        if (this.lives > 0) {
            this.respawning = true;
            this.x = this.engine.canvas.width / 2;
            this.y = -100;
            this.vx = 0;
            this.vy = 0;
            this.invulnerable = 150;
        } else {
            this.engine.checkGameEnd();
        }
    }

    spawnParticles(amount = 10, colorStr = this.color, isExplosion = false) {
        if (!this.engine.settings.particles) return;

        for (let i = 0; i < amount; i++) {
            this.engine.particles.push(new Particle(this.x + this.width / 2, this.y + this.height / 2, colorStr, isExplosion));
        }
    }

    draw(ctx) {
        if (this.lives <= 0) return;
        if (this.invulnerable > 0 && Math.floor(Date.now() / 100) % 2 === 0) return;
        if (this.respawning) ctx.globalAlpha = 0.5;

        let visualColor = this.color;
        if (this.percentage > 50) visualColor = '#ffaa00';
        if (this.percentage > 100) visualColor = '#ff0000';

        ctx.shadowBlur = 20;
        ctx.shadowColor = visualColor;
        ctx.fillStyle = visualColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = 'white';
        ctx.shadowBlur = 0;
        let eyeOffset = this.vx > 1 ? 8 : (this.vx < -1 ? -8 : 0);
        ctx.fillRect(this.x + 6 + eyeOffset, this.y + 8, 6, 6);
        ctx.fillRect(this.x + 22 + eyeOffset, this.y + 8, 6, 6);

        if (!this.respawning) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.percentage}%`, this.x + this.width / 2, this.y - 10);
        }
        ctx.globalAlpha = 1.0;
    }
}
