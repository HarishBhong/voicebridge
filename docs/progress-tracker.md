# VoiceBridge Progress Tracker

## Phase Checklist

### Phase 1: MVP Translator
- [x] Speech recognition (Web Speech API)
- [x] Socket communication
- [x] Real-time UI translation
- [x] Bidirectional translation (EN ↔ JP)
- [x] Frontend modularization (hooks + reusable components)
- [x] Milestone: "User speaks → translation appears live" ✅

### Phase 2: Desktop Application
- [x] Electron wrapper (loads app, IPC preload in place)
- [x] Single command launch (`npm run dev` starts Electron)
- [x] Desktop connectivity indicator (API connected/disconnected status)
- [x] Runtime status reliability hardening (socket badge accuracy + speech provider labeling clarity)
- [ ] Speech recognition inside Electron (Web Speech API blocked in Electron dev builds — deferred to Phase 6 Whisper integration)
- [x] Milestone: VoiceBridge runs as desktop application (speech capture fallback to browser flow)

### Phase 3: Real-Time Meeting Mode (Canceled / Not Needed)
- [x] De-scoped by product direction (VoiceBridge is not a meeting app)
- [x] Multi-user meetings — canceled
- [x] Recording & session management — canceled
- [x] Speaker identification — canceled

### Phase 4: Voice Output Translation
- [x] TTS initial (SpeechSynthesis API)
- [ ] Neural TTS upgrade later

### Phase 5: AI Meeting Intelligence
- [x] Meeting summaries (local summary endpoint + UI generation)
- [x] Action item detection
- [x] Topic extraction

### Phase 6: Local AI Models
- [x] Whisper speech recognition foundation (API route + frontend fallback path scaffold)
- [x] Whisper fallback safety guard (prevent unconfigured provider request loop / 503 spam)
- [x] Open-source translation foundation (provider abstraction + LibreTranslate-ready backend)
- [ ] Piper TTS (offline)

### Phase 7: Extraordinary Features
- [ ] Predictive translation
- [ ] Emotion-aware translation
- [ ] Voice cloning translation
- [ ] Overlay subtitles

---

## Immediate Next Steps

1. Configure one speech transcription provider in backend `.env` (`OPENAI_API_KEY` or `WHISPER_API_URL`) and verify `/speech/config` shows `configured: true`.
2. Re-run desktop smoke test and confirm no repeated `/speech/transcribe` 503 requests.
3. Validate translation provider proof via WebSocket `translation` payload `provider` field.
4. Plan summary quality upgrade path (semantic mode + deterministic fallback).

---

**Instructions**: Update this tracker as you complete active tasks. Keep canceled phases marked as de-scoped for historical clarity.