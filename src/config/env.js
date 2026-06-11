// Environment configuration for the backend services
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://beat-bouncers-api.studios-tkoh.online';

export const ENV = {
    BACKEND_URL: backendUrl,
    WS_URL: backendUrl,
};
