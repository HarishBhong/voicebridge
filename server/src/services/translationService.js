const axios = require('axios');

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const TRANSLATION_PROVIDER = String(process.env.TRANSLATION_PROVIDER || 'mymemory').trim().toLowerCase();
const LIBRETRANSLATE_URL = String(process.env.LIBRETRANSLATE_URL || '').trim();
const LIBRETRANSLATE_API_KEY = String(process.env.LIBRETRANSLATE_API_KEY || '').trim();

const detectLangpair = (speechText, sourceLangHint = '') => {
  const normalizedHint = String(sourceLangHint || '').trim().toLowerCase();
  if (normalizedHint.startsWith('ja')) return 'ja|en';
  if (normalizedHint.startsWith('en')) return 'en|ja';

  const isJapanese = /[\u3040-\u30FF\u3000-\u9FFF\uF900-\uFAFF]/.test(String(speechText || ''));
  return isJapanese ? 'ja|en' : 'en|ja';
};

const parseLangpair = (langpair) => {
  const [source, target] = String(langpair || '').split('|');
  return {
    source: source || 'en',
    target: target || 'ja',
  };
};

const translateWithMyMemory = async ({ speechText, langpair }) => {
  try {
    const response = await axios.get(MYMEMORY_URL, {
      params: { q: speechText, langpair },
      timeout: 10000,
    });

    if (response?.data?.responseStatus !== 200) {
      console.error(`[Translation] MyMemory API error status: ${response?.data?.responseStatus}`);
      throw new Error(`MyMemory API returned status ${response?.data?.responseStatus}`);
    }

    const translatedText = response?.data?.responseData?.translatedText || '';
    if (!translatedText) {
      console.warn(`[Translation] Empty translation from MyMemory for langpair=${langpair}`);
      return 'Translation unavailable.';
    }

    return translatedText;
  } catch (error) {
    console.error(`[Translation] MyMemory API call failed for "${speechText}" (${langpair}):`, error?.message || error);
    throw error;
  }
};

const translateWithLibreTranslate = async ({ speechText, langpair }) => {
  if (!LIBRETRANSLATE_URL) {
    return {
      text: '',
      provider: 'libretranslate',
      configured: false,
      message: 'LIBRETRANSLATE_URL is not configured.',
    };
  }

  const { source, target } = parseLangpair(langpair);
  const response = await axios.post(
    LIBRETRANSLATE_URL,
    {
      q: speechText,
      source,
      target,
      format: 'text',
      ...(LIBRETRANSLATE_API_KEY ? { api_key: LIBRETRANSLATE_API_KEY } : {}),
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const text =
    response?.data?.translatedText ||
    response?.data?.translation ||
    response?.data?.text ||
    'Translation unavailable.';

  return {
    text,
    provider: 'libretranslate',
    configured: true,
    message: '',
  };
};

const translateSpeechText = async (speechText, sourceLangHint = '') => {
  const normalizedSpeech = String(speechText || '').trim();
  const langpair = detectLangpair(normalizedSpeech, sourceLangHint);

  if (TRANSLATION_PROVIDER === 'libretranslate') {
    const result = await translateWithLibreTranslate({ speechText: normalizedSpeech, langpair });
    return {
      ...result,
      direction: langpair,
    };
  }

  const text = await translateWithMyMemory({ speechText: normalizedSpeech, langpair });
  return {
    text,
    provider: 'mymemory',
    configured: true,
    message: '',
    direction: langpair,
  };
};

const getTranslationProviderConfig = () => {
  if (TRANSLATION_PROVIDER === 'libretranslate') {
    return {
      provider: 'libretranslate',
      configured: Boolean(LIBRETRANSLATE_URL),
      hasAuthToken: Boolean(LIBRETRANSLATE_API_KEY),
      endpoint: LIBRETRANSLATE_URL || '',
    };
  }

  return {
    provider: 'mymemory',
    configured: true,
    hasAuthToken: false,
    endpoint: MYMEMORY_URL,
  };
};

module.exports = {
  translateSpeechText,
  getTranslationProviderConfig,
};
