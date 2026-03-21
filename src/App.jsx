import React, { useEffect, useRef } from "react";
import "./App.css";
import HistoryPanel from "./components/HistoryPanel";
import LanguageControls from "./components/LanguageControls";
import OutputPanel from "./components/OutputPanel";
import StatusBadges from "./components/StatusBadges";
import SummaryPanel from "./components/SummaryPanel";
import TTSActionControls from "./components/TTSActionControls";
import TTSSettingsPanel from "./components/TTSSettingsPanel";
import { useMeetingSummary } from "./hooks/useMeetingSummary";
import { useSocketTranslation } from "./hooks/useSocketTranslation";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useTTS } from "./hooks/useTTS";
import { removeStoredValue } from "./utils/storage";

const isElectron = typeof navigator !== "undefined" && /Electron/i.test(navigator.userAgent);

function App() {
  const emitSpeechRef = useRef(() => {});

  const speechRecognition = useSpeechRecognition({
    onSpeech: (speechPayload) => {
      if (typeof speechPayload === "string") {
        emitSpeechRef.current({ text: speechPayload });
        return;
      }

      emitSpeechRef.current(speechPayload);
    },
  });

  const tts = useTTS({
    pauseForTts: speechRecognition.pauseForTts,
    resumeAfterTts: speechRecognition.resumeAfterTts,
  });

  const {
    socketConnected,
    apiHealthy,
    translationProvider,
    translationConfigured,
    speech,
    translation,
    lastDirection,
    history,
    emitSpeech,
  } = useSocketTranslation({
    onTranslation: ({ text, direction }) => {
      tts.maybeAutoSpeak(text, direction);
    },
  });

  useEffect(() => {
    emitSpeechRef.current = emitSpeech;
  }, [emitSpeech]);

  const {
    isTtsSupported,
    autoSpeak,
    setAutoSpeak,
    availableVoices,
    englishVoices,
    japaneseVoices,
    selectedVoiceURIEn,
    setSelectedVoiceURIEn,
    selectedVoiceURIJa,
    setSelectedVoiceURIJa,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    ttsSpeaking,
    ttsOutputLang,
    ttsVoiceName,
    speakTranslation,
    stopVoice,
    resetSettings,
    testVoice,
  } = tts;

  const { summaryData, summaryLoading, summaryError, generateSummary } = useMeetingSummary();

  const showDesktopSpeechHint =
    isElectron &&
    /network|not supported|service-not-allowed|audio-capture/i.test(
      speechRecognition.speechError || ""
    );

  const handleResetDefaults = () => {
    stopVoice();
    resetSettings();
    speechRecognition.changeLanguage("en-US");
    removeStoredValue("vb_inputLang");
  };

  return (
    <div className="app-container">
      <div className="app-shell">
        <header className="app-header">
          <h1>VoiceBridge</h1>
          <p className="subtitle">Real-time bilingual speech translator</p>
        </header>

        <StatusBadges
          socketConnected={socketConnected}
          apiHealthy={apiHealthy}
          ttsSpeaking={ttsSpeaking}
          ttsOutputLang={ttsOutputLang}
          ttsVoiceName={ttsVoiceName}
          speechProvider={speechRecognition.speechProvider}
          whisperConfigured={speechRecognition.whisperConfigured}
          whisperRequired={speechRecognition.whisperRequired}
          translationProvider={translationProvider}
          translationConfigured={translationConfigured}
        />

        {showDesktopSpeechHint ? (
          <p className="desktop-note">
            Desktop mode detected. If speech recognition fails, use browser mode at <strong>http://localhost:5173</strong>.
          </p>
        ) : null}

        <LanguageControls
          inputLang={speechRecognition.inputLang}
          onLanguageChange={speechRecognition.changeLanguage}
          listening={speechRecognition.listening}
          onToggleListening={speechRecognition.toggleListening}
        />

        <TTSActionControls
          autoSpeak={autoSpeak}
          setAutoSpeak={setAutoSpeak}
          onSpeakNow={() => speakTranslation(translation, lastDirection)}
          onStopVoice={stopVoice}
          onResetDefaults={handleResetDefaults}
          onTestEnVoice={() => testVoice("en")}
          onTestJaVoice={() => testVoice("ja")}
          canSpeak={Boolean(translation)}
          isTtsSupported={isTtsSupported}
        />

        <TTSSettingsPanel
          isTtsSupported={isTtsSupported}
          englishVoices={englishVoices}
          japaneseVoices={japaneseVoices}
          allVoices={availableVoices}
          selectedVoiceURIEn={selectedVoiceURIEn}
          setSelectedVoiceURIEn={setSelectedVoiceURIEn}
          selectedVoiceURIJa={selectedVoiceURIJa}
          setSelectedVoiceURIJa={setSelectedVoiceURIJa}
          speechRate={speechRate}
          setSpeechRate={setSpeechRate}
          speechPitch={speechPitch}
          setSpeechPitch={setSpeechPitch}
        />

        <OutputPanel
          speech={speech}
          translation={translation}
          speechError={speechRecognition.speechError}
          isTtsSupported={isTtsSupported}
        />

        <SummaryPanel
          summaryData={summaryData}
          summaryLoading={summaryLoading}
          summaryError={summaryError}
          onGenerateSummary={() => generateSummary(history)}
          canGenerate={history.length > 0}
        />

        <HistoryPanel history={history} onReplay={speakTranslation} canReplay={isTtsSupported} />
      </div>
    </div>
  );
}

export default App;
