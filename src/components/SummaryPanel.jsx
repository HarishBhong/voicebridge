import React from "react";

const SummaryPanel = ({ summaryData, summaryLoading, summaryError, onGenerateSummary, canGenerate }) => {
  return (
    <div className="summary card">
      <div className="summary-header">
        <h2>Meeting Summary</h2>
        <button className="primary-btn" onClick={onGenerateSummary} disabled={!canGenerate || summaryLoading}>
          {summaryLoading ? "Generating..." : "Generate Summary"}
        </button>
      </div>

      {summaryError ? <p className="error-text">{summaryError}</p> : null}

      {summaryData ? (
        <>
          <p className="summary-text">{summaryData.summary}</p>

          <div className="summary-stats">
            <span>Total: {summaryData.stats?.totalEntries ?? 0}</span>
            <span>EN→JP: {summaryData.stats?.enToJa ?? 0}</span>
            <span>JP→EN: {summaryData.stats?.jaToEn ?? 0}</span>
          </div>

          <h3>Highlights</h3>
          <ul>
            {(summaryData.highlights || []).map((item, index) => (
              <li key={`highlight-${index}`}>{item}</li>
            ))}
          </ul>

          <h3>Topics</h3>
          {(summaryData.topics || []).length > 0 ? (
            <ul>
              {summaryData.topics.map((item, index) => (
                <li key={`topic-${index}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">No clear topics detected yet.</p>
          )}

          <h3>Action Items</h3>
          {(summaryData.actionItems || []).length > 0 ? (
            <ul>
              {summaryData.actionItems.map((item, index) => (
                <li key={`action-${index}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">No clear action items detected yet.</p>
          )}
        </>
      ) : (
        <p className="muted">Generate a summary from current translation history.</p>
      )}
    </div>
  );
};

export default SummaryPanel;
