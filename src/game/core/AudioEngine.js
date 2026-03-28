export class AudioEngine {
    constructor() {
        this.audioCtx = null;
        this.analyser = null;
        this.source = null;
        this.gainNode = null;
        this.dataArray = null;
        this.isMicMode = false;
    }

    async init(sourceType, file, volume = 0.5, onSongEnded) {
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
            this.source = this.audioCtx.createBufferSource();
            this.source.buffer = audioBuffer;

            this.source.connect(this.analyser);
            this.analyser.connect(this.gainNode);
            this.gainNode.connect(this.audioCtx.destination);

            this.source.start(0);
            this.source.onended = onSongEnded;
        } else if (sourceType === 'mic') {
            this.isMicMode = true;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.source = this.audioCtx.createMediaStreamSource(stream);
            this.source.connect(this.analyser);
        }
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