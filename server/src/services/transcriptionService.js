const { OpenAI } = require('openai');
const { Readable } = require('stream');

const OPENAI_API_KEY = String(process.env.OPENAI_API_KEY || '').trim();
const WHISPER_API_URL = String(process.env.WHISPER_API_URL || '').trim();
const WHISPER_BEARER_TOKEN = String(process.env.WHISPER_BEARER_TOKEN || '').trim();
const WHISPER_FILE_FIELD = process.env.WHISPER_FILE_FIELD || 'file';

// provider priority: openai > whisper-url > none
const activeProvider = () => {
  if (OPENAI_API_KEY) return 'openai-whisper';
  if (WHISPER_API_URL) return 'whisper-api';
  return 'none';
};

const extensionFromMimeType = (mimeType) => {
  if (!mimeType) return 'webm';
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('mp4')) return 'm4a';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
};

const toLanguageCode = (langHint) => {
  const normalized = String(langHint || '').trim();
  if (!normalized) return undefined;
  return normalized.split('-')[0].toLowerCase();
};

// Converts a Node.js Buffer to a ReadableStream with a .name property
// so the OpenAI SDK can send it as a multipart file upload.
const bufferToReadableFile = (buffer, fileName) => {
  const stream = Readable.from(buffer);
  stream.path = fileName;
  return stream;
};

const transcribeWithOpenAI = async ({ audioBuffer, mimeType, langHint }) => {
  const client = new OpenAI({ apiKey: OPENAI_API_KEY });
  const extension = extensionFromMimeType(mimeType);
  const fileName = `voicebridge-chunk.${extension}`;
  const language = toLanguageCode(langHint);

  const transcription = await client.audio.transcriptions.create({
    model: 'whisper-1',
    file: bufferToReadableFile(audioBuffer, fileName),
    ...(language ? { language } : {}),
  });

  return {
    text: String(transcription?.text || '').trim(),
    provider: 'openai-whisper',
    configured: true,
    message: '',
  };
};

const transcribeWithGenericWhisper = async ({ audioBuffer, mimeType, langHint }) => {
  const extension = extensionFromMimeType(mimeType);
  const fileName = `voicebridge-chunk.${extension}`;
  const language = toLanguageCode(langHint);

  const formData = new FormData();
  const audioBlob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });
  formData.append(WHISPER_FILE_FIELD, audioBlob, fileName);
  if (language) formData.append('language', language);

  const headers = {};
  if (WHISPER_BEARER_TOKEN) headers.Authorization = `Bearer ${WHISPER_BEARER_TOKEN}`;

  const response = await fetch(WHISPER_API_URL, { method: 'POST', headers, body: formData });

  // Read body as text first — response body stream can only be consumed once.
  // Some Whisper images return application/octet-stream or text/plain even when
  // the body is valid JSON (e.g. onerahmet/openai-whisper-asr-webservice).
  const rawText = await response.text();
  let payload;
  try {
    payload = JSON.parse(rawText);
  } catch {
    payload = rawText;
  }

  if (!response.ok) {
    const isObj = payload !== null && typeof payload === 'object';
    const message =
      (isObj && (payload?.message || payload?.error || payload?.detail)) ||
      (typeof payload === 'string' ? payload : '') ||
      `Whisper API request failed with status ${response.status}.`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const text =
    (typeof payload?.text === 'string' ? payload.text : '') ||
    (typeof payload?.transcript === 'string' ? payload.transcript : '') ||
    (typeof payload === 'string' ? payload : '') ||
    '';

  return { text: text.trim(), provider: 'whisper-api', configured: true, message: '' };
};

const transcribeAudioChunk = async ({ audioBuffer, mimeType, langHint }) => {
  const provider = activeProvider();

  if (provider === 'openai-whisper') {
    return transcribeWithOpenAI({ audioBuffer, mimeType, langHint });
  }

  if (provider === 'whisper-api') {
    return transcribeWithGenericWhisper({ audioBuffer, mimeType, langHint });
  }

  return {
    text: '',
    provider: 'none',
    configured: false,
    message:
      'No speech transcription provider configured. Set OPENAI_API_KEY or WHISPER_API_URL in your .env to enable Electron speech input.',
  };
};

const getTranscriptionProviderConfig = () => {
  const provider = activeProvider();
  return {
    provider,
    configured: provider !== 'none',
    hasAuthToken: Boolean(OPENAI_API_KEY || WHISPER_BEARER_TOKEN),
  };
};

module.exports = {
  transcribeAudioChunk,
  getTranscriptionProviderConfig,
};
