import { useEffect, useRef, useState } from "react";
import { getStoredValue, setStoredValue } from "../utils/storage";
import { fetchSpeechConfig, transcribeAudioBlob } from "../services/transcriptionClient";

const INPUT_LANG_KEY = "vb_inputLang";
const FAST_WHISPER_CHUNK_INTERVAL_MS = 3000;
const FAST_MIN_WHISPER_CHUNK_BYTES = 6000;
const ACCURACY_WINDOW_CHUNKS = 3;
const ACCURACY_MIN_WHISPER_CHUNK_BYTES = 20000;

const isIgnorableWhisperChunkError = (message) =>
  /internal server error|no speech|no audio|silence|decode|short/i.test(String(message || ""));

export const useSpeechRecognition = ({ onSpeech }) => {
  const [inputLang, setInputLang] = useState(() => getStoredValue(INPUT_LANG_KEY, "en-US"));
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [speechProvider, setSpeechProvider] = useState("web-speech");
  const [whisperConfigured, setWhisperConfigured] = useState(false);

  const onSpeechRef = useRef(onSpeech);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const fastWhisperInFlightRef = useRef(false);
  const accurateWhisperInFlightRef = useRef(false);
  const whisperChunkWindowRef = useRef([]);
  const usingWhisperRef = useRef(false);
  const preferWhisperModeRef = useRef(false);
  const shouldRestartRef = useRef(false);
  const inputLangRef = useRef(inputLang);
  const whisperConfiguredRef = useRef(false);
  const lastWhisperTranscriptRef = useRef("");
  const lastAccurateTranscriptRef = useRef("");
  const isElectron = typeof navigator !== "undefined" && /Electron/i.test(navigator.userAgent || "");

  const whisperFallbackEnabled =
    String(import.meta.env.VITE_ENABLE_WHISPER_FALLBACK || "").toLowerCase() === "true" || isElectron;

  useEffect(() => {
    onSpeechRef.current = onSpeech;
  }, [onSpeech]);

  useEffect(() => {
    let cancelled = false;

    if (!whisperFallbackEnabled) {
      setWhisperConfigured(false);
      whisperConfiguredRef.current = false;
      return () => {
        cancelled = true;
      };
    }

    const loadSpeechConfig = async () => {
      try {
        const config = await fetchSpeechConfig();
        if (!cancelled) {
          setWhisperConfigured(Boolean(config.configured));
          whisperConfiguredRef.current = Boolean(config.configured);
        }
      } catch {
        if (!cancelled) {
          setWhisperConfigured(false);
          whisperConfiguredRef.current = false;
        }
      }
    };

    void loadSpeechConfig();

    return () => {
      cancelled = true;
    };
  }, [whisperFallbackEnabled]);

  useEffect(() => {
    inputLangRef.current = inputLang;
    setStoredValue(INPUT_LANG_KEY, inputLang);
  }, [inputLang]);

  const getSpeechRecognitionCtor = () => {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  };

  const canUseWhisperFallback =
    whisperFallbackEnabled &&
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined";

  const isSpeechSupported = Boolean(getSpeechRecognitionCtor()) || canUseWhisperFallback;

  const stopWhisperRecorder = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    fastWhisperInFlightRef.current = false;
    accurateWhisperInFlightRef.current = false;
    whisperChunkWindowRef.current = [];
    usingWhisperRef.current = false;
  };

  const startWhisperRecorder = async () => {
    if (!canUseWhisperFallback) {
      setSpeechError("Whisper fallback is not enabled. Set VITE_ENABLE_WHISPER_FALLBACK=true to use API transcription.");
      shouldRestartRef.current = false;
      setListening(false);
      return;
    }

    if (!whisperConfiguredRef.current) {
      setSpeechProvider("whisper-api");
      setSpeechError(
        "No speech transcription provider configured. Set OPENAI_API_KEY or WHISPER_API_URL in your .env to enable fallback speech input."
      );
      shouldRestartRef.current = false;
      setListening(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    let recorder;

    try {
      recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    } catch {
      recorder = new MediaRecorder(stream);
    }

    usingWhisperRef.current = true;
    preferWhisperModeRef.current = true;
    lastWhisperTranscriptRef.current = "";
    lastAccurateTranscriptRef.current = "";
    whisperChunkWindowRef.current = [];
    setSpeechProvider("whisper-api");
    mediaRecorderRef.current = recorder;
    mediaStreamRef.current = stream;

    const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

    const emitUniqueTranscript = (text) => {
      if (!text) return;
      if (text === lastWhisperTranscriptRef.current) return;
      lastWhisperTranscriptRef.current = text;
      onSpeechRef.current?.({ text, sourceLang: inputLangRef.current });
    };

    const shouldEmitAccurateTranscript = (text) => {
      if (!text) return false;
      if (text === lastAccurateTranscriptRef.current) return false;
      if (text === lastWhisperTranscriptRef.current) return false;
      if (!lastWhisperTranscriptRef.current) return true;
      if (text.includes(lastWhisperTranscriptRef.current)) return true;
      if (lastWhisperTranscriptRef.current.includes(text)) return false;
      return text.length >= lastWhisperTranscriptRef.current.length + 8;
    };

    const runFastPass = async (chunk) => {
      fastWhisperInFlightRef.current = true;

      try {
        const result = await transcribeAudioBlob({ audioBlob: chunk, langHint: inputLangRef.current });
        const normalizedText = normalizeText(result.text);
        emitUniqueTranscript(normalizedText);
      } catch (error) {
        if (!isIgnorableWhisperChunkError(error?.message)) {
          setSpeechError(error?.message || "Whisper fallback transcription failed.");
        }
      } finally {
        fastWhisperInFlightRef.current = false;
      }
    };

    const runAccuratePass = async (windowBlob) => {
      accurateWhisperInFlightRef.current = true;

      try {
        const result = await transcribeAudioBlob({ audioBlob: windowBlob, langHint: inputLangRef.current });
        const normalizedText = normalizeText(result.text);
        if (shouldEmitAccurateTranscript(normalizedText)) {
          lastAccurateTranscriptRef.current = normalizedText;
          emitUniqueTranscript(normalizedText);
        }
      } catch (error) {
        if (!isIgnorableWhisperChunkError(error?.message)) {
          setSpeechError(error?.message || "Whisper fallback transcription failed.");
        }
      } finally {
        accurateWhisperInFlightRef.current = false;
      }
    };

    recorder.ondataavailable = async (event) => {
      const chunk = event.data;
      if (!chunk || chunk.size === 0 || !shouldRestartRef.current) return;

      whisperChunkWindowRef.current = [...whisperChunkWindowRef.current, chunk].slice(-ACCURACY_WINDOW_CHUNKS);

      if (chunk.size >= FAST_MIN_WHISPER_CHUNK_BYTES && !fastWhisperInFlightRef.current) {
        void runFastPass(chunk);
      }

      const enoughChunksForAccuracy = whisperChunkWindowRef.current.length >= ACCURACY_WINDOW_CHUNKS;
      if (enoughChunksForAccuracy && !accurateWhisperInFlightRef.current) {
        const windowBlob = new Blob(whisperChunkWindowRef.current, { type: chunk.type || "audio/webm" });
        if (windowBlob.size >= ACCURACY_MIN_WHISPER_CHUNK_BYTES) {
          void runAccuratePass(windowBlob);
        }
      }
    };

    recorder.onerror = () => {
      setSpeechError("Microphone recorder failed for Whisper fallback mode.");
      shouldRestartRef.current = false;
      setListening(false);
      stopWhisperRecorder();
    };

    recorder.start(FAST_WHISPER_CHUNK_INTERVAL_MS);
  };

  const startRecognition = (lang) => {
    const SpeechRecognition = getSpeechRecognitionCtor();
    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported in this browser context.");
      shouldRestartRef.current = false;
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    preferWhisperModeRef.current = false;
    setSpeechProvider("web-speech");
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      onSpeechRef.current?.({ text: spokenText, sourceLang: inputLangRef.current });
    };

    recognition.onerror = (event) => {
      if (
        canUseWhisperFallback &&
        ["network", "service-not-allowed", "audio-capture"].includes(event.error)
      ) {
        setSpeechError("Web Speech unavailable. Switching to Whisper fallback mode.");
        preferWhisperModeRef.current = true;
        shouldRestartRef.current = true;
        setListening(true);
        void startWhisperRecorder();
        return;
      }

      if (event.error === "aborted" || event.error === "no-speech") return;
      setSpeechError(`Speech recognition error: ${event.error}`);
      shouldRestartRef.current = false;
      setListening(false);
    };

    recognition.onend = () => {
      if (usingWhisperRef.current) {
        return;
      }

      if (shouldRestartRef.current) {
        startRecognition(inputLangRef.current);
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const toggleListening = async () => {
    setSpeechError("");

    if (listening) {
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
      stopWhisperRecorder();
      setListening(false);
      return;
    }

    shouldRestartRef.current = true;
    setListening(true);

    if (!preferWhisperModeRef.current && getSpeechRecognitionCtor()) {
      startRecognition(inputLangRef.current);
      return;
    }

    try {
      await startWhisperRecorder();
    } catch {
      setSpeechError("Microphone access denied. Allow microphone permission and try again.");
      shouldRestartRef.current = false;
      setListening(false);
    }
  };

  const changeLanguage = (lang) => {
    if (inputLangRef.current === lang) return;
    setInputLang(lang);

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const pauseForTts = () => {
    if (shouldRestartRef.current && usingWhisperRef.current) {
      shouldRestartRef.current = false;
      stopWhisperRecorder();
      setListening(false);
      return true;
    }

    if (shouldRestartRef.current && recognitionRef.current) {
      shouldRestartRef.current = false;
      recognitionRef.current.stop();
      setListening(false);
      return true;
    }

    return false;
  };

  const resumeAfterTts = () => {
    shouldRestartRef.current = true;
    setListening(true);

    if (preferWhisperModeRef.current || !getSpeechRecognitionCtor()) {
      void startWhisperRecorder();
      return;
    }

    startRecognition(inputLangRef.current);
  };

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
      stopWhisperRecorder();
    };
  }, []);

  return {
    listening,
    inputLang,
    speechError,
    isSpeechSupported,
    speechProvider,
    whisperConfigured,
    whisperRequired: whisperFallbackEnabled,
    toggleListening,
    changeLanguage,
    pauseForTts,
    resumeAfterTts,
  };
};
