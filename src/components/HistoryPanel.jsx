import React from "react";

const HistoryPanel = ({ history, onReplay, canReplay }) => {
  return (
    <div className="history card">
      <h2>Translation History</h2>
      <ul>
        {history.map((item) => (
          <li key={item.id}>
            <p>
              <strong>Time:</strong> {item.timestamp.toLocaleTimeString()}
              {item.direction ? ` · ${item.direction.replace("|", " → ")}` : ""}
            </p>
            <p>
              <strong>Speech:</strong> {item.speech}
            </p>
            <p>
              <strong>Translation:</strong> {item.translation}
            </p>
            <div className="history-actions">
              <button className="small-action-btn" onClick={() => onReplay(item.translation, item.direction)} disabled={!canReplay || !item.translation}>
                Play Again
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryPanel;
