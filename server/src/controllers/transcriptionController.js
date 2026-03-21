const {
  transcribeAudioChunk,
  getTranscriptionProviderConfig,
} = require('../services/transcriptionService');

const getSpeechConfig = (_req, res) => {
  const config = getTranscriptionProviderConfig();
  return res.json(config);
};

const transcribeSpeech = async (req, res) => {
  try {
    const audioBase64 = String(req.body?.audioBase64 || '').trim();
    const mimeType = String(req.body?.mimeType || 'audio/webm').trim();
    const langHint = String(req.body?.langHint || '').trim();

    if (!audioBase64) {
      return res.status(400).json({
        text: '',
        provider: 'none',
        configured: false,
        message: 'audioBase64 is required.',
      });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');

    if (!audioBuffer.length) {
      return res.status(400).json({
        text: '',
        provider: 'none',
        configured: false,
        message: 'Invalid audio payload.',
      });
    }

    const result = await transcribeAudioChunk({
      audioBuffer,
      mimeType,
      langHint,
    });

    if (!result.configured) {
      return res.status(503).json({
        text: '',
        provider: result.provider,
        configured: false,
        message: result.message,
      });
    }

    return res.json(result);
  } catch (error) {
    const provider = getTranscriptionProviderConfig().provider || 'whisper-api';
    const message = String(error?.message || '').trim();
    const upstreamStatus = Number(error?.status || 0);
    const isTransientChunkFailure =
      upstreamStatus === 400 ||
      upstreamStatus === 422 ||
      upstreamStatus === 500 ||
      /no speech|no audio|empty|silence|decode|short/i.test(message);

    if (isTransientChunkFailure) {
      return res.status(200).json({
        text: '',
        provider,
        configured: true,
        message: '',
      });
    }

    return res.status(500).json({
      text: '',
      provider,
      configured: true,
      message: message || 'Transcription failed.',
    });
  }
};

module.exports = {
  getSpeechConfig,
  transcribeSpeech,
};
