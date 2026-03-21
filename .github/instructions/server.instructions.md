---
description: "Guidelines for Node.js backend development in VoiceBridge."
applyTo: "server/src/**/*.js"
---

# Node.js Backend Development Guidelines

## General Rules

1. **Use Express for HTTP Routes**:
   - Place route handlers in `server/src/controllers/`.
   - Example:
     ```javascript
     const express = require('express');
     const router = express.Router();

     router.get('/example', (req, res) => {
       res.send('Hello, World!');
     });

     module.exports = router;
     ```

2. **Use Socket.io for Real-Time Communication**:
   - Place socket event handlers in `server/src/sockets/`.
   - Example:
     ```javascript
     io.on('connection', (socket) => {
       socket.on('event', (data) => {
         console.log(data);
       });
     });
     ```

3. **Folder Structure**:
   - Follow the structure:
     ```
     server/src/
     ├── routes/      # HTTP routes
     ├── controllers/ # Route handlers
     ├── services/    # Business logic
     ├── sockets/     # Socket event handlers
     ├── models/      # Data models
     └── index.js     # Server entry point
     ```

4. **Environment Variables**:
   - Store secrets in `.env`.
   - Use `process.env` to access them.

5. **Testing**:
   - Write unit tests for services and controllers.
   - Use mock data for socket tests.

---

**Example Prompts**:
- "Add a new HTTP route for Phase 1 translation API."
- "Set up a socket event for real-time translation."
- "Refactor services for better modularity."
