import { socketClient } from '../../services/socketClient';
import { matchmakingService } from '../../services/matchmakingService';
import { Player } from '../entities/Player';
import { Platform } from '../entities/Platform';
import { Item } from '../entities/Item';
import { DissonanceOrb } from '../entities/DissonanceOrb';
import { KeyboardInputSource } from '../input/KeyboardInputSource';
import { GamepadInputSource } from '../input/GamepadInputSource';
import { TouchInputSource } from '../input/TouchInputSource';
import { InputMapper } from '../input/InputMapper';
import { NetworkInputBridge } from '../input/NetworkInputBridge';
import { StateInterpolator } from '../networking/StateInterpolator';
import { PredictionBuffer } from '../networking/PredictionBuffer';
import { Reconciliation } from '../networking/Reconciliation';

export class NetworkGameEngine {
    constructor(canvas, onStateUpdate, onGameOver, settings, roomId) {
        this.canvas = canvas;
        this.onStateUpdate = onStateUpdate;
        this.onGameOver = onGameOver;
        this.settings = settings;
        this.roomId = roomId;

        this.myPlayerId = socketClient.getId();

        // Networking utilities
        this.interpolator = new StateInterpolator(100); // 100ms interpolation buffer delay
        this.predictionBuffer = new PredictionBuffer();
        this.inputBridge = new NetworkInputBridge(this.roomId);

        // Inputs
        this.keyboard = new KeyboardInputSource();
        this.gamepad = new GamepadInputSource(0);
        this.touch = new TouchInputSource();
        this.inputMapper = new InputMapper(this.keyboard, this.gamepad, this.touch, {
            up: 'KeyW', left: 'KeyA', right: 'KeyD', dash: 'KeyF'
        });

        this.isGameOver = false;
        this.isMatchActive = true;
        this.isSuddenDeath = false;
        this.sdTransition = false;
        this.sdCountdown = 0;
        this.sdTimeLeft = 0;
        this.shakeFrames = 0;
        this.isMobile = false;

        this.playersMap = new Map(); // id -> Player instance
        this.platforms = [];
        this.items = [];
        this.orbs = [];
        this.particles = []; // particles are purely local visual effects

        this.serverTick = 0;
        this.matchTimeStr = "0.0";
        this.latency = 0;

        this.checkMobileStatus();
        this.setupNetworkListeners();
    }

    checkMobileStatus() {
        this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768;
    }

    shakeScreen(frames) {
        this.shakeFrames = frames;
    }

    setupNetworkListeners() {
        // Start input listening
        this.keyboard.start();

        const onStateUpdate = (state) => {
            this.serverTick = state.tick;
            this.isSuddenDeath = state.match.status === 'suddenDeath';
            this.sdTransition = state.match.status === 'countdown';
            this.matchTimeStr = (state.match.elapsedMs / 1000).toFixed(1);
            this.latency = socketClient.getLatency();

            // 1. Synchronize or create players
            state.players.forEach(srvPlayer => {
                let localP = this.playersMap.get(srvPlayer.id);
                if (!localP) {
                    localP = new Player(
                        srvPlayer.id, 
                        srvPlayer.color, 
                        srvPlayer.x, 
                        null, 
                        false, 
                        this, 
                        3, // max lives
                        'normal'
                    );
                    localP.name = srvPlayer.name;
                    this.playersMap.set(srvPlayer.id, localP);
                }

                // If it is the local player, perform server reconciliation
                if (srvPlayer.id === this.myPlayerId) {
                    this.predictionBuffer.discardUpTo(srvPlayer.lastProcessedInputSeq);
                    
                    const pending = this.predictionBuffer.getPending();
                    Reconciliation.reconcile(localP, srvPlayer, pending);
                }
            });

            // Clean up players that left
            const serverIds = state.players.map(p => p.id);
            for (const key of this.playersMap.keys()) {
                if (!serverIds.includes(key)) {
                    this.playersMap.delete(key);
                }
            }

            // 2. Feed the state interpolator for remote players
            this.interpolator.push(state);

            // 3. Keep latest static hazards/platforms directly
            this.platforms = state.platforms.map(p => {
                const plat = new Platform(0, this.canvas.width, this.canvas.height);
                plat.x = p.x;
                plat.y = p.y;
                plat.width = p.width;
                plat.isDeadZone = p.type === 'danger';
                plat.colorRatio = 0.5; // generic ratio
                return plat;
            });

            this.items = state.items.map(item => {
                const it = new Item(this.canvas.width, this.canvas.height);
                it.x = item.x;
                it.y = item.y;
                it.type = item.type;
                it.active = true;
                it.color = item.type === 'heal' ? '#00ff00' : (item.type === 'fly' ? '#00ffff' : '#ff0000');
                return it;
            });

            this.orbs = state.hazards.map(haz => {
                const orb = new DissonanceOrb(this.canvas.width, this.canvas.height);
                orb.x = haz.x;
                orb.y = haz.y;
                orb.active = true;
                return orb;
            });

            this.triggerReactHUDUpdate();
        };

        const onMatchEnd = (data) => {
            console.log('[NetworkEngine] Match ended:', data);
            
            // Format results structure matching local gameover
            let forcedWinner = null;
            if (data.winner) {
                forcedWinner = data.winner.id === this.myPlayerId ? 'p1' : 'p2';
            }
            
            this.isGameOver = true;
            this.keyboard.stop();
            
            let result = { type: 'tie', color: 'text-white' };
            if (data.winner) {
                const isMeWinner = data.winner.id === this.myPlayerId;
                result = {
                    type: isMeWinner ? 'p1' : 'p2',
                    color: isMeWinner ? 'text-pink-400' : 'text-cyan-400'
                };
            }
            this.onGameOver(result);
        };

        socketClient.on('server:state', onStateUpdate);
        socketClient.on('server:matchEnd', onMatchEnd);
    }

    triggerReactHUDUpdate() {
        const playersList = Array.from(this.playersMap.values());
        this.onStateUpdate({
            players: playersList.map(p => ({
                id: p.id,
                name: p.name || p.id,
                color: p.color,
                lives: p.lives,
                percentage: p.percentage,
                dashCooldown: p.dashCooldown
            })),
            erratic: this.sdTransition,
            suddenDeath: this.isSuddenDeath,
            sdTransition: this.sdTransition,
            sdCountdown: this.sdCountdown,
            sdTimeLeft: this.sdTimeLeft,
            time: `${this.matchTimeStr} (${this.latency}ms)`
        });
    }

    update(timeStepMs) {
        if (this.isGameOver) return;

        // 1. Poll local input
        const localInput = this.inputMapper.poll();

        // 2. Queue local input for prediction replaying
        this.predictionBuffer.add(localInput);

        // 3. Emit input to WebSocket
        this.inputBridge.sendInput(localInput, this.serverTick);

        // 4. Client-side predict local player movement locally
        const myLocalPlayer = this.playersMap.get(this.myPlayerId);
        if (myLocalPlayer) {
            myLocalPlayer.lastPolledInput = localInput;
            myLocalPlayer.update(null); // predict physics step locally
        }

        // 5. Interpolate remote players
        const renderTime = Date.now();
        const interpState = this.interpolator.interpolate(renderTime);
        
        if (interpState) {
            interpState.players.forEach(srvP => {
                if (srvP.id !== this.myPlayerId) {
                    const remoteP = this.playersMap.get(srvP.id);
                    if (remoteP) {
                        remoteP.x = srvP.x;
                        remoteP.y = srvP.y;
                        remoteP.vx = srvP.vx;
                        remoteP.vy = srvP.vy;
                        remoteP.percentage = srvP.percentage;
                        remoteP.lives = srvP.lives;
                        remoteP.facingRight = srvP.facingRight;
                        remoteP.isDashing = srvP.isDashing;
                        remoteP.dashCooldown = srvP.dashCooldown;
                        remoteP.respawning = srvP.respawning;
                    }
                }
            });
        }
    }

    getState() {
        return {
            width: this.canvas.width,
            height: this.canvas.height,
            players: Array.from(this.playersMap.values()),
            platforms: this.platforms,
            items: this.items,
            orbs: this.orbs,
            particles: this.particles, // local particles
            isErraticMode: this.sdTransition,
            isSuddenDeath: this.isSuddenDeath,
            sdTransition: this.sdTransition,
            shakeFrames: this.shakeFrames,
            theme: this.settings.theme,
            isMobile: this.isMobile
        };
    }

    cleanup() {
        this.keyboard.stop();
        socketClient.off('server:state');
        socketClient.off('server:matchEnd');
    }
}
