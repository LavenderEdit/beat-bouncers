import { apiClient } from './apiClient';

export const mediaService = {
    /**
     * Submit a YouTube URL to trigger level generation on the backend.
     */
    async generateLevel(youtubeUrl, difficulty = 'normal') {
        return await apiClient.post('/api/media/generate-level', { url: youtubeUrl, difficulty });
    },

    /**
     * Poll the status of a level generation job.
     */
    async getJobStatus(jobId) {
        return await apiClient.get(`/api/media/jobs/${jobId}`);
    },

    /**
     * Retrieve the generated level config json.
     */
    async getLevel(levelId) {
        return await apiClient.get(`/api/media/levels/${levelId}`);
    }
};
