export class FrequencyBands {
    /**
     * Compute averages for specific bands from frequency data.
     * @param {Uint8Array} dataArray 
     * @returns {Object}
     */
    static getBands(dataArray) {
        if (!dataArray || dataArray.length === 0) {
            return { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0, globalIntensity: 0 };
        }

        const len = dataArray.length;
        
        // Dynamic bin allocation based on sizes
        const bassEnd = Math.floor(len * 0.05); // bins 0 to 12
        const lowMidEnd = Math.floor(len * 0.15); // bins 13 to 38
        const midEnd = Math.floor(len * 0.45); // bins 39 to 115
        const highMidEnd = Math.floor(len * 0.70); // bins 116 to 179
        
        let bassSum = 0;
        for (let i = 0; i < bassEnd; i++) bassSum += dataArray[i];
        
        let lowMidSum = 0;
        for (let i = bassEnd; i < lowMidEnd; i++) lowMidSum += dataArray[i];

        let midSum = 0;
        for (let i = lowMidEnd; i < midEnd; i++) midSum += dataArray[i];

        let highMidSum = 0;
        for (let i = midEnd; i < highMidEnd; i++) highMidSum += dataArray[i];

        let trebleSum = 0;
        for (let i = highMidEnd; i < len; i++) trebleSum += dataArray[i];

        let globalSum = 0;
        for (let i = 0; i < len; i++) globalSum += dataArray[i];

        return {
            bass: bassSum / Math.max(1, bassEnd),
            lowMid: lowMidSum / Math.max(1, lowMidEnd - bassEnd),
            mid: midSum / Math.max(1, midEnd - lowMidEnd),
            highMid: highMidSum / Math.max(1, highMidEnd - midEnd),
            treble: trebleSum / Math.max(1, len - highMidEnd),
            globalIntensity: globalSum / len
        };
    }
}
