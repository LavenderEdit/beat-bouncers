import { FrequencyBands } from './FrequencyBands';
import { BeatDetector } from './BeatDetector';

export class AudioAnalyzer {
    constructor(analyserNode) {
        this.analyser = analyserNode;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.beatDetector = new BeatDetector();
    }

    /**
     * Poll latest frequency values and return calculated bands and beat triggers.
     */
    analyze() {
        this.analyser.getByteFrequencyData(this.dataArray);
        const bands = FrequencyBands.getBands(this.dataArray);
        const isBeat = this.beatDetector.detect(bands.bass);

        return {
            ...bands,
            isBeat,
            dataArray: this.dataArray
        };
    }
}
