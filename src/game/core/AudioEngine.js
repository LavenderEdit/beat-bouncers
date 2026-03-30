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
        this.sdOsc = null;
    }

    async prepare(sourceType, fileOrUrl, volume = 0.5, onSongEnded) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = volume;

        if (sourceType === 'file' && fileOrUrl) {
            this.isMicMode = false;
            const arrayBuffer = await fileOrUrl.arrayBuffer();
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
            this.duration = audioBuffer.duration;

            this.source = this.audioCtx.createBufferSource();
            this.source.buffer = audioBuffer;
            this.source.connect(this.analyser);
            this.analyser.connect(this.gainNode);
            this.gainNode.connect(this.audioCtx.destination);
            this.source.onended = onSongEnded;
        } else if (sourceType === 'url') {
            this.isMicMode = false;
            const response = await fetch(fileOrUrl);
            const arrayBuffer = await response.arrayBuffer();
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

    async playRandomSuddenDeathTrack(volume = 0.5) {
        this.cleanup();

        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = 0;
        this.gainNode.connect(this.audioCtx.destination);

        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.gainNode.connect(this.analyser);

        const randTrack = Math.floor(Math.random() * 10) + 1;
        const trackUrl = `/audio/sd/sd${randTrack}.mp3`;

        try {
            const response = await fetch(trackUrl);
            if (!response.ok) throw new Error("Archivo no encontrado");

            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

            this.source = this.audioCtx.createBufferSource();
            this.source.buffer = audioBuffer;
            this.source.connect(this.gainNode);
            this.source.loop = true;

            this.gainNode.gain.linearRampToValueAtTime(volume, this.audioCtx.currentTime + 3);

            this.source.start(0);
            this.isMicMode = false;
            this.duration = 999;
            this.startTime = this.audioCtx.currentTime;
        } catch (e) {
            console.error(`Error cargando la pista SD: ${trackUrl}. Usando fallback.`, e);
            this.sdOsc = this.audioCtx.createOscillator();
            this.sdOsc.type = 'sawtooth';
            this.sdOsc.frequency.setValueAtTime(60, this.audioCtx.currentTime);
            this.sdOsc.connect(this.gainNode);
            this.gainNode.gain.linearRampToValueAtTime(volume * 0.4, this.audioCtx.currentTime + 3);
            this.sdOsc.start();
        }
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
        if (this.sdOsc) {
            try { this.sdOsc.stop(); } catch (e) { }
        }
        if (this.audioCtx) this.audioCtx.close().catch(console.error);
    }
}