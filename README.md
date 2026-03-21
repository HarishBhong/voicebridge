# VoiceBridge

VoiceBridge is a real-time multilingual speech translator designed to facilitate seamless communication between English and Japanese speakers. The project is structured to ensure scalability, maintainability, and ease of collaboration.

## Project Structure

### Frontend (React)
Located in the `src/` directory, the frontend is built with React and is responsible for the user interface and client-side logic.

#### Key Directories:
- **`src/components/`**: Reusable UI components.
- **`src/hooks/`**: Custom React hooks.
- **`src/services/`**: API and socket communication logic.
- **`src/utils/`**: Utility functions.

### Backend (Node.js)
Located in the `server/src/` directory, the backend is built with Node.js and Express. It handles HTTP routes, real-time socket communication, and business logic.

#### Key Directories:
- **`server/src/routes/`**: HTTP route definitions.
- **`server/src/controllers/`**: Route handlers.
- **`server/src/services/`**: Business logic.
- **`server/src/sockets/`**: Socket.io event handlers.
- **`server/src/models/`**: Data models.

### Desktop (Electron)
Located in the `electron/` directory, the desktop wrapper ensures the application can run as a standalone desktop app.

#### Key Directories:
- **`electron/ipc/`**: Inter-process communication (IPC) logic.

## Development Guidelines

1. **Frontend**:
   - Use functional components and hooks.
   - Place reusable logic in `src/hooks/`.
   - Place API/socket logic in `src/services/`.

2. **Backend**:
   - Use Express for HTTP routes.
   - Use Socket.io for real-time communication.
   - Place reusable logic in `server/src/services/`.

3. **Desktop**:
   - Use `electron/main.js` for the main process.
   - Use `electron/preload.js` for secure IPC communication.

4. **Engineering Standard (Mandatory)**:
   - Follow `docs/engineering-standards.md` for every feature change.
   - Keep logic modular so features can be changed independently.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Web App (Recommended)**:
   ```bash
   npm run dev
   ```
   This starts both backend API and frontend in browser mode.

3. **Open in Browser**:
   ```bash
   http://localhost:5173
   ```

4. **Run Desktop App (Optional)**:
   ```bash
   npm run dev:desktop
   ```
   Use this only when you specifically want Electron shell testing.

## Phase 6 Whisper Fallback (Optional)

To enable API-based speech transcription fallback:

- Frontend env:
   - `VITE_ENABLE_WHISPER_FALLBACK=true`
   - `VITE_API_URL=http://localhost:3000` (if different from socket URL)
- Backend env:
   - `WHISPER_API_URL=<your whisper transcription endpoint>`
   - `WHISPER_BEARER_TOKEN=<optional token>`
   - `WHISPER_FILE_FIELD=file` (optional override)

When enabled, VoiceBridge can use MediaRecorder + `/speech/transcribe` as a fallback path when browser Web Speech is unavailable.

## No-Billing Setup (Recommended for Local Demo)

Use this exact flow to run VoiceBridge without paid APIs.

1. Copy `.env.example` to `.env`.
2. Start local Whisper server:
   ```bash
   npm run dev:whisper
   ```
3. Start backend:
   Already included in `npm run dev`.
4. Start frontend:
   Already included in `npm run dev`.
5. Start Electron shell (optional):
   ```bash
   npm run dev:desktop
   ```

Verify config:

- Open `http://localhost:3000/speech/config`
- Expected: `provider: whisper-api` and `configured: true`

If you see repeated `503` on `/speech/transcribe`, make sure `npm run dev:whisper` is still running and `.env` values match `.env.example`.

## Future Enhancements

- Voice output translation.
- AI conversation intelligence.
- Offline capabilities with local AI models.

---

For detailed development guidelines, refer to the `copilot-instructions.md` file.
