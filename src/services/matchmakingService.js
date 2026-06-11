import { socketClient } from './socketClient';

export const matchmakingService = {
    /**
     * Notify the backend that the client wants to enter the matchmaking queue.
     */
    joinQueue() {
        socketClient.emit('client:joinQueue');
    },

    /**
     * Notify the backend that the client wants to leave the matchmaking queue.
     */
    leaveQueue() {
        socketClient.emit('client:leaveQueue');
    },

    /**
     * Signal the player is ready/unready inside the match room.
     */
    sendReady(roomId, ready) {
        socketClient.emit('client:ready', { roomId, ready });
    },

    /**
     * Send input updates to the server.
     */
    sendInput(roomId, seq, tick, inputData) {
        socketClient.emit('client:input', {
            roomId,
            seq,
            tick,
            timestamp: Date.now(),
            input: inputData
        });
    },

    /**
     * Voluntarily leave or forfeit a current match.
     */
    disconnectMatch() {
        socketClient.emit('client:disconnectMatch');
    },

    /**
     * Request the current room state (e.g. on reconnection or initial join).
     */
    requestRoomState(roomId) {
        socketClient.emit('client:requestRoomState', { roomId });
    }
};
