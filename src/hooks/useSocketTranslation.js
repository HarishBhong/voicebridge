import { useEffect, useRef, useState } from "react";
import { API_URL, socket } from "../services/socketClient";

export const useSocketTranslation = ({ onTranslation }) => {
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [apiHealthy, setApiHealthy] = useState(false);
  const [translationProvider, setTranslationProvider] = useState("mymemory");
  const [translationConfigured, setTranslationConfigured] = useState(true);
  const [speech, setSpeech] = useState("");
  const [translation, setTranslation] = useState("");
  const [lastDirection, setLastDirection] = useState("");
  const [history, setHistory] = useState([]);
  const latestSpeechRef = useRef("");
  const onTranslationRef = useRef(onTranslation);

  useEffect(() => {
    onTranslationRef.current = onTranslation;
  }, [onTranslation]);

  useEffect(() => {
    const syncSocketConnected = () => {
      setSocketConnected(socket.connected);
    };

    const onConnect = () => syncSocketConnected();
    const onDisconnect = () => syncSocketConnected();
    const onConnectError = () => {
      if (!socket.connected) {
        syncSocketConnected();
      }
    };
    const onReconnect = () => syncSocketConnected();

    const onTranslationEvent = (payload) => {
      const text = typeof payload === "string" ? payload : payload?.text || "";
      const direction = typeof payload === "string" ? "" : payload?.direction || "";
      const sourceSpeech = typeof payload === "string" ? latestSpeechRef.current : payload?.speech;
      const provider = typeof payload === "string" ? "" : payload?.provider || "";

      if (provider) {
        setTranslationProvider(provider);
      }

      setTranslation(text);
      setLastDirection(direction);
      if (sourceSpeech) {
        setSpeech(sourceSpeech);
      }

      setHistory((previous) => [
        ...previous,
        {
          id: `${Date.now()}-${Math.random()}`,
          speech: sourceSpeech || latestSpeechRef.current,
          translation: text,
          direction,
          timestamp: new Date(),
        },
      ]);

      onTranslationRef.current?.({ text, direction, speech: sourceSpeech || latestSpeechRef.current });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("translation", onTranslationEvent);
    socket.io.on("reconnect", onReconnect);

    syncSocketConnected();
    const syncIntervalId = setInterval(syncSocketConnected, 3000);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("translation", onTranslationEvent);
      socket.io.off("reconnect", onReconnect);
      clearInterval(syncIntervalId);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const checkTranslationConfig = async () => {
      try {
        const response = await fetch(`${API_URL}/translation/config`);
        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        const data = isJson ? await response.json() : null;
        if (!active || !response.ok || !data) return;

        setTranslationProvider(String(data.provider || "mymemory"));
        setTranslationConfigured(Boolean(data.configured));
      } catch {
        if (!active) return;
        setTranslationConfigured(false);
      }
    };

    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        if (!active) return;
        setApiHealthy(response.ok);
      } catch {
        if (!active) return;
        setApiHealthy(false);
      }
    };

    checkHealth();
    checkTranslationConfig();
    const intervalId = setInterval(checkHealth, 10000);
    const translationConfigIntervalId = setInterval(checkTranslationConfig, 30000);

    return () => {
      active = false;
      clearInterval(intervalId);
      clearInterval(translationConfigIntervalId);
    };
  }, []);

  const emitSpeech = (speechPayload) => {
    const spokenText =
      typeof speechPayload === "string"
        ? speechPayload
        : String(speechPayload?.text || speechPayload?.speech || "");
    const sourceLang =
      typeof speechPayload === "string" ? "" : String(speechPayload?.sourceLang || "");

    latestSpeechRef.current = spokenText;
    setSpeech(spokenText);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("speech", {
      text: spokenText,
      sourceLang,
    });
  };

  return {
    socketConnected,
    apiHealthy,
    translationProvider,
    translationConfigured,
    speech,
    translation,
    lastDirection,
    history,
    emitSpeech,
  };
};
