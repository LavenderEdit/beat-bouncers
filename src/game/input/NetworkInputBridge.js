import { matchmakingService } from '../../services/matchmakingService';

export class NetworkInputBridge {
    constructor(roomId) {
        this.roomId = roomId;
    }

    sendInput(inputState, currentTick) {
        // Map canonical InputState into PlayerInput schema
        const payload = {
            left: inputState.left,
            right: inputState.right,
            jump: inputState.jump,
            dash: inputState.dash,
            axisX: inputState.axisX
        };

        // client:input payload is sent via matchmakingService
        matchmakingService.sendInput(
            this.roomId, 
            inputState.seq, 
            currentTick, 
            payload
        );
    }
}
