export class AudioEngine {
    constructor() {
        this.audioCtx = null;
        this.analyser = null;
        this.source = null;
        this.gainNode = null;
        this.dataArray = null;
        this.isMicMode = false;
        this.duration = 180;
        this.startTime = 0;
    }

    async prepare(sourceType, file, volume = 0.5, onSongEnded) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = volume;

        if (sourceType === 'file' && file) {
            this.isMicMode = false;
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
            this.duration = audioBuffer.duration;

            this.source = this.audioCtx.createBufferSource();
            this.source.buffer = audioBuffer;

            this.source.connect(this.analyser);
            this.analyser.connect(this.gainNode);
            this.gainNode.connect(this.audioCtx.destination);

            this.source.onended = onSongEnded;
        } else if (sourceType === 'mic') {
            this.isMicMode = true;
            this.duration = 180;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.source = this.audioCtx.createMediaStreamSource(stream);
            this.source.connect(this.analyser);
        }
        return this.duration;
    }

    startPlaying() {
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        if (this.source && !this.isMicMode) {
            this.source.start(0);
        }
        this.startTime = this.audioCtx.currentTime;
    }

    getProgress() {
        if (!this.audioCtx || this.isMicMode) return 0;
        const current = this.audioCtx.currentTime - this.startTime;
        return Math.min(1, current / this.duration);
    }

    getFrequencyData() {
        if (!this.analyser) return { dataArray: null, globalIntensity: 0 };
        this.analyser.getByteFrequencyData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) sum += this.dataArray[i];
        const globalIntensity = sum / this.dataArray.length;
        return { dataArray: this.dataArray, globalIntensity, isMicMode: this.isMicMode };
    }

    cleanup() {
        if (this.source && !this.isMicMode) {
            try { this.source.stop(); } catch (e) { }
        }
        if (this.audioCtx) this.audioCtx.close().catch(console.error);
    }
}