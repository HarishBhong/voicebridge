import React from "react";

const TTSSettingsPanel = ({
  isTtsSupported,
  englishVoices,
  japaneseVoices,
  allVoices,
  selectedVoiceURIEn,
  setSelectedVoiceURIEn,
  selectedVoiceURIJa,
  setSelectedVoiceURIJa,
  speechRate,
  setSpeechRate,
  speechPitch,
  setSpeechPitch,
}) => {
  return (
    <div className="tts-controls card">
      <label>
        Voice (EN Output)
        <select
          value={selectedVoiceURIEn}
          onChange={(event) => setSelectedVoiceURIEn(event.target.value)}
          disabled={!isTtsSupported || allVoices.length === 0}
        >
          {(englishVoices.length > 0 ? englishVoices : allVoices).map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </label>

      <label>
        Voice (JP Output)
        <select
          value={selectedVoiceURIJa}
          onChange={(event) => setSelectedVoiceURIJa(event.target.value)}
          disabled={!isTtsSupported || allVoices.length === 0}
        >
          {(japaneseVoices.length > 0 ? japaneseVoices : allVoices).map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </label>

      <label>
        Speed: {speechRate.toFixed(1)}x
        <input
          type="range"
          min="0.6"
          max="1.6"
          step="0.1"
          value={speechRate}
          onChange={(event) => setSpeechRate(Number(event.target.value))}
          disabled={!isTtsSupported}
        />
      </label>

      <label>
        Pitch: {speechPitch.toFixed(1)}
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speechPitch}
          onChange={(event) => setSpeechPitch(Number(event.target.value))}
          disabled={!isTtsSupported}
        />
      </label>
    </div>
  );
};

export default TTSSettingsPanel;
