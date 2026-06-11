/**
 * Reconciliation
 * Re-applies local inputs that have not yet been acknowledged by the server.
 */
export class Reconciliation {
    /**
     * Reset local player to authoritative server state, then replay unacknowledged inputs.
     * @param {Player} localPlayer 
     * @param {Object} serverPlayerState 
     * @param {Array<InputState>} pendingInputs 
     */
    static reconcile(localPlayer, serverPlayerState, pendingInputs) {
        if (!serverPlayerState) return;

        // 1. Reset local player state to the authoritative server state
        localPlayer.x = serverPlayerState.x;
        localPlayer.y = serverPlayerState.y;
        localPlayer.vx = serverPlayerState.vx;
        localPlayer.vy = serverPlayerState.vy;
        localPlayer.percentage = serverPlayerState.percentage;
        localPlayer.lives = serverPlayerState.lives;
        localPlayer.facingRight = serverPlayerState.facingRight;
        localPlayer.isDashing = serverPlayerState.isDashing;
        localPlayer.dashCooldown = serverPlayerState.dashCooldown;
        localPlayer.respawning = serverPlayerState.respawning;

        // 2. Replay all pending inputs that have been simulated but not acknowledged by the server
        for (const input of pendingInputs) {
            localPlayer.lastPolledInput = input;
            localPlayer.update(null); // update local physics
        }
    }
}
