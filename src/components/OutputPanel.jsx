import React from "react";

const OutputPanel = ({ speech, translation, speechError, isTtsSupported }) => {
  return (
    <div className="output card">
      <div className="output-row">
        <span>Speech</span>
        <strong>{speech || "—"}</strong>
      </div>
      <div className="output-row">
        <span>Translation</span>
        <strong>{translation || "—"}</strong>
      </div>
      {speechError ? <p className="error-text">Error: {speechError}</p> : null}
      {!isTtsSupported ? <p className="error-text">Voice output is not supported in this browser context.</p> : null}
    </div>
  );
};

export default OutputPanel;
