---
description: "Guidelines for Electron desktop development in VoiceBridge."
applyTo: "electron/**/*.js"
---

# Electron Desktop Development Guidelines

## General Rules

1. **Main Process**:
   - Use `electron/main.js` for the main process logic.
   - Example:
     ```javascript
     const { app, BrowserWindow } = require('electron');

     app.on('ready', () => {
       const win = new BrowserWindow({ width: 800, height: 600 });
       win.loadFile('index.html');
     });
     ```

2. **Preload Scripts**:
   - Use `electron/preload.js` for secure IPC communication.
   - Example:
     ```javascript
     const { contextBridge } = require('electron');

     contextBridge.exposeInMainWorld('api', {
       send: (channel, data) => ipcRenderer.send(channel, data),
     });
     ```

3. **Single Command Launch**:
   - Ensure the app launches with `npm run electron`.

4. **Environment Variables**:
   - Store secrets in `.env`.
   - Use `process.env` to access them.

5. **Testing**:
   - Test IPC communication.
   - Ensure the app launches correctly on all platforms.

---

**Example Prompts**:
- "Set up Electron for Phase 2 desktop launch."
- "Add IPC communication for real-time updates."
- "Refactor preload scripts for better security."
