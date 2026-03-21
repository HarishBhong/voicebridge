---
description: "Workspace-wide guidelines for VoiceBridge development."
applyTo: "**/*"
---

# VoiceBridge Development Guidelines

## General Rules

1. **Follow the active roadmap**: Always ensure development aligns with current product scope.
   - Phase 1: MVP Translator ✅
   - Phase 2: Desktop Application ✅
   - Phase 3: Real-Time Meeting Mode ❌ (Canceled / out of scope)
   - Phase 4: Voice Output Translation (active)
   - Phase 5: AI Conversation Intelligence (active)
   - Phase 6: Local AI Models (planned)
   - Phase 7: Extraordinary Features (planned)

2. **Maintain Modular Architecture**:
   - Use services for business logic.
   - Keep controllers focused on routing.
   - Separate socket events from HTTP logic.

3. **Coordinate Across Layers**:
   - Ensure changes in one layer (frontend/backend/desktop) are reflected in others.
   - Example: Adding a new socket event requires updates to `server/src/sockets/`, `src/services/`, and `electron/main.js`.

4. **Document Phase-Specific Changes**:
   - Add comments indicating which phase a feature belongs to.
   - Example: `// Phase 1: MVP Translator`

5. **Environment Variables**:
   - Store secrets (e.g., API keys, server URLs) in `.env`.
   - Never hardcode sensitive information.

## Frontend (React)

- Use functional components and hooks.
- Place reusable logic in `src/hooks/`.
- Place API calls and socket listeners in `src/services/`.
- Follow the folder structure:
  ```
  src/
  ├── components/  # UI components
  ├── hooks/       # Custom hooks
  ├── services/    # API/socket logic
  ├── utils/       # Helper functions
  └── App.jsx      # Main app entry
  ```

## Backend (Node.js)

- Use Express for HTTP routes.
- Use Socket.io for real-time communication.
- Place reusable logic in `server/src/services/`.
- Follow the folder structure:
  ```
  server/src/
  ├── routes/      # HTTP routes
  ├── controllers/ # Route handlers
  ├── services/    # Business logic
  ├── sockets/     # Socket event handlers
  ├── models/      # Data models
  └── index.js     # Server entry point
  ```

## Desktop (Electron)

- Use `electron/main.js` for the main process.
- Use `electron/preload.js` for secure IPC communication.
- Ensure the app launches with a single command.

## Testing

- Write unit tests for services and utils.
- Test socket events end-to-end.
- Use mock data for API tests.

---

**Example Prompts**:
- "Add a new socket event for real-time translation."
- "Update the React UI for Phase 3 meeting mode."
- "Set up Electron for Phase 2 desktop launch."
