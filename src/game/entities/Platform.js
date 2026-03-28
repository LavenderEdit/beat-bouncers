import { NUM_PLATFORMS } from '../../config/constants';

export class Platform {
    constructor(index, canvasWidth, canvasHeight) {
        this.index = index;
        this.width = (canvasWidth / NUM_PLATFORMS) + 1;
        this.x = index * (canvasWidth / NUM_PLATFORMS);
        this.y = canvasHeight + 100;
        this.targetY = canvasHeight + 100;
        this.color = `hsl(${(index / NUM_PLATFORMS) * 360}, 100%, 60%)`;
        this.campTimer = 0;
        this.isCollapsing = false;
    }

    registerTouch() {
        this.campTimer++;
        if (this.campTimer > 120) this.isCollapsing = true;
    }

    update(frequencyValue, canvasHeight, isErraticMode, isMatchActive, isDeadZone = false) {
        if (isDeadZone) {
            this.targetY = canvasHeight + 200;
        } else if (!isMatchActive) {
            this.targetY = canvasHeight - 50;
        } else if (!this.isCollapsing) {
            const erraticMult = isErraticMode ? 1.8 : 1.0;
            const distFromCenter = Math.abs((this.index / NUM_PLATFORMS) - 0.5) * 2;
            const heightMultiplier = 0.2 + (distFromCenter * 0.4);

            let targetHeight = (frequencyValue / 255) * (canvasHeight * heightMultiplier) * erraticMult;

            if (frequencyValue < 15) targetHeight = -100;
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

    draw(ctx, canvasHeight, isErraticMode, isDeadZone) {
        if (this.y >= canvasHeight) return;

        let drawColor = isDeadZone ? '#ff0000' : this.color;

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
