import { ENV } from '../config/env';

/**
 * Standardized request helper with timeout and error handling.
 */
export async function apiRequest(endpoint, options = {}) {
    const { timeout = 10000, ...customOptions } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const url = endpoint.startsWith('http') ? endpoint : `${ENV.BACKEND_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...customOptions.headers,
    };

    try {
        const response = await fetch(url, {
            ...customOptions,
            headers,
            signal: controller.signal,
        });
        clearTimeout(id);

        if (!response.ok) {
            let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMsg = Array.isArray(errorData.message) 
                        ? errorData.message.join(', ') 
                        : errorData.message;
                }
            } catch (e) {
                // Not JSON or empty body
            }
            throw new Error(errorMsg);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return response;
    } catch (err) {
        clearTimeout(id);
        if (err.name === 'AbortError') {
            throw new Error('La solicitud ha superado el tiempo de espera (Timeout)');
        }
        throw err;
    }
}

export const apiClient = {
    get: (endpoint, options) => apiRequest(endpoint, { method: 'GET', ...options }),
    post: (endpoint, body, options) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
};
