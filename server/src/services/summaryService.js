const normalizeText = (value) => String(value || '').trim();

const getValidEntries = (entries) =>
  entries
    .map((entry) => ({
      speech: normalizeText(entry?.speech),
      translation: normalizeText(entry?.translation),
      direction: normalizeText(entry?.direction),
    }))
    .filter((entry) => entry.speech || entry.translation);

const actionKeywords = /\b(next|todo|follow up|follow-up|deadline|schedule|confirm|review|prepare|send|call|task|action|should|need to|must|check|update|fix|verify|investigate|plan)\b|確認|更新|修正|対応|必要|べき|しよう|しておく|チェック/i;

const topicPatterns = [
  { label: 'Budget', regex: /\b(budget|cost|price|pricing|estimate|expense)\b/i },
  { label: 'Timeline', regex: /\b(timeline|schedule|eta|deadline|milestone|date)\b/i },
  { label: 'Product', regex: /\b(product|feature|release|ui|ux|requirement|scope)\b/i },
  { label: 'Customer', regex: /\b(customer|client|user|feedback|support)\b/i },
  { label: 'Engineering', regex: /\b(api|backend|frontend|bug|fix|deploy|integration|performance)\b/i },
  { label: 'Operations', regex: /\b(process|workflow|owner|handoff|approval|risk)\b/i },
];

const buildConversationSummary = (entries) => {
  const validEntries = getValidEntries(entries);

  const enToJa = validEntries.filter((entry) => entry.direction === 'en|ja').length;
  const jaToEn = validEntries.filter((entry) => entry.direction === 'ja|en').length;

  const highlights = validEntries.slice(-5).map((entry, index) => {
    const base = entry.speech || entry.translation;
    const directionLabel = entry.direction ? ` (${entry.direction.replace('|', ' → ')})` : '';
    return `${index + 1}. ${base}${directionLabel}`;
  });

  const actionItems = validEntries
    .filter((entry) => actionKeywords.test(`${entry.speech} ${entry.translation}`.trim()))
    .slice(-5)
    .map((entry) => entry.speech || entry.translation);

  const combinedText = validEntries.map((entry) => `${entry.speech} ${entry.translation}`.trim()).join(' ');

  const topics = topicPatterns
    .filter((topic) => topic.regex.test(combinedText))
    .map((topic) => topic.label)
    .slice(0, 5);

  const summary = `Conversation contains ${validEntries.length} translated exchanges (${enToJa} EN→JP, ${jaToEn} JP→EN). Recent discussion focused on live bilingual communication${actionItems.length > 0 ? ' with actionable follow-ups identified.' : '.'}`;

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

module.exports = {
  buildConversationSummary,
};
