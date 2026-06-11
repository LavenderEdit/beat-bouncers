import { apiClient } from './apiClient';

/**
 * Checks if the backend server is reachable and active.
 * @returns {Promise<boolean>} True if backend is healthy, false otherwise.
 */
export async function checkBackendHealth() {
    try {
        const res = await apiClient.get('/health', { timeout: 3000 });
        return res && res.status === 'OK';
    } catch (err) {
        console.warn('[BackendStatus] Health check failed:', err.message);
        return false;
    }
}
