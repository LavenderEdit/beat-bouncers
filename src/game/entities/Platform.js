import { NUM_PLATFORMS } from '../../config/constants';

export class Platform {
    constructor(index, canvasWidth, canvasHeight, total = NUM_PLATFORMS) {
        this.index = index;
        this.width = (canvasWidth / total) + 1;
        this.x = index * (canvasWidth / total);
        this.y = canvasHeight + 100;
        this.targetY = canvasHeight + 100;
        this.campTimer = 0;
        this.isCollapsing = false;

        this.colorRatio = index / total;
    }

    registerTouch() {
        this.campTimer++;
        if (this.campTimer > 120) this.isCollapsing = true;
    }

    update(frequencyValue, canvasHeight, isErraticMode, isMatchActive, isDeadZone = false, isSuddenDeath = false) {
        if (isDeadZone || isSuddenDeath) {
            this.targetY = canvasHeight + 200;
        } else if (!isMatchActive) {
            this.targetY = canvasHeight - 50;
        } else if (!this.isCollapsing) {
            const erraticMult = isErraticMode ? 1.8 : 1.0;
            const distFromCenter = Math.abs((this.index / NUM_PLATFORMS) - 0.5) * 2;
            const heightMultiplier = 0.2 + (distFromCenter * 0.4);

            let targetHeight = (frequencyValue / 255) * (canvasHeight * heightMultiplier) * erraticMult;

            if (frequencyValue < 15) targetHeight = 50;
            this.targetY = canvasHeight - targetHeight;
            this.campTimer = Math.max(0, this.campTimer - 0.5);
        } else {
            this.targetY = canvasHeight + 200;
            if (this.y > canvasHeight) {
                this.isCollapsing = false;
                this.campTimer = 0;
            }
        }

        this.y += (this.targetY - this.y) * (isErraticMode ? 0.4 : 0.2);
    }

    draw(ctx, canvasHeight, isErraticMode, isDeadZone, theme = 'neon') {
        if (this.y >= canvasHeight) return;

        let myColor = `hsl(${this.colorRatio * 360}, 100%, 60%)`;
        if (theme === 'matrix') myColor = '#00ff44';
        if (theme === 'blood') myColor = '#ff1100';

        let drawColor = isDeadZone ? '#ff0000' : myColor;

        ctx.shadowBlur = isErraticMode ? 25 : 10;
        ctx.shadowColor = drawColor;

        let gradient = ctx.createLinearGradient(this.x, this.y, this.x, canvasHeight);
        gradient.addColorStop(0, drawColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width - 1, canvasHeight - this.y);

        ctx.fillStyle = this.isCollapsing ? 'red' : 'white';
        ctx.fillRect(this.x, this.y, this.width - 1, 4);
        ctx.shadowBlur = 0;
    }
}