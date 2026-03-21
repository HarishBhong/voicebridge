import { useEffect, useMemo, useRef, useState } from "react";
import { getStoredValue, removeStoredValue, setStoredValue } from "../utils/storage";

const KEYS = {
  autoSpeak: "vb_autoSpeak",
  voiceEn: "vb_voice_en",
  voiceJa: "vb_voice_ja",
  speechRate: "vb_speechRate",
  speechPitch: "vb_speechPitch",
};

export const useTTS = ({ pauseForTts, resumeAfterTts }) => {
  const [autoSpeak, setAutoSpeak] = useState(() => getStoredValue(KEYS.autoSpeak, true));
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURIEn, setSelectedVoiceURIEn] = useState(() => getStoredValue(KEYS.voiceEn, ""));
  const [selectedVoiceURIJa, setSelectedVoiceURIJa] = useState(() => getStoredValue(KEYS.voiceJa, ""));
  const [speechRate, setSpeechRate] = useState(() => getStoredValue(KEYS.speechRate, 1));
  const [speechPitch, setSpeechPitch] = useState(() => getStoredValue(KEYS.speechPitch, 1));
  const [ttsSpeaking, setTtsSpeaking] = useState(false);
  const [ttsOutputLang, setTtsOutputLang] = useState("-");
  const [ttsVoiceName, setTtsVoiceName] = useState("Default");

  const isTtsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const autoSpeakRef = useRef(autoSpeak);
  const resumeAfterTtsRef = useRef(false);
  const availableVoicesRef = useRef(availableVoices);
  const selectedVoiceURIEnRef = useRef(selectedVoiceURIEn);
  const selectedVoiceURIJaRef = useRef(selectedVoiceURIJa);
  const speechRateRef = useRef(speechRate);
  const speechPitchRef = useRef(speechPitch);

  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
    setStoredValue(KEYS.autoSpeak, autoSpeak);
  }, [autoSpeak]);

  useEffect(() => {
    availableVoicesRef.current = availableVoices;
  }, [availableVoices]);

  useEffect(() => {
    selectedVoiceURIEnRef.current = selectedVoiceURIEn;
    setStoredValue(KEYS.voiceEn, selectedVoiceURIEn);
  }, [selectedVoiceURIEn]);

  useEffect(() => {
    selectedVoiceURIJaRef.current = selectedVoiceURIJa;
    setStoredValue(KEYS.voiceJa, selectedVoiceURIJa);
  }, [selectedVoiceURIJa]);

  useEffect(() => {
    speechRateRef.current = speechRate;
    setStoredValue(KEYS.speechRate, speechRate);
  }, [speechRate]);

  useEffect(() => {
    speechPitchRef.current = speechPitch;
    setStoredValue(KEYS.speechPitch, speechPitch);
  }, [speechPitch]);

  useEffect(() => {
    if (!isTtsSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      if (voices.length === 0) return;

      if (!selectedVoiceURIEnRef.current) {
        const defaultEnglishVoice =
          voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) || voices[0];
        setSelectedVoiceURIEn(defaultEnglishVoice?.voiceURI || "");
      }

      if (!selectedVoiceURIJaRef.current) {
        const defaultJapaneseVoice =
          voices.find((voice) => voice.lang?.toLowerCase().startsWith("ja")) ||
          voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) ||
          voices[0];
        setSelectedVoiceURIJa(defaultJapaneseVoice?.voiceURI || "");
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isTtsSupported]);

  const speakTranslation = (text, direction) => {
    if (!isTtsSupported || !text) return;
    if (text === "Translation failed." || text === "Translation unavailable.") return;

    const shouldResumeListening = pauseForTts?.() || false;
    if (shouldResumeListening) {
      resumeAfterTtsRef.current = true;
    }

    const targetLang = direction?.split("|")?.[1];
    const guessedLang = /[\u3000-\u9FFF\uF900-\uFAFF]/.test(text) ? "ja" : "en";
    const outputLang = targetLang || guessedLang;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = outputLang === "ja" ? "ja-JP" : "en-US";
    utterance.rate = speechRateRef.current;
    utterance.pitch = speechPitchRef.current;

    const preferredVoiceURI = outputLang === "ja" ? selectedVoiceURIJaRef.current : selectedVoiceURIEnRef.current;
    const selectedVoice = availableVoicesRef.current.find((voice) => voice.voiceURI === preferredVoiceURI);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      setTtsVoiceName(selectedVoice.name || "Default");
    } else {
      const fallbackVoice = availableVoicesRef.current.find((voice) =>
        voice.lang?.toLowerCase().startsWith(outputLang)
      );
      if (fallbackVoice) {
        utterance.voice = fallbackVoice;
        setTtsVoiceName(fallbackVoice.name || "Default");
      } else {
        setTtsVoiceName("Default");
      }
    }

    setTtsOutputLang(outputLang === "ja" ? "JP" : "EN");

    utterance.onend = () => {
      setTtsSpeaking(false);
      if (resumeAfterTtsRef.current) {
        resumeAfterTtsRef.current = false;
        setTimeout(() => {
          resumeAfterTts?.();
        }, 350);
      }
    };

    utterance.onerror = () => {
      setTtsSpeaking(false);
      if (resumeAfterTtsRef.current) {
        resumeAfterTtsRef.current = false;
        resumeAfterTts?.();
      }
    };

    window.speechSynthesis.cancel();
    setTtsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopVoice = () => {
    if (!isTtsSupported) return;
    window.speechSynthesis.cancel();
    setTtsSpeaking(false);
  };

  const resetSettings = () => {
    stopVoice();

    const defaultEnglishVoice =
      availableVoicesRef.current.find((voice) => voice.lang?.toLowerCase().startsWith("en")) ||
      availableVoicesRef.current[0];
    const defaultJapaneseVoice =
      availableVoicesRef.current.find((voice) => voice.lang?.toLowerCase().startsWith("ja")) ||
      defaultEnglishVoice ||
      availableVoicesRef.current[0];

    setAutoSpeak(true);
    setSpeechRate(1);
    setSpeechPitch(1);
    setSelectedVoiceURIEn(defaultEnglishVoice?.voiceURI || "");
    setSelectedVoiceURIJa(defaultJapaneseVoice?.voiceURI || "");

    removeStoredValue(KEYS.autoSpeak);
    removeStoredValue(KEYS.voiceEn);
    removeStoredValue(KEYS.voiceJa);
    removeStoredValue(KEYS.speechRate);
    removeStoredValue(KEYS.speechPitch);
  };

  const testVoice = (langCode) => {
    if (langCode === "ja") {
      speakTranslation("これは日本語の音声テストです。", "en|ja");
      return;
    }

    speakTranslation("This is an English voice test.", "ja|en");
  };

  const maybeAutoSpeak = (text, direction) => {
    if (!autoSpeakRef.current) return;
    speakTranslation(text, direction);
  };

  const englishVoices = useMemo(
    () => availableVoices.filter((voice) => voice.lang?.toLowerCase().startsWith("en")),
    [availableVoices]
  );

  const japaneseVoices = useMemo(
    () => availableVoices.filter((voice) => voice.lang?.toLowerCase().startsWith("ja")),
    [availableVoices]
  );

  return {
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
    maybeAutoSpeak,
    stopVoice,
    resetSettings,
    testVoice,
  };
};
