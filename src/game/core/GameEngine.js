import { NUM_PLATFORMS } from '../../config/constants';
import { InputManager } from './InputManager';
import { AudioEngine } from './AudioEngine';
import { Player } from '../entities/Player';
import { Platform } from '../entities/Platform';
import { Item } from '../entities/Item';
import { DissonanceOrb } from '../entities/DissonanceOrb';

export class GameEngine {
    constructor(canvas, onStateUpdate, onGameOver, settings) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onStateUpdate = onStateUpdate;
        this.onGameOver = onGameOver;
        this.settings = settings;

        this.input = new InputManager();
        this.audioEngine = new AudioEngine();

        this.isGameOver = false;
        this.isMatchActive = false;
        this.isSuddenDeath = false;

        this.sdTransition = false;
        this.sdTransitionFrames = 0;
        this.sdTimeLeftFrames = 0;

        this.animationId = null;
        this.matchStartTime = 0;
        this.isErraticMode = false;
        this.shakeFrames = 0;

        this.platforms = [];
        this.items = [];
        this.orbs = [];
        this.particles = [];
        this.player1 = null;
        this.player2 = null;

        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }

    shakeScreen(frames) {
        this.shakeFrames = frames;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.platforms.length > 0) {
            this.platforms.forEach((p, i) => {
                p.width = (this.canvas.width / NUM_PLATFORMS) + 1;
                p.x = i * (this.canvas.width / NUM_PLATFORMS);
            });
        }
    }

    triggerUpdate() {
        if (!this.player1 || !this.player2) return;
        this.onStateUpdate({
            p1: { lives: this.player1.lives, percent: this.player1.percentage },
            p2: { lives: this.player2.lives, percent: this.player2.percentage },
            erratic: this.isErraticMode,
            suddenDeath: this.isSuddenDeath,
            sdTransition: this.sdTransition,
            sdCountdown: Math.ceil(this.sdTransitionFrames / 60),
            sdTimeLeft: Math.ceil(this.sdTimeLeftFrames / 60),
            time: this.isMatchActive && !this.isSuddenDeath ? ((Date.now() - this.matchStartTime) / 1000).toFixed(1) : "0.0"
        });
    }

    async initAudio(sourceType, isP2Bot, fileOrUrl = null) {
        this.player1 = new Player('p1', '#ff00ff', this.canvas.width * 0.25, { up: 'KeyW', left: 'KeyA', right: 'KeyD', dash: 'KeyF' }, false, this, this.settings.lives, 'normal');
        this.player2 = new Player('p2', '#00ffff', this.canvas.width * 0.75, { up: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight', dash: 'Shift' }, isP2Bot, this, this.settings.lives, this.settings.botDifficulty);

        this.platforms = Array.from({ length: NUM_PLATFORMS }, (_, i) => new Platform(i, this.canvas.width, this.canvas.height));
        this.items = [];
        this.orbs = [];
        this.particles = [];

        await this.audioEngine.prepare(sourceType, fileOrUrl, this.settings.volume, () => {
            if (!this.isGameOver && this.isMatchActive && !this.sdTransition && !this.isSuddenDeath) {
                this.checkGameEnd(true);
            }
        });

        this.input.start();
        this.isGameOver = false;
        this.isMatchActive = false;
        this.isSuddenDeath = false;
        this.sdTransition = false;
        this.triggerUpdate();
        this.loop();
    }

    startMatch() {
        this.isMatchActive = true;
        this.matchStartTime = Date.now();
        this.audioEngine.startPlaying();
    }

    startSuddenDeathTransition() {
        this.sdTransition = true;
        this.sdTransitionFrames = 180;
        this.shakeScreen(40);
        this.triggerUpdate();
        this.audioEngine.playRandomSuddenDeathTrack(this.settings.volume);
    }

    resolveSuddenDeathTie() {
        if (this.player1.lives > this.player2.lives) this.checkGameEnd(false, 'p1');
        else if (this.player2.lives > this.player1.lives) this.checkGameEnd(false, 'p2');
        else {
            if (this.player1.percentage < this.player2.percentage) this.checkGameEnd(false, 'p1');
            else if (this.player2.percentage < this.player1.percentage) this.checkGameEnd(false, 'p2');
            else this.checkGameEnd(true);
        }
    }

    handlePlayerCollisions() {
        if (!this.isMatchActive || this.sdTransition) return;
        if (this.player1.lives <= 0 || this.player2.lives <= 0) return;
        if (this.player1.respawning || this.player2.respawning) return;
        if (this.player1.invulnerable > 0 || this.player2.invulnerable > 0) return;

        if (this.player1.x < this.player2.x + this.player2.width &&
            this.player1.x + this.player1.width > this.player2.x &&
            this.player1.y < this.player2.y + this.player2.height &&
            this.player1.y + this.player1.height > this.player2.y) {

            if (this.isSuddenDeath && !this.player1.isDashing && !this.player2.isDashing) {
                return;
            }

            let dx = (this.player1.x + this.player1.width / 2) - (this.player2.x + this.player2.width / 2);

            let baseDmg = Math.floor(Math.random() * 15) + 15;

            let dmgP1ToP2 = baseDmg * (this.player1.isDashing ? 3.5 : 1);
            let dmgP2ToP1 = baseDmg * (this.player2.isDashing ? 3.5 : 1);

            this.player1.percentage += dmgP2ToP1;
            this.player2.percentage += dmgP1ToP2;

            let baseForce = 9;
            let forceP1 = baseForce * (1 + (this.player1.percentage / 35)) * (this.player2.isDashing ? 2.2 : 1);
            let forceP2 = baseForce * (1 + (this.player2.percentage / 35)) * (this.player1.isDashing ? 2.2 : 1);

            let direction = dx > 0 ? 1 : -1;
            this.player1.vx = direction * forceP1;
            this.player1.vy = -forceP1 * 0.6;
            this.player2.vx = -direction * forceP2;
            this.player2.vy = -forceP2 * 0.6;

            this.player1.invulnerable = 30;
            this.player2.invulnerable = 30;
            this.player1.spawnParticles(30, 'white', true);

            if (this.player1.isDashing || this.player2.isDashing) {
                this.shakeScreen(30);
            } else {
                this.shakeScreen(10);
            }

            this.triggerUpdate();

            const KO_THRESHOLD = 200;
            if (this.player1.percentage >= KO_THRESHOLD && !this.player1.respawning) {
                this.player1.loseLife();
            }
            if (this.player2.percentage >= KO_THRESHOLD && !this.player2.respawning) {
                this.player2.loseLife();
            }
        }
    }

    checkGameEnd(songEnded = false, forcedWinner = null) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.isMatchActive = false;
        this.audioEngine.cleanup();

        let result = { type: '', color: '' };

        if (forcedWinner) {
            result = { type: forcedWinner, color: forcedWinner === 'p1' ? "text-pink-400" : "text-cyan-400" };
        } else if (songEnded || (this.player1.lives <= 0 && this.player2.lives <= 0)) {
            result = { type: 'tie', color: "text-white" };
        } else if (this.player1.lives <= 0) {
            result = { type: this.player2.isBot ? 'cpu' : 'p2', color: "text-cyan-400" };
        } else if (this.player2.lives <= 0) {
            result = { type: 'p1', color: "text-pink-400" };
        }

        this.input.stop();
        this.onGameOver(result);
    }

    loop = () => {
        if (this.isGameOver) return;
        this.animationId = requestAnimationFrame(this.loop);

        this.ctx.save();
        if (this.shakeFrames > 0) {
            this.shakeFrames--;
            const intensity = this.shakeFrames > 10 ? 30 : 10;
            const shakeX = (Math.random() - 0.5) * intensity;
            const shakeY = (Math.random() - 0.5) * intensity;
            this.ctx.translate(shakeX, shakeY);
        }

        if (this.settings.theme === 'matrix') {
            this.ctx.fillStyle = this.isErraticMode ? 'rgba(0, 30, 0, 0.4)' : 'rgba(0, 8, 0, 1.0)';
        } else if (this.settings.theme === 'blood') {
            this.ctx.fillStyle = this.isErraticMode ? 'rgba(40, 0, 0, 0.5)' : 'rgba(15, 0, 0, 1.0)';
        } else {
            this.ctx.fillStyle = this.isErraticMode ? 'rgba(20, 0, 10, 0.4)' : 'rgba(5, 5, 16, 1.0)';
        }
        this.ctx.fillRect(-50, -50, this.canvas.width + 100, this.canvas.height + 100);

        if (this.sdTransition) {
            this.sdTransitionFrames--;
            if (this.sdTransitionFrames <= 0) {
                this.sdTransition = false;
                this.isSuddenDeath = true;
                this.sdTimeLeftFrames = 60 * 60;
                this.player1.flightTimer = 999999;
                this.player2.flightTimer = 999999;
                this.player1.vy = -10;
                this.player2.vy = -10;
            }
            this.player1.draw(this.ctx);
            this.player2.draw(this.ctx);
            this.triggerUpdate();
            this.ctx.restore();
            return;
        }

        if (this.isSuddenDeath) {
            this.sdTimeLeftFrames--;
            if (this.sdTimeLeftFrames <= 0) {
                this.resolveSuddenDeathTie();
                this.ctx.restore();
                return;
            }
        }

        const { dataArray, globalIntensity, isMicMode } = this.audioEngine.getFrequencyData();

        let progress = 0;
        if (this.isMatchActive && !this.isSuddenDeath) {
            if (this.audioEngine.isMicMode) {
                progress = Math.min(1, ((Date.now() - this.matchStartTime) / 1000) / 180);
            } else {
                progress = this.audioEngine.getProgress();
            }
        }

        if (this.isMatchActive && progress >= 0.90 && !this.isSuddenDeath && !this.sdTransition) {
            this.startSuddenDeathTransition();
            this.ctx.restore();
            return;
        }

        const maxDeadSides = Math.floor((NUM_PLATFORMS / 2) * 0.8);
        const currentDeadSides = Math.floor(progress * maxDeadSides);

        if (dataArray && this.isMatchActive) {
            let prevErratic = this.isErraticMode;
            this.isErraticMode = globalIntensity > 75;
            if (prevErratic !== this.isErraticMode && Math.random() < 0.1) this.triggerUpdate();

            if ((this.isErraticMode || this.isSuddenDeath) && Math.random() < 0.05) {
                if (this.orbs.filter(o => o.active).length < 5) {
                    this.orbs.push(new DissonanceOrb(this.canvas.width, this.canvas.height));
                }
            }
        } else {
            this.isErraticMode = false;
        }

        const half = Math.floor(NUM_PLATFORMS / 2);
        const step = dataArray ? Math.floor(dataArray.length * 0.7 / half) : 1;

        for (let i = 0; i < half; i++) {
            let avg = 0;
            if (this.isMatchActive && dataArray) {
                let sum = 0;
                for (let j = 0; j < step; j++) sum += dataArray[(i * step) + j];
                avg = sum / step;
                if (avg < 10 && !isMicMode) avg = 0;
            }

            if (!this.isErraticMode) avg = avg * 0.5;

            let isDeadZone = this.isMatchActive && (i < currentDeadSides);

            this.platforms[i].update(avg, this.canvas.height, this.isErraticMode, this.isMatchActive, isDeadZone, this.isSuddenDeath);
            this.platforms[NUM_PLATFORMS - 1 - i].update(avg, this.canvas.height, this.isErraticMode, this.isMatchActive, isDeadZone, this.isSuddenDeath);
            this.platforms[i].draw(this.ctx, this.canvas.height, this.isErraticMode, isDeadZone, this.settings.theme);
            this.platforms[NUM_PLATFORMS - 1 - i].draw(this.ctx, this.canvas.height, this.isErraticMode, isDeadZone, this.settings.theme);
        }

        if (this.isMatchActive && Math.random() < 0.004) {
            this.items.push(new Item(this.canvas.width, this.canvas.height));
        }
        this.items.forEach(item => {
            item.update([this.player1, this.player2], () => this.triggerUpdate());
            item.draw(this.ctx);
        });

        for (let i = this.orbs.length - 1; i >= 0; i--) {
            this.orbs[i].update([this.player1, this.player2], () => this.triggerUpdate(), this);
            this.orbs[i].draw(this.ctx);
            if (!this.orbs[i].active && this.orbs[i].y > this.canvas.height) {
                this.orbs.splice(i, 1);
            }
        }

        this.player1.update(this.player2);
        this.player2.update(this.player1);
        this.handlePlayerCollisions();

        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            this.particles[i].draw(this.ctx);
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }

        if (this.isMatchActive && Date.now() % 100 < 20) this.triggerUpdate();

        this.ctx.restore();
    };

    cleanup() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.input.stop();
        this.audioEngine.cleanup();
        window.removeEventListener('resize', this.resizeCanvas);
    }
}