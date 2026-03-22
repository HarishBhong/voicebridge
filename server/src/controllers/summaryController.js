const { buildConversationSummary } = require('../services/summaryService');

const generateSummary = (req, res) => {
  const entries = Array.isArray(req.body?.entries) ? req.body.entries : [];
  const mode = String(req.body?.mode || process.env.SUMMARY_MODE || 'deterministic').trim().toLowerCase();

  if (entries.length === 0) {
    return res.status(400).json({
      mode,
      summary: 'No transcript entries provided.',
      highlights: [],
      topics: [],
      actionItems: [],
      stats: { totalEntries: 0, enToJa: 0, jaToEn: 0 },
    });
  }

  const summaryData = buildConversationSummary(entries, { mode });
  return res.json(summaryData);
};

module.exports = {
  generateSummary,
};
