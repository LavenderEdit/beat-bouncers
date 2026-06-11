# Beat Bouncers Client-Server API Contracts

This document specifies the communication endpoints and protocols between the Vite React frontend and the NestJS backend.

---

## 1. Environment Variables

- `VITE_BACKEND_URL`: The absolute URL of the HTTP/WebSocket backend server.
  - Development Default: `http://localhost:3001` (or local port)
  - Production Default: `https://beat-bouncers-api.studios-tkoh.online`

---

## 2. HTTP API Endpoints

### 2.1 Health Check
Verify backend connectivity and operational status.
- **GET** `/health`
- **Response (200 OK)**:
  ```json
  {
    "status": "OK",
    "timestamp": "2026-06-11T16:00:00.000Z",
    "uptime": 124.5
  }
  ```

### 2.2 Trigger Level Generation
Submit a YouTube video URL to generate a custom rhythmic level layout.
- **POST** `/api/media/generate-level`
- **Body**:
  ```json
  {
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "difficulty": "normal" // "easy" | "normal" | "hard" | "expert"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "jobId": "job_123abc"
  }
  ```

### 2.3 Get Generation Job Status
Poll progress of a BullMQ generation job.
- **GET** `/api/media/jobs/:jobId`
- **Response (200 OK)**:
  ```json
  {
    "jobId": "job_123abc",
    "status": "completed", // "waiting" | "active" | "completed" | "failed"
    "progress": 100,
    "result": {
      "levelId": "media_xyz987",
      "title": "Rick Astley - Never Gonna Give You Up",
      "duration": 212,
      "bpm": 113
    },
    "failedReason": null
  }
  ```

### 2.4 Get Level JSON Configuration
Retrieve platforms, beats, and hazards design for offline gameplay.
- **GET** `/api/media/levels/:levelId`
- **Response (200 OK)**:
  ```json
  {
    "id": "media_xyz987",
    "title": "Rick Astley - Never Gonna Give You Up",
    "sourceType": "youtube",
    "duration": 212,
    "bpm": 113,
    "difficulty": "normal",
    "audioUrl": "/api/media/audio/media_xyz987",
    "beats": [
      { "time": 0.53, "strength": 120 }
    ],
    "platforms": [
      { "time": 0, "x": 150, "y": 400, "width": 500, "type": "normal" }
    ],
    "hazards": [
      { "time": 3.4, "type": "orb", "x": 350, "y": 200 }
    ]
  }
  ```

### 2.5 Stream Normalised Audio Stream
Download the converted mp3 audio stream.
- **GET** `/api/media/audio/:mediaId`
- **Response (200 OK)**: Audio stream in `audio/mpeg` format.

---

## 3. WebSockets (Socket.IO)

Clients connect to the base path `WS_URL` with query authentication:
```javascript
io(WS_URL, { query: { username: "playerName" } })
```

### 3.1 Client Events (Emitted by Frontend)

- `client:ping`: Measures network roundtrip latency.
  - Body: `{}`
- `client:joinQueue`: Enters matchmaking queue.
  - Body: `{}`
- `client:leaveQueue`: Leaves matchmaking queue.
  - Body: `{}`
- `client:ready`: Toggles ready status inside ready room.
  - Body: `{ "roomId": "room_xyz", "ready": true }`
- `client:input`: Sends canonical input packet.
  - Body:
    ```json
    {
      "roomId": "room_xyz",
      "seq": 142,
      "tick": 890,
      "timestamp": 1781290382,
      "input": {
        "left": false,
        "right": true,
        "jump": false,
        "dash": false,
        "axisX": 1.0
      }
    }
    ```
- `client:disconnectMatch`: Exits match lobby.
  - Body: `{}`
- `client:requestRoomState`: Request initial room schema on connection.
  - Body: `{ "roomId": "room_xyz" }`

### 3.2 Server Events (Emitted by Backend)

- `server:pong`: Latency acknowledgment.
  - Payload: `{ "timestamp": 1781290382 }`
- `server:queueStatus`: Reports current queue count.
  - Payload: `{ "inQueue": true, "queueLength": 3 }`
- `server:roomCreated`: Triggers transition to ready room.
  - Payload: `{ "roomId": "room_xyz", "players": [...] }`
- `server:matchCountdown`: Triggers readiness countdown.
  - Payload: `{ "countdown": 3 }`
- `server:matchStart`: Commences the simulation loop.
  - Payload: `{}`
- `server:state`: Decoupled authoritative state tick broadcast (20Hz).
  - Payload:
    ```json
    {
      "roomId": "room_xyz",
      "tick": 940,
      "serverTime": 1781290412,
      "players": [
        {
          "id": "socket_id_here",
          "name": "Player 1",
          "color": "#ff00ff",
          "x": 200,
          "y": 300,
          "vx": 0,
          "vy": 0,
          "lives": 3,
          "percentage": 15,
          "facingRight": true,
          "isDashing": false,
          "dashCooldown": 0,
          "respawning": false,
          "lastProcessedInputSeq": 142
        }
      ],
      "platforms": [
        { "id": "plat_main", "x": 150, "y": 400, "width": 500, "height": 10, "type": "normal" }
      ],
      "items": [],
      "hazards": [],
      "match": {
        "status": "playing", // "waiting" | "countdown" | "playing" | "suddenDeath" | "ended"
        "elapsedMs": 15200
      }
    }
    ```
- `server:matchEnd`: Ends the active match.
  - Payload: `{ "winner": { "id": "socket_id", "name": "WinnerName" } }`
