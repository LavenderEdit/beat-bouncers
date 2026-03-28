import { NUM_PLATFORMS } from '../../config/constants';
import { InputManager } from './InputManager';
import { AudioEngine } from './AudioEngine';
import { Player } from '../entities/Player';
import { Platform } from '../entities/Platform';
import { Item } from '../entities/Item';

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
        this.animationId = null;
        this.startTime = 0;
        this.isErraticMode = false;

        this.platforms = [];
        this.items = [];
        this.particles = [];
        this.player1 = null;
        this.player2 = null;

        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
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
            time: ((Date.now() - this.startTime) / 1000).toFixed(1)
        });
    }

    async initAudio(sourceType, isP2Bot, file = null) {
        this.player1 = new Player('p1', '#ff00ff', this.canvas.width * 0.25, { up: 'KeyW', left: 'KeyA', right: 'KeyD' }, false, this, this.settings.lives, 'normal');

        this.player2 = new Player('p2', '#00ffff', this.canvas.width * 0.75, { up: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight' }, isP2Bot, this, this.settings.lives, this.settings.botDifficulty);

        this.platforms = Array.from({ length: NUM_PLATFORMS }, (_, i) => new Platform(i, this.canvas.width, this.canvas.height));
        this.items = [];
        this.particles = [];

        await this.audioEngine.init(sourceType, file, this.settings.volume, () => {
            if (!this.isGameOver) this.checkGameEnd(true);
        });

        this.input.start();
        this.startTime = Date.now();
        this.isGameOver = false;
        this.triggerUpdate();
        this.loop();
    }

    handlePlayerCollisions() {
        if (this.player1.lives <= 0 || this.player2.lives <= 0) return;
        if (this.player1.respawning || this.player2.respawning) return;
        if (this.player1.invulnerable > 0 || this.player2.invulnerable > 0) return;

        if (this.player1.x < this.player2.x + this.player2.width &&
            this.player1.x + this.player1.width > this.player2.x &&
            this.player1.y < this.player2.y + this.player2.height &&
            this.player1.y + this.player1.height > this.player2.y) {

            let dx = (this.player1.x + this.player1.width / 2) - (this.player2.x + this.player2.width / 2);
            let dmg = Math.floor(Math.random() * 8) + 5 + (this.isErraticMode ? 10 : 0);

            this.player1.percentage += dmg;
            this.player2.percentage += dmg;

            let baseForce = 8;
            let forceP1 = baseForce * (1 + (this.player1.percentage / 40));
            let forceP2 = baseForce * (1 + (this.player2.percentage / 40));

            let direction = dx > 0 ? 1 : -1;
            this.player1.vx = direction * forceP1;
            this.player1.vy = -forceP1 * 0.6;

            this.player2.vx = -direction * forceP2;
            this.player2.vy = -forceP2 * 0.6;

            this.player1.invulnerable = 30;
            this.player2.invulnerable = 30;
            this.player1.spawnParticles(20, 'white', true);

            this.triggerUpdate();
        }
    }

    checkGameEnd(songEnded = false) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.audioEngine.cleanup();

        let result = { type: '', color: '' };
        if (songEnded || (this.player1.lives <= 0 && this.player2.lives <= 0)) {
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

        if (this.settings.theme === 'matrix') {
            this.ctx.fillStyle = this.isErraticMode ? 'rgba(0, 30, 0, 0.4)' : 'rgba(0, 8, 0, 0.3)';
        } else if (this.settings.theme === 'blood') {
            this.ctx.fillStyle = this.isErraticMode ? 'rgba(40, 0, 0, 0.5)' : 'rgba(15, 0, 0, 0.3)';
        } else {
            this.ctx.fillStyle = this.isErraticMode ? 'rgba(20, 0, 10, 0.4)' : 'rgba(5, 5, 16, 0.3)';
        }

        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const { dataArray, globalIntensity, isMicMode } = this.audioEngine.getFrequencyData();

        if (dataArray) {
            let prevErratic = this.isErraticMode;
            this.isErraticMode = globalIntensity > 80;
            if (prevErratic !== this.isErraticMode && Math.random() < 0.1) this.triggerUpdate();

            const step = Math.floor(dataArray.length * 0.7 / NUM_PLATFORMS);
            for (let i = 0; i < NUM_PLATFORMS; i++) {
                let sum = 0;
                for (let j = 0; j < step; j++) sum += dataArray[(i * step) + j];
                let avg = sum / step;
                if (avg < 10 && !isMicMode) avg = 0;

                this.platforms[i].update(avg, this.canvas.height, this.isErraticMode);
                this.platforms[i].draw(this.ctx, this.canvas.height, this.isErraticMode);
            }
        }

        if (Math.random() < 0.002) {
            this.items.push(new Item(this.canvas.width, this.canvas.height));
        }
        this.items.forEach(item => {
            item.update([this.player1, this.player2], () => this.triggerUpdate());
            item.draw(this.ctx);
        });

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

        if (Date.now() % 100 < 20) this.triggerUpdate();
    };

    cleanup() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.input.stop();
        this.audioEngine.cleanup();
        window.removeEventListener('resize', this.resizeCanvas);
    }
}