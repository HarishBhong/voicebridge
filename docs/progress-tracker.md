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
- [x] Desktop launch command in place (`npm run dev:desktop`)
- [x] Browser-first default run path (`npm run dev` starts backend + Vite)
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
- [x] Optional semantic summary mode (`semantic-lite`) with deterministic fallback

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

1. Use browser-first validation flow (`npm run dev`) and confirm stable speech → translation behavior in web mode.
2. Configure one speech transcription provider in backend `.env` (`OPENAI_API_KEY` or `WHISPER_API_URL`) and verify `/speech/config` shows `configured: true`.
3. Validate semantic summary mode by setting `VITE_SUMMARY_MODE=semantic-lite` and generating summaries from realistic history.
4. Re-run optional desktop smoke test (`npm run dev:desktop`) and confirm no repeated `/speech/transcribe` 503 requests.
5. Plan Phase 6 next increment: offline Piper TTS backend bridge design (API contract + voice selection schema).

---

**Instructions**: Update this tracker as you complete active tasks. Keep canceled phases marked as de-scoped for historical clarity.