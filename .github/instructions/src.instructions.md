---
description: "Guidelines for React frontend development in VoiceBridge."
applyTo: "src/**/*.jsx"
---

# React Frontend Development Guidelines

## General Rules

1. **Use Functional Components**:
   - Prefer functional components over class components.
   - Use React hooks for state and lifecycle management.

2. **Folder Structure**:
   - Place reusable components in `src/components/`.
   - Place custom hooks in `src/hooks/`.
   - Place API/socket logic in `src/services/`.
   - Place helper functions in `src/utils/`.

3. **Socket Integration**:
   - Use `src/services/` for socket listeners and emitters.
   - Example:
     ```javascript
     import socket from './socket';

     socket.on('event', (data) => {
       console.log(data);
     });
     ```

4. **Styling**:
   - Use CSS modules or styled-components for scoped styles.

5. **Testing**:
   - Write unit tests for components and hooks.
   - Use mock data for API/socket tests.

---

**Example Prompts**:
- "Add a new React component for Phase 1 translation UI."
- "Set up a socket listener for real-time updates."
- "Refactor hooks to improve reusability."
