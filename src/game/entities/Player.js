import { GRAVITY, TERMINAL_VELOCITY } from '../../config/constants';
import { Particle } from './Particle';

export class Player {
    constructor(id, color, startX, controls, isBot, engine, maxLives, botDifficulty = 'normal') {
        this.id = id;
        this.engine = engine;
        this.width = 35; this.height = 35;
        this.x = startX; this.y = 100;
        this.vx = 0; this.vy = 0;
        this.color = color;
        this.controls = controls;
        this.isBot = isBot;
        this.botDifficulty = botDifficulty;

        this.speed = 8;
        this.jumpForce = -15;
        this.isGrounded = false;
        this.jumps = 2;

        this.maxLives = maxLives;
        this.lives = maxLives;
        this.percentage = 0;
        this.invulnerable = 0;
        this.respawning = false;

        this.facingRight = id === 'p1';
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashCooldown = 0;
        this.flightTimer = 0;
    }

    update(opponent) {
        if (this.lives <= 0) return;
        if (this.invulnerable > 0) this.invulnerable--;

        if (this.dashCooldown > 0) {
            this.dashCooldown -= this.engine.isSuddenDeath ? 5 : 1;
        }

        if (this.flightTimer > 0 && this.flightTimer < 9000) this.flightTimer--;

        if (this.respawning) {
            this.y += 2;
            if (this.y > this.engine.canvas.height / 3) this.respawning = false;
            return;
        }

        const pIdx = this.id === 'p1' ? 0 : 1;

        if (this.isBot && this.engine.isMatchActive) {
            this.doBotLogic(opponent);
        } else {
            if (this.engine.input.isPressed(this.controls.left, pIdx)) {
                this.vx -= 1.5;
                this.facingRight = false;
            } else if (this.engine.input.isPressed(this.controls.right, pIdx)) {
                this.vx += 1.5;
                this.facingRight = true;
            }

            if (this.engine.input.isPressed(this.controls.dash, pIdx) && this.dashCooldown <= 0 && !this.isDashing) {
                this.startDash();
            }

            if (this.engine.input.isPressed(this.controls.up, pIdx)) {
                if (this.flightTimer > 0) {
                    this.vy = -8;
                    this.spawnParticles(2, '#00ffff');
                } else if (this.isGrounded || this.jumps > 0) {
                    this.vy = this.jumpForce;
                    this.isGrounded = false;
                    this.jumps--;
                    this.engine.input.keys[this.controls.up] = false;
                    this.spawnParticles(5, this.color);
                }
            }
        }

        if (this.isDashing) {
            this.vy = 0;
            this.vx = this.facingRight ? 25 : -25;
            this.dashTimer--;
            this.spawnParticles(1, 'white');
            if (this.dashTimer <= 0) this.isDashing = false;
        } else {
            this.vx *= this.isGrounded ? 0.8 : 0.95;
            if (Math.abs(this.vx) > this.speed && this.invulnerable === 0) {
                this.vx = Math.sign(this.vx) * this.speed;
            }

            this.vy += GRAVITY;
            if (this.vy > TERMINAL_VELOCITY && this.invulnerable === 0) this.vy = TERMINAL_VELOCITY;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (!this.engine.isSuddenDeath) {
            if (this.y > this.engine.canvas.height + 50) {
                this.y = -this.height;
                this.vy *= 0.8;
            } else if (this.y < -this.height - 100) {
                this.y = this.engine.canvas.height + 50;
                this.vy *= 0.8;
            }

            if (this.x < -this.width) {
                this.x = this.engine.canvas.width;
            } else if (this.x > this.engine.canvas.width) {
                this.x = -this.width;
            }

            this.checkCollisions();
        } else {
            if (this.x < -this.width) this.x = this.engine.canvas.width;
            if (this.x > this.engine.canvas.width) this.x = -this.width;

            if (this.y > this.engine.canvas.height + 50) {
                this.loseLife();
            } else {
                this.checkCollisions();
            }
        }
    }

    startDash() {
        this.isDashing = true;
        this.dashTimer = 12;
        this.dashCooldown = 120;
        this.engine.input.keys[this.controls.dash] = false;
    }

    doBotLogic(opp) {
        let targetX = this.engine.canvas.width / 2;
        let trackingDistance = 20;
        let speedMult = 1.0;
        let jumpReaction = 0.1;
        let itemAgro = 30;
        let bombEvadeDist = 80;

        if (this.botDifficulty === 'easy') {
            trackingDistance = 60; speedMult = 0.6; jumpReaction = 0.4; itemAgro = 60; bombEvadeDist = 0;
        } else if (this.botDifficulty === 'hard') {
            trackingDistance = 5; speedMult = 1.4; jumpReaction = 0.0; itemAgro = 10; bombEvadeDist = 120;
        }

        let goodItems = this.engine.items.filter(i => i.active && i.y > 0 && i.type !== 'bomb');
        let bombs = this.engine.items.filter(i => i.active && i.y > 0 && i.type === 'bomb');

        let closestGoodItem = goodItems.length > 0 ? goodItems.reduce((prev, curr) => Math.abs(curr.x - this.x) < Math.abs(prev.x - this.x) ? curr : prev) : null;
        let closestBomb = bombs.length > 0 ? bombs.reduce((prev, curr) => Math.abs(curr.x - this.x) < Math.abs(prev.x - this.x) ? curr : prev) : null;

        if (closestBomb && Math.abs(closestBomb.x - this.x) < bombEvadeDist && closestBomb.y > this.y - 150) {
            targetX = this.x + (this.x < closestBomb.x ? -150 : 150); // Corre en dirección opuesta
        }
        else if (closestGoodItem && this.percentage > itemAgro) {
            targetX = closestGoodItem.x;
        }
        else if (opp.lives > 0 && !opp.respawning) {
            targetX = opp.x;
        }

        if (targetX < this.x - trackingDistance) {
            this.vx -= 1 * speedMult;
            this.facingRight = false;
        } else if (targetX > this.x + trackingDistance) {
            this.vx += 1 * speedMult;
            this.facingRight = true;
        }

        if (this.botDifficulty !== 'easy' && Math.abs(targetX - this.x) > 100 && Math.abs(targetX - this.x) < 200 && this.dashCooldown <= 0 && Math.random() < 0.05) {
            this.startDash();
        }

        let platformBelow = this.engine.platforms.find(p => this.x > p.x - 20 && this.x < p.x + p.width + 20 && p.targetY > 0 && p.targetY < this.engine.canvas.height);

        let dangerFalling = this.engine.isSuddenDeath && this.y > this.engine.canvas.height - 200 && !platformBelow;
        let enemyAbove = (opp.lives > 0 && opp.y < this.y - 100 && Math.abs(opp.x - this.x) < 100);

        if (dangerFalling || enemyAbove) {
            if (this.flightTimer > 0) {
                this.vy = -8;
            } else if ((this.isGrounded || this.jumps > 0) && Math.random() > jumpReaction) {
                this.vy = this.jumpForce;
                this.isGrounded = false;
                this.jumps--;
                this.spawnParticles(5, this.color);
            }
        }
    }

    checkCollisions() {
        this.isGrounded = false;
        if (this.isDashing) return;

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
        if (!this.engine.isMatchActive) {
            this.y = -50; this.x = this.engine.canvas.width / 2;
            this.vy = 0; this.vx = 0;
            return;
        }

        if (this.engine.isSuddenDeath) {
            this.lives = 0;
            this.spawnParticles(100, '#ff0000', true);
            this.engine.checkGameEnd();
            return;
        }

        this.lives--;
        this.percentage = 0;
        this.flightTimer = 0;
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
        if (this.percentage >= 100) visualColor = '#ffaa00';
        if (this.percentage >= 200) visualColor = '#ff0000';
        if (this.isDashing) visualColor = '#ffffff';

        if (this.flightTimer > 0) {
            ctx.fillStyle = '#00ffff';
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        ctx.shadowBlur = this.isDashing ? 30 : 20;
        ctx.shadowColor = visualColor;
        ctx.fillStyle = visualColor;

        if (this.isDashing) {
            ctx.fillRect(this.x - 10, this.y + 5, this.width + 20, this.height - 10);
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        ctx.fillStyle = 'black';
        ctx.shadowBlur = 0;
        let eyeOffset = this.facingRight ? 8 : -8;
        ctx.fillRect(this.x + 6 + eyeOffset, this.y + 8, 6, 6);
        ctx.fillRect(this.x + 22 + eyeOffset, this.y + 8, 6, 6);

        if (!this.respawning) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.percentage}%`, this.x + this.width / 2, this.y - 15);

            if (this.dashCooldown > 0) {
                ctx.fillStyle = 'gray';
                ctx.fillRect(this.x, this.y + this.height + 5, this.width, 3);
                ctx.fillStyle = 'white';
                ctx.fillRect(this.x, this.y + this.height + 5, this.width * (1 - this.dashCooldown / 120), 3);
            }
        }
        ctx.globalAlpha = 1.0;
    }
}