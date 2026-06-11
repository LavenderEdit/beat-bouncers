import { NUM_PLATFORMS } from '../../config/constants';
import { Player } from '../entities/Player';
import { Platform } from '../entities/Platform';
import { Item } from '../entities/Item';
import { DissonanceOrb } from '../entities/DissonanceOrb';
import { ParticlePool } from '../entities/ParticlePool';
import { AudioEngine } from './AudioEngine';
import { AudioAnalyzer } from '../audio/AudioAnalyzer';
import { InputMapper } from '../input/InputMapper';
import { KeyboardInputSource } from '../input/KeyboardInputSource';
import { GamepadInputSource } from '../input/GamepadInputSource';
import { TouchInputSource } from '../input/TouchInputSource';

export class LocalGameEngine {
    constructor(canvas, onStateUpdate, onGameOver, settings, generatedLevel = null) {
        this.canvas = canvas;
        this.onStateUpdate = onStateUpdate;
        this.onGameOver = onGameOver;
        this.settings = settings;
        this.generatedLevel = generatedLevel;

        // Input Sources
        this.keyboard = new KeyboardInputSource();
        this.gamepad1 = new GamepadInputSource(0);
        this.gamepad2 = new GamepadInputSource(1);
        this.touch = new TouchInputSource();

        // Input Mappers for P1 and P2
        this.inputMapper1 = new InputMapper(this.keyboard, this.gamepad1, this.touch, {
            up: 'KeyW', left: 'KeyA', right: 'KeyD', dash: 'KeyF'
        });
        
        this.inputMapper2 = new InputMapper(this.keyboard, this.gamepad2, null, {
            up: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight', dash: 'ShiftRight'
        });

        // Audio Engine
        this.audioEngine = new AudioEngine();
        this.audioAnalyzer = null;

        // Reusable Particle Pool
        this.particlePool = new ParticlePool(500);

        this.isGameOver = false;
        this.isMatchActive = false;
        this.isSuddenDeath = false;
        this.sdTransition = false;
        this.sdTransitionFrames = 0;
        this.sdTimeLeftFrames = 0;

        this.matchStartTime = 0;
        this.isErraticMode = false;
        this.shakeFrames = 0;
        this.frameCount = 0;
        this.isMobile = false;

        this.platforms = [];
        this.items = [];
        this.orbs = [];
        this.players = [];

        this.checkMobileStatus();
    }

    checkMobileStatus() {
        this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768;
    }

    shakeScreen(frames) {
        this.shakeFrames = frames;
    }

    triggerUpdate() {
        if (this.players.length < 2) return;
        this.onStateUpdate({
            players: this.players.map(p => ({
                id: p.id,
                name: p.id === 'p1' ? 'P1' : (p.isBot ? 'CPU' : 'P2'),
                color: p.color,
                lives: p.lives,
                percentage: p.percentage,
                dashCooldown: p.dashCooldown
            })),
            erratic: this.isErraticMode,
            suddenDeath: this.isSuddenDeath,
            sdTransition: this.sdTransition,
            sdCountdown: Math.ceil(this.sdTransitionFrames / 60),
            sdTimeLeft: Math.ceil(this.sdTimeLeftFrames / 60),
            trackTitle: this.generatedLevel ? this.generatedLevel.title : "Pista Local",
            time: this.isMatchActive && !this.isSuddenDeath ? ((Date.now() - this.matchStartTime) / 1000).toFixed(1) : "0.0"
        });
    }

    async initAudio(sourceType, isP2Bot, fileOrUrl = null) {
        // Build players
        const p1 = new Player('p1', '#ff00ff', this.canvas.width * 0.25, null, false, this, this.settings.lives, 'normal');
        const p2 = new Player('p2', '#00ffff', this.canvas.width * 0.75, null, isP2Bot, this, this.settings.lives, this.settings.botDifficulty);
        
        p1.name = "Jugador 1";
        p2.name = isP2Bot ? "CPU" : "Jugador 2";
        
        this.players = [p1, p2];

        // Create platforms
        this.platforms = Array.from({ length: NUM_PLATFORMS }, (_, i) => new Platform(i, this.canvas.width, this.canvas.height));
        this.items = [];
        this.orbs = [];
        this.particlePool.reset();

        // Start input listeners
        this.keyboard.start();

        await this.audioEngine.prepare(sourceType, fileOrUrl, this.settings.volume, () => {
            if (!this.isGameOver && this.isMatchActive && !this.sdTransition && !this.isSuddenDeath) {
                this.checkGameEnd(true);
            }
        });

        if (this.audioEngine.analyser) {
            this.audioAnalyzer = new AudioAnalyzer(this.audioEngine.analyser);
        }

        this.isGameOver = false;
        this.isMatchActive = false;
        this.isSuddenDeath = false;
        this.sdTransition = false;
        this.frameCount = 0;
        this.triggerUpdate();
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
        if (this.audioEngine.analyser) {
            this.audioAnalyzer = new AudioAnalyzer(this.audioEngine.analyser);
        }
    }

    resolveSuddenDeathTie() {
        const [p1, p2] = this.players;
        if (p1.lives > p2.lives) this.checkGameEnd(false, 'p1');
        else if (p2.lives > p1.lives) this.checkGameEnd(false, 'p2');
        else {
            if (p1.percentage < p2.percentage) this.checkGameEnd(false, 'p1');
            else if (p2.percentage < p1.percentage) this.checkGameEnd(false, 'p2');
            else this.checkGameEnd(true);
        }
    }

    handlePlayerCollisions() {
        if (!this.isMatchActive || this.sdTransition) return;
        const [p1, p2] = this.players;
        if (p1.lives <= 0 || p2.lives <= 0) return;
        if (p1.respawning || p2.respawning) return;
        if (p1.invulnerable > 0 || p2.invulnerable > 0) return;

        if (p1.x < p2.x + p2.width &&
            p1.x + p1.width > p2.x &&
            p1.y < p2.y + p2.height &&
            p1.y + p1.height > p2.y) {

            if (this.isSuddenDeath && !p1.isDashing && !p2.isDashing) {
                return;
            }

            let dx = (p1.x + p1.width / 2) - (p2.x + p2.width / 2);
            let baseDmg = Math.floor(Math.random() * 10) + 10;

            let dmgP1ToP2 = baseDmg * (p1.isDashing ? 3 : 1);
            let dmgP2ToP1 = baseDmg * (p2.isDashing ? 3 : 1);

            p1.percentage += dmgP2ToP1;
            p2.percentage += dmgP1ToP2;

            let baseForce = 9;
            let forceP1 = baseForce * (1 + (p1.percentage / 35)) * (p2.isDashing ? 2.2 : 1);
            let forceP2 = baseForce * (1 + (p2.percentage / 35)) * (p1.isDashing ? 2.2 : 1);

            let direction = dx > 0 ? 1 : -1;
            p1.vx = direction * forceP1;
            p1.vy = -forceP1 * 0.6;
            p2.vx = -direction * forceP2;
            p2.vy = -forceP2 * 0.6;

            p1.invulnerable = 30;
            p2.invulnerable = 30;
            p1.spawnParticles(30, 'white', true);

            if (p1.isDashing || p2.isDashing) {
                this.shakeScreen(30);
            } else {
                this.shakeScreen(10);
            }

            this.triggerUpdate();

            const KO_THRESHOLD = 200;
            if (p1.percentage >= KO_THRESHOLD && !p1.respawning) {
                p1.loseLife();
            }
            if (p2.percentage >= KO_THRESHOLD && !p2.respawning) {
                p2.loseLife();
            }
        }
    }

    checkGameEnd(songEnded = false, forcedWinner = null) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.isMatchActive = false;
        this.audioEngine.cleanup();

        let result = { type: '', color: '' };
        const [p1, p2] = this.players;

        if (forcedWinner) {
            result = { type: forcedWinner, color: forcedWinner === 'p1' ? "text-pink-400" : "text-cyan-400" };
        } else if (songEnded || (p1.lives <= 0 && p2.lives <= 0)) {
            result = { type: 'tie', color: "text-white" };
        } else if (p1.lives <= 0) {
            result = { type: p2.isBot ? 'cpu' : 'p2', color: "text-cyan-400" };
        } else if (p2.lives <= 0) {
            result = { type: 'p1', color: "text-pink-400" };
        }

        this.keyboard.stop();
        this.onGameOver(result);
    }

    update(timeStepMs) {
        if (this.isGameOver) return;
        this.frameCount++;

        if (this.sdTransition) {
            this.sdTransitionFrames--;
            if (this.sdTransitionFrames <= 0) {
                this.sdTransition = false;
                this.isSuddenDeath = true;
                this.sdTimeLeftFrames = 60 * 60;
                this.players.forEach(p => {
                    p.flightTimer = 999999;
                    p.vy = -10;
                });
            }
            this.players.forEach(p => p.update(p.id === 'p1' ? this.players[1] : this.players[0]));
            this.particlePool.update();
            this.triggerUpdate();
            return;
        }

        if (this.isSuddenDeath) {
            this.sdTimeLeftFrames--;
            if (this.sdTimeLeftFrames <= 0) {
                this.resolveSuddenDeathTie();
                return;
            }
        }

        // Get Audio Analysis Bands
        let audioAnalysis = { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0, globalIntensity: 0, isBeat: false };
        if (this.audioAnalyzer && this.isMatchActive) {
            audioAnalysis = this.audioAnalyzer.analyze();
        }

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
            return;
        }

        const maxDeadSides = Math.floor((NUM_PLATFORMS / 2) * 0.8);
        const currentDeadSides = Math.floor(progress * maxDeadSides);

        // Update erratic mode based on global audio intensity
        if (this.isMatchActive && this.audioAnalyzer) {
            let prevErratic = this.isErraticMode;
            this.isErraticMode = audioAnalysis.globalIntensity > 75;
            if (prevErratic !== this.isErraticMode && Math.random() < 0.1) this.triggerUpdate();

            if ((this.isErraticMode || this.isSuddenDeath) && Math.random() < 0.05) {
                if (this.orbs.filter(o => o.active).length < 5) {
                    this.orbs.push(new DissonanceOrb(this.canvas.width, this.canvas.height));
                }
            }
        } else {
            this.isErraticMode = false;
        }

        // If generated level JSON has custom hazards/beats, trigger hazard drops deterministically
        if (this.generatedLevel && this.isMatchActive && audioAnalysis.isBeat) {
            // Seeded or matching beat spawn
            if (Math.random() < 0.3 && this.orbs.length < 4) {
                this.orbs.push(new DissonanceOrb(this.canvas.width, this.canvas.height));
            }
        }

        // Update Platforms reacting to audio mid/low bands
        const half = Math.floor(NUM_PLATFORMS / 2);
        const dataArray = audioAnalysis.dataArray;
        const step = dataArray ? Math.floor(dataArray.length * 0.7 / half) : 1;

        for (let i = 0; i < half; i++) {
            let avg = 0;
            if (this.isMatchActive && dataArray) {
                let sum = 0;
                for (let j = 0; j < step; j++) sum += dataArray[(i * step) + j];
                avg = sum / step;
                if (avg < 10 && !this.audioEngine.isMicMode) avg = 0;
            }

            if (!this.isErraticMode) avg = avg * 0.5;
            let isDeadZone = this.isMatchActive && (i < currentDeadSides);

            this.platforms[i].update(avg, this.canvas.height, this.isErraticMode, this.isMatchActive, isDeadZone, this.isSuddenDeath);
            this.platforms[NUM_PLATFORMS - 1 - i].update(avg, this.canvas.height, this.isErraticMode, this.isMatchActive, isDeadZone, this.isSuddenDeath);
        }

        // Spawning items randomly or at beats
        if (this.isMatchActive && Math.random() < 0.004) {
            this.items.push(new Item(this.canvas.width, this.canvas.height));
        }

        this.items.forEach(item => {
            item.update(this.players, () => this.triggerUpdate());
        });

        for (let i = this.orbs.length - 1; i >= 0; i--) {
            this.orbs[i].update(this.players, () => this.triggerUpdate(), this);
            if (!this.orbs[i].active && this.orbs[i].y > this.canvas.height) {
                this.orbs.splice(i, 1);
            }
        }

        // Update player entities with their polled mapped input
        const inputState1 = this.inputMapper1.poll();
        const inputState2 = this.inputMapper2.poll();

        // Inject mapped input results into Player instances
        this.players[0].lastPolledInput = inputState1;
        this.players[1].lastPolledInput = inputState2;

        this.players[0].update(this.players[1]);
        this.players[1].update(this.players[0]);
        
        this.handlePlayerCollisions();

        // Update pooled particles
        this.particlePool.update();

        if (this.isMatchActive && this.frameCount % 5 === 0) {
            this.triggerUpdate();
        }
    }

    getState() {
        return {
            width: this.canvas.width,
            height: this.canvas.height,
            players: this.players,
            platforms: this.platforms,
            items: this.items,
            orbs: this.orbs,
            particles: this.particlePool.getActiveParticles(),
            isErraticMode: this.isErraticMode,
            isSuddenDeath: this.isSuddenDeath,
            sdTransition: this.sdTransition,
            sdTransitionFrames: this.sdTransitionFrames,
            shakeFrames: this.shakeFrames,
            theme: this.settings.theme,
            isMobile: this.isMobile
        };
    }

    cleanup() {
        this.keyboard.stop();
        this.audioEngine.cleanup();
    }
}
