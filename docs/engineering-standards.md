# VoiceBridge Engineering Standards (Translator-First)

## Goal
Keep code easy to navigate, understand, test, and modify without breaking unrelated features.

## Mandatory Structure
- Frontend UI in `src/components/`
- Frontend logic in `src/hooks/`
- Frontend network/socket access in `src/services/`
- Backend HTTP routes in `server/src/routes/`
- Backend request handlers in `server/src/controllers/`
- Backend business logic in `server/src/services/`
- Backend socket handlers in `server/src/sockets/`

## Change Rules (Apply Every Step)
1. One feature = small, focused modules per layer (UI/hook/service or route/controller/service/socket).
2. Never place new business logic directly in top-level app entry files (`src/App.jsx`, `server/server.js`).
3. Reuse shared helpers before adding new logic branches.
4. Keep naming explicit and domain-based (`summaryService`, `translationSocket`).
5. Update tracker/docs when scope changes or a phase item is completed/canceled.

## Safe-Change Checklist
- Feature works end-to-end.
- Existing behavior unchanged outside the target feature.
- Modified files stay in proper folders.
- Basic error checks pass.
- Progress docs updated.

## Current Product Scope
- Translator-focused product.
- Meeting-mode Phase 3 is canceled/de-scoped.
