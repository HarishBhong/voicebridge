import React from "react";

const TTSActionControls = ({
  autoSpeak,
  setAutoSpeak,
  onSpeakNow,
  onStopVoice,
  onResetDefaults,
  onTestEnVoice,
  onTestJaVoice,
  canSpeak,
  isTtsSupported,
}) => {
  return (
    <div className="controls-row">
      <button onClick={() => setAutoSpeak((previous) => !previous)}>{autoSpeak ? "Auto Speak: ON" : "Auto Speak: OFF"}</button>
      <button onClick={onSpeakNow} disabled={!canSpeak || !isTtsSupported}>
        Speak Now
      </button>
      <button onClick={onStopVoice} disabled={!isTtsSupported}>
        Stop Voice
      </button>
      <button onClick={onResetDefaults}>Reset to Default</button>
      <button onClick={onTestEnVoice} disabled={!isTtsSupported}>
        Test EN Voice
      </button>
      <button onClick={onTestJaVoice} disabled={!isTtsSupported}>
        Test JP Voice
      </button>
    </div>
  );
};

export default TTSActionControls;
