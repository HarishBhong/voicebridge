import { useState } from "react";
import { API_URL } from "../services/socketClient";

const buildLocalSummary = (entries) => {
  const normalizeText = (value) => String(value || "").trim();

  const validEntries = entries
    .map((entry) => ({
      speech: normalizeText(entry?.speech),
      translation: normalizeText(entry?.translation),
      direction: normalizeText(entry?.direction),
    }))
    .filter((entry) => entry.speech || entry.translation);

  const enToJa = validEntries.filter((entry) => entry.direction === "en|ja").length;
  const jaToEn = validEntries.filter((entry) => entry.direction === "ja|en").length;

  const highlights = validEntries.slice(-5).map((entry, index) => {
    const base = entry.speech || entry.translation;
    const directionLabel = entry.direction ? ` (${entry.direction.replace("|", " → ")})` : "";
    return `${index + 1}. ${base}${directionLabel}`;
  });

  const actionKeywords = /\b(next|todo|follow up|follow-up|deadline|schedule|confirm|review|prepare|send|call|task|action|should|need to|must|check|update|fix|verify|investigate|plan)\b|確認|更新|修正|対応|必要|べき|しよう|しておく|チェック/i;
  const actionItems = validEntries
    .filter((entry) => {
      const combined = `${entry.speech} ${entry.translation}`.trim();
      return actionKeywords.test(combined);
    })
    .slice(-5)
    .map((entry) => entry.speech || entry.translation);

  const topicPatterns = [
    { label: "Budget", regex: /\b(budget|cost|price|pricing|estimate|expense)\b/i },
    { label: "Timeline", regex: /\b(timeline|schedule|eta|deadline|milestone|date)\b/i },
    { label: "Product", regex: /\b(product|feature|release|ui|ux|requirement|scope)\b/i },
    { label: "Customer", regex: /\b(customer|client|user|feedback|support)\b/i },
    { label: "Engineering", regex: /\b(api|backend|frontend|bug|fix|deploy|integration|performance)\b/i },
    { label: "Operations", regex: /\b(process|workflow|owner|handoff|approval|risk)\b/i },
  ];

  const combinedText = validEntries
    .map((entry) => `${entry.speech} ${entry.translation}`.trim())
    .join(" ");

  const topics = topicPatterns
    .filter((topic) => topic.regex.test(combinedText))
    .map((topic) => topic.label)
    .slice(0, 5);

  const summary = `Conversation contains ${validEntries.length} translated exchanges (${enToJa} EN→JP, ${jaToEn} JP→EN). Recent discussion focused on live bilingual communication${actionItems.length > 0 ? " with actionable follow-ups identified." : "."}`;

  return {
    summary,
    highlights,
    topics,
    actionItems,
    stats: {
      totalEntries: validEntries.length,
      enToJa,
      jaToEn,
    },
  };
};

export const useMeetingSummary = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const generateSummary = async (history) => {
    if (!Array.isArray(history) || history.length === 0) {
      setSummaryError("No history entries available for summarization.");
      setSummaryData(null);
      return;
    }

    setSummaryLoading(true);
    setSummaryError("");

    try {
      const response = await fetch(`${API_URL}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: history.map((entry) => ({
            speech: entry.speech,
            translation: entry.translation,
            direction: entry.direction,
            timestamp: entry.timestamp,
          })),
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await response.json() : null;

      if (response.status === 404) {
        setSummaryData(buildLocalSummary(history));
        return;
      }

      if (!response.ok) {
        if (!isJson) {
          throw new Error("Summary API returned a non-JSON response. Ensure backend is running on port 3000.");
        }
        throw new Error(data?.summary || "Failed to generate summary.");
      }

      if (!isJson || !data) {
        throw new Error("Summary API response format is invalid.");
      }

      setSummaryData(data);
    } catch (error) {
      setSummaryError(error?.message || "Failed to generate summary.");
      setSummaryData(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  return {
    summaryData,
    summaryLoading,
    summaryError,
    generateSummary,
  };
};
