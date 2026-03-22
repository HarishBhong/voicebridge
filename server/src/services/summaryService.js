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

const summaryStopwords = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'for', 'with',
  'this', 'that', 'it', 'we', 'you', 'i', 'they', 'be', 'as', 'at', 'by', 'from', 'will', 'can', 'could',
  'should', 'would', 'need', 'have', 'has', 'had', 'our', 'your', 'their', 'about', 'into', 'out', 'up',
  'down', 'if', 'then', 'than', 'so', 'do', 'does', 'did', 'not', 'no', 'yes', 'ok', 'okay', 'please'
]);

const tokenize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !summaryStopwords.has(token));

const getTopicLabels = (combinedText) =>
  topicPatterns
    .filter((topic) => topic.regex.test(combinedText))
    .map((topic) => topic.label)
    .slice(0, 5);

const buildDeterministicSummary = (validEntries) => {
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
  const topics = getTopicLabels(combinedText);

  const summary = `Conversation contains ${validEntries.length} translated exchanges (${enToJa} EN→JP, ${jaToEn} JP→EN). Recent discussion focused on live bilingual communication${actionItems.length > 0 ? ' with actionable follow-ups identified.' : '.'}`;

  return {
    mode: 'deterministic',
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

const buildSemanticSummary = (validEntries) => {
  const baseSummary = buildDeterministicSummary(validEntries);

  if (validEntries.length === 0) {
    return baseSummary;
  }

  const wordFrequency = new Map();
  validEntries.forEach((entry) => {
    const text = `${entry.speech} ${entry.translation}`.trim();
    tokenize(text).forEach((token) => {
      wordFrequency.set(token, (wordFrequency.get(token) || 0) + 1);
    });
  });

  const scoredHighlights = validEntries
    .map((entry, index) => {
      const text = `${entry.speech} ${entry.translation}`.trim();
      const score = tokenize(text).reduce((acc, token) => acc + (wordFrequency.get(token) || 0), 0);
      return {
        text: entry.speech || entry.translation,
        direction: entry.direction,
        score,
        index,
      };
    })
    .filter((item) => item.text)
    .sort((a, b) => (b.score - a.score) || (b.index - a.index))
    .slice(0, 5)
    .sort((a, b) => a.index - b.index)
    .map((item, idx) => {
      const directionLabel = item.direction ? ` (${item.direction.replace('|', ' → ')})` : '';
      return `${idx + 1}. ${item.text}${directionLabel}`;
    });

  const topTerms = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([term]) => term);

  const combinedText = validEntries.map((entry) => `${entry.speech} ${entry.translation}`.trim()).join(' ');
  const topics = getTopicLabels(combinedText);
  const actionItems = baseSummary.actionItems;

  const summary = `Semantic summary: ${baseSummary.stats.totalEntries} exchanges (${baseSummary.stats.enToJa} EN→JP, ${baseSummary.stats.jaToEn} JP→EN). Main focus areas: ${topics.length > 0 ? topics.join(', ') : 'general bilingual discussion'}${topTerms.length > 0 ? `; repeated terms: ${topTerms.join(', ')}` : ''}${actionItems.length > 0 ? '; action follow-ups detected.' : '.'}`;

  return {
    mode: 'semantic-lite',
    summary,
    highlights: scoredHighlights.length > 0 ? scoredHighlights : baseSummary.highlights,
    topics,
    actionItems,
    stats: baseSummary.stats,
  };
};

const buildConversationSummary = (entries, options = {}) => {
  const requestedMode = String(options.mode || '').trim().toLowerCase();
  const validEntries = getValidEntries(entries);

  if (requestedMode === 'semantic-lite') {
    return buildSemanticSummary(validEntries);
  }

  return buildDeterministicSummary(validEntries);
};

module.exports = {
  buildConversationSummary,
};
