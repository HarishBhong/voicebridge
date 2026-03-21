const { getTranslationProviderConfig } = require('../services/translationService');

const getTranslationConfig = (_req, res) => {
  const config = getTranslationProviderConfig();
  return res.json(config);
};

module.exports = {
  getTranslationConfig,
};
