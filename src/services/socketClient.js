import { io } from 'socket.io-client';
import { ENV } from '../config/env';

let socket = null;
let pingInterval = null;
let latency = 0;
const listeners = new Map();

export const socketClient = {
    connect(username, onConnect, onDisconnect, onError) {
        if (socket) {
            socket.disconnect();
        }

        console.log(`[Socket] Connecting to ${ENV.WS_URL} with username=${username}`);
        socket = io(ENV.WS_URL, {
            query: { username },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected, ID:', socket.id);
            if (onConnect) onConnect();
            this.startPingInterval();
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
            if (onDisconnect) onDisconnect(reason);
            this.stopPingInterval();
        });

        socket.on('connect_error', (err) => {
            console.error('[Socket] Connection error:', err.message);
            if (onError) onError(err);
        });

        // Re-bind existing event listeners if any were added beforehand
        for (const [event, callbackSet] of listeners.entries()) {
            for (const cb of callbackSet) {
                socket.on(event, cb);
            }
        }
    },

    disconnect() {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
        this.stopPingInterval();
    },

    isConnected() {
        return socket ? socket.connected : false;
    },

    getId() {
        return socket ? socket.id : null;
    },

    on(event, callback) {
        if (!listeners.has(event)) {
            listeners.set(event, new Set());
        }
        listeners.get(event).add(callback);
        if (socket) {
            socket.on(event, callback);
        }
    },

    off(event, callback) {
        if (listeners.has(event)) {
            listeners.get(event).delete(callback);
            if (listeners.get(event).size === 0) {
                listeners.delete(event);
            }
        }
        if (socket) {
            socket.off(event, callback);
        }
    },

    emit(event, data) {
        if (socket && socket.connected) {
            socket.emit(event, data);
        } else {
            console.warn(`[Socket] Attempted to emit "${event}" but socket is not connected.`);
        }
    },

    startPingInterval() {
        this.stopPingInterval();
        pingInterval = setInterval(() => {
            if (socket && socket.connected) {
                const start = Date.now();
                socket.emit('client:ping');
                
                const pongHandler = () => {
                    latency = Date.now() - start;
                    socket.off('server:pong', pongHandler);
                };
                socket.on('server:pong', pongHandler);
            }
        }, 3000);
    },

    stopPingInterval() {
        if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
        }
    },

    getLatency() {
        return latency;
    }
};
