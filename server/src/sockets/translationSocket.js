const { translateSpeechText } = require('../services/translationService');

const registerTranslationSocketHandlers = (socket) => {
  socket.on('speech', async (data) => {
    const rawSpeechText =
      typeof data === 'string' ? data : data?.text ?? data?.speech ?? data?.query ?? '';
    const sourceLangHint = typeof data === 'string' ? '' : String(data?.sourceLang || '').trim();

    const speechText = String(rawSpeechText).trim();

    if (!speechText) {
      socket.emit('translation', {
        text: 'No speech captured. Please try again.',
        direction: '',
        speech: '',
        speakerId: socket.id,
      });
      return;
    }

    try {
      const result = await translateSpeechText(speechText, sourceLangHint);

      if (!result.configured) {
        console.warn(`[Translation] Provider not configured: ${result.message}`);
        socket.emit('translation', {
          text: `Translation provider not configured: ${result.message}`,
          direction: result.direction || '',
          speech: speechText,
          provider: result.provider,
          speakerId: socket.id,
        });
        return;
      }

      socket.emit('translation', {
        text: result.text,
        direction: result.direction,
        speech: speechText,
        provider: result.provider,
        speakerId: socket.id,
      });
    } catch (error) {
      const errorMessage = error?.message || 'Translation service error';
      console.error(`[Translation] Socket translation failed for "${speechText}":`, errorMessage);
      socket.emit('translation', {
        text: `Error: ${errorMessage}`,
        direction: '',
        speech: speechText,
        speakerId: socket.id,
      });
    }
  });
};

module.exports = {
  registerTranslationSocketHandlers,
};
