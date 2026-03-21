import React from "react";

const LanguageControls = ({ inputLang, onLanguageChange, listening, onToggleListening }) => {
  return (
    <div className="controls-row">
      <div className="lang-toggle" role="group" aria-label="Translation direction">
        <button className={inputLang === "en-US" ? "lang-option active" : "lang-option"} onClick={() => onLanguageChange("en-US")}>
          EN → JP
        </button>
        <button className={inputLang === "ja-JP" ? "lang-option active" : "lang-option"} onClick={() => onLanguageChange("ja-JP")}>
          JP → EN
        </button>
      </div>
      <button className="primary-btn" onClick={onToggleListening}>
        {listening ? "Stop Listening" : "Start Speaking"}
      </button>
    </div>
  );
};

export default LanguageControls;
