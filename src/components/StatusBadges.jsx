import React from "react";

const StatusBadges = ({
  socketConnected,
  apiHealthy,
  ttsSpeaking,
  ttsOutputLang,
  ttsVoiceName,
  speechProvider,
  whisperConfigured,
  whisperRequired,
  translationProvider,
  translationConfigured,
}) => {
  const providerDisplayName = {
    "openai-whisper": "OpenAI Whisper",
    "whisper-api": "Whisper API",
    "web-speech": "Web Speech",
  }[speechProvider] || speechProvider;

  const usingBrowserSpeech = speechProvider === "web-speech";
  const speechLabel = usingBrowserSpeech
    ? "Active"
    : whisperRequired
      ? whisperConfigured
        ? "Ready"
        : "Not Configured"
      : "Optional";
  const speechClass = usingBrowserSpeech
    ? "status-badge idle"
    : whisperRequired
      ? whisperConfigured
        ? "status-badge connected"
        : "status-badge disconnected"
      : "status-badge idle";

  return (
    <div className="badges-grid">
      <p className={socketConnected ? "status-badge connected" : "status-badge disconnected"}>
        {socketConnected ? "Socket Connected" : "Socket Disconnected"}
      </p>
      <p className={apiHealthy ? "status-badge connected" : "status-badge disconnected"}>
        {apiHealthy ? "Health Check OK" : "Health Check Failed"}
      </p>
      <p className={ttsSpeaking ? "status-badge speaking" : "status-badge idle"}>
        {ttsSpeaking ? `Voice: Speaking (${ttsOutputLang}) · ${ttsVoiceName}` : `Voice: Idle (${ttsOutputLang}) · ${ttsVoiceName}`}
      </p>
      <p className={speechClass}>
        {`Speech: ${providerDisplayName} · ${speechLabel}`}
      </p>
      <p className={translationConfigured ? "status-badge connected" : "status-badge disconnected"}>
        {`Translation: ${translationProvider} · ${translationConfigured ? "Ready" : "Not Configured"}`}
      </p>
    </div>
  );
};

export default StatusBadges;
