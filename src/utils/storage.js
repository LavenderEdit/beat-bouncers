const STORAGE_KEY = 'beatBouncersSettings';

export const defaultSettings = {
    volume: 0.5,
    language: 'es',
    particles: true,
    lives: 3,
    theme: 'neon'
};

export const loadSettings = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {
        console.error("Error cargando configuración", e);
    }
    return defaultSettings;
};

export const saveSettings = (settings) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Error guardando configuración", e);
    }
};