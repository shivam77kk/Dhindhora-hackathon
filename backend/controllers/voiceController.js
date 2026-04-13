import { callGeminiJSON } from '../services/geminiService.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

const VALID_ACTIONS = ['scroll-next', 'scroll-back', 'confetti', 'stop-music', 'play-music',
  'navigate-roast', 'navigate-draw', 'navigate-story', 'navigate-home', 'unknown'];


export const interpretVoiceCommand = async (req, res) => {
  try {
    const { transcript, currentPage } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 2) {
      return res.status(400).json(apiError('Transcript is required'));
    }

    const prompt = `You are a voice command interpreter for a creative web app called Dhindhora.
User said: "${transcript.trim().substring(0, 200)}"
Current page: "${currentPage || '/'}"
Available actions: scroll-next, scroll-back, confetti, stop-music, play-music, navigate-roast, navigate-draw, navigate-story, navigate-home, unknown

Map the user's speech to the best matching action. Respond ONLY with valid JSON:
{
  "action": "<one of the available actions above>",
  "confidence": <number 0.0 to 1.0>,
  "responseText": "<friendly 5-word max response to speak back>",
  "emoji": "<single emoji>"
}`;

    const result = await callGeminiJSON(prompt, { temperature: 0.2, maxOutputTokens: 128 });

    const safe = {
      action: VALID_ACTIONS.includes(result.action) ? result.action : 'unknown',
      confidence: typeof result.confidence === 'number' ? Math.min(1, Math.max(0, result.confidence)) : 0.5,
      responseText: result.responseText || 'Got it!',
      emoji: result.emoji || '✅',
    };

    return res.json(apiSuccess(safe, 'Command interpreted'));
  } catch (err) {
    console.error('interpretVoiceCommand error:', err.message);
    return res.status(500).json(apiError('Voice interpretation failed: ' + err.message));
  }
};
