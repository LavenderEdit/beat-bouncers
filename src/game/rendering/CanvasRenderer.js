/**
 * CanvasRenderer
 * Responsible for rendering all game entities and effects to the screen.
 * Decoupled from physics and networking.
 */
export class CanvasRenderer {
    constructor() {
        this.offscreenBg = null;
        this.bgNeedsRedraw = true;
    }

    /**
     * Renders the complete game state.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Object} state - The complete active game state (local or interpolated network state)
     * @param {Object} settings - Volume, theme, quality, particles, etc.
     */
    draw(ctx, state, settings) {
        const {
            width,
            height,
            players = [],
            platforms = [],
            items = [],
            orbs = [],
            particles = [],
            isErraticMode = false,
            isSuddenDeath = false,
            sdTransition = false,
            shakeFrames = 0,
            theme = 'neon',
            isMobile = false
        } = state;

        ctx.save();

        // 1. Camera screen shake
        if (shakeFrames > 0) {
            const intensity = shakeFrames > 10 ? 15 : 5;
            const shakeX = (Math.random() - 0.5) * intensity;
            const shakeY = (Math.random() - 0.5) * intensity;
            ctx.translate(shakeX, shakeY);
        }

        // 2. Render static background (cached or direct)
        this.drawBackground(ctx, width, height, isErraticMode, theme, settings.quality);

        // 3. Render platforms
        platforms.forEach(plat => {
            this.drawPlatform(ctx, plat, height, isErraticMode, theme, isMobile);
        });

        // 4. Render items
        items.forEach(item => {
            if (item.active) {
                this.drawItem(ctx, item, isMobile);
            }
        });

        // 5. Render dissonance orbs
        orbs.forEach(orb => {
            if (orb.active) {
                this.drawOrb(ctx, orb, isMobile);
            }
        });

        // 6. Render players
        players.forEach(p => {
            if (p.lives > 0) {
                this.drawPlayer(ctx, p, isMobile);
            }
        });

        // 7. Render particles
        if (settings.particles) {
            const pLimit = settings.quality === 'low' ? 50 : (settings.quality === 'medium' ? 150 : 500);
            particles.slice(0, pLimit).forEach(part => {
                if (part.life > 0) {
                    this.drawParticle(ctx, part, isMobile);
                }
            });
        }

        // 8. Visual bloom composite (Only on High quality)
        if (settings.quality === 'high' && isErraticMode) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = 'rgba(255, 0, 255, 0.03)';
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.restore();
    }

    drawBackground(ctx, width, height, isErraticMode, theme, quality) {
        // Redraw cached background if dimensions changed
        if (!this.offscreenBg || this.offscreenBg.width !== width || this.offscreenBg.height !== height || this.bgNeedsRedraw) {
            this.offscreenBg = document.createElement('canvas');
            this.offscreenBg.width = width;
            this.offscreenBg.height = height;
            const bgCtx = this.offscreenBg.getContext('2d');
            
            let bgGradient = bgCtx.createLinearGradient(0, 0, 0, height);
            if (theme === 'matrix') {
                bgGradient.addColorStop(0, '#000800');
                bgGradient.addColorStop(1, '#000200');
            } else if (theme === 'blood') {
                bgGradient.addColorStop(0, '#120000');
                bgGradient.addColorStop(1, '#050000');
            } else {
                bgGradient.addColorStop(0, '#050512');
                bgGradient.addColorStop(1, '#010105');
            }
            bgCtx.fillStyle = bgGradient;
            bgCtx.fillRect(0, 0, width, height);

            // Draw grid dots on Medium/High quality
            if (quality !== 'low') {
                bgCtx.strokeStyle = theme === 'matrix' ? 'rgba(0, 255, 0, 0.05)' : (theme === 'blood' ? 'rgba(255, 0, 0, 0.05)' : 'rgba(255, 0, 255, 0.03)');
                bgCtx.lineWidth = 1;
                const gridSize = 40;
                bgCtx.beginPath();
                for (let x = 0; x < width; x += gridSize) {
                    bgCtx.moveTo(x, 0);
                    bgCtx.lineTo(x, height);
                }
                for (let y = 0; y < height; y += gridSize) {
                    bgCtx.moveTo(0, y);
                    bgCtx.lineTo(width, y);
                }
                bgCtx.stroke();
            }
            this.bgNeedsRedraw = false;
        }

        // Draw offscreen background
        ctx.drawImage(this.offscreenBg, 0, 0);

        // Flash screen background slightly if erratic/intense beats
        if (isErraticMode) {
            ctx.fillStyle = theme === 'matrix' ? 'rgba(0, 255, 0, 0.02)' : (theme === 'blood' ? 'rgba(255, 0, 0, 0.03)' : 'rgba(255, 0, 255, 0.02)');
            ctx.fillRect(0, 0, width, height);
        }
    }

    drawPlatform(ctx, plat, canvasHeight, isErraticMode, theme, isMobile) {
        if (plat.y >= canvasHeight) return;

        let myColor = `hsl(${plat.colorRatio * 360}, 100%, 60%)`;
        if (theme === 'matrix') myColor = '#00ff44';
        if (theme === 'blood') myColor = '#ff1100';

        let drawColor = plat.isDeadZone ? '#ff0000' : myColor;

        if (isMobile) {
            ctx.fillStyle = drawColor;
            ctx.fillRect(plat.x, plat.y, plat.width - 1, canvasHeight - plat.y);
        } else {
            ctx.shadowBlur = isErraticMode ? 15 : 6;
            ctx.shadowColor = drawColor;

            let gradient = ctx.createLinearGradient(plat.x, plat.y, plat.x, canvasHeight);
            gradient.addColorStop(0, drawColor);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(plat.x, plat.y, plat.width - 1, canvasHeight - plat.y);
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = plat.isCollapsing ? 'red' : 'white';
        ctx.fillRect(plat.x, plat.y, plat.width - 1, 4);
    }

    drawItem(ctx, item, isMobile) {
        ctx.fillStyle = item.color;
        if (!isMobile) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = item.color;
        }

        if (item.type === 'heal') {
            ctx.fillRect(item.x, item.y, item.size, item.size);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(item.x + 10, item.y + 5, 5, 15);
            ctx.fillRect(item.x + 5, item.y + 10, 15, 5);
        } else if (item.type === 'fly') {
            ctx.beginPath();
            ctx.moveTo(item.x + 12.5, item.y);
            ctx.lineTo(item.x + 25, item.y + 12.5);
            ctx.lineTo(item.x + 12.5, item.y + 25);
            ctx.lineTo(item.x, item.y + 12.5);
            ctx.fill();
        } else if (item.type === 'bomb') {
            let pulse = Math.abs(Math.sin(item.angle * 3)) * 4;
            ctx.beginPath();
            ctx.arc(item.x + 12.5, item.y + 12.5, 10 + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(item.x + 10, item.y - 5, 5, 10);
        }

        ctx.shadowBlur = 0;
    }

    drawOrb(ctx, orb, isMobile) {
        if (!isMobile) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff0055';
        }
        ctx.fillStyle = '#ff0055';

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(orb.x - 4, orb.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    drawPlayer(ctx, p, isMobile) {
        if (p.invulnerable > 0 && Math.floor(Date.now() / 80) % 2 === 0) return;
        if (p.respawning) ctx.globalAlpha = 0.5;

        let visualColor = p.color;
        if (p.percentage >= 100) visualColor = '#ffaa00';
        if (p.percentage >= 200) visualColor = '#ff0000';
        if (p.isDashing) visualColor = '#ffffff';

        // Draw jetpack flight ring
        if (p.flightTimer > 0) {
            ctx.fillStyle = '#00ffff';
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.arc(p.x + p.width / 2, p.y + p.height / 2, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = p.respawning ? 0.5 : 1.0;
        }

        if (!isMobile) {
            ctx.shadowBlur = p.isDashing ? 25 : 15;
            ctx.shadowColor = visualColor;
        }
        ctx.fillStyle = visualColor;

        if (p.isDashing) {
            ctx.fillRect(p.x - 8, p.y + 4, p.width + 16, p.height - 8);
        } else {
            ctx.fillRect(p.x, p.y, p.width, p.height);
        }

        // Draw eyes
        ctx.fillStyle = 'black';
        ctx.shadowBlur = 0;
        let eyeOffset = p.facingRight ? 6 : -6;
        ctx.fillRect(p.x + 6 + eyeOffset, p.y + 8, 5, 5);
        ctx.fillRect(p.x + 20 + eyeOffset, p.y + 8, 5, 5);

        // Draw HUD details over player
        if (!p.respawning) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 13px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(`${p.percentage}%`, p.x + p.width / 2, p.y - 18);
            ctx.font = '9px Arial';
            ctx.fillStyle = p.color;
            ctx.fillText(p.name || p.id, p.x + p.width / 2, p.y - 8);
        }

        ctx.globalAlpha = 1.0;
    }

    drawParticle(ctx, part, isMobile) {
        ctx.globalAlpha = Math.max(0, part.life / part.maxLife);
        ctx.fillStyle = part.color;

        if (!isMobile) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = part.color;
        }

        ctx.fillRect(part.x, part.y, part.size, part.size);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }
}
