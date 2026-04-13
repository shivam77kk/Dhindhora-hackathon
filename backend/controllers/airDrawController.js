import { callGeminiJSON } from '../services/geminiService.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

// POST /api/air-draw/recognize-shape
export const recognizeShape = async (req, res) => {
  try {
    const { points, canvasWidth, canvasHeight } = req.body;

    if (!Array.isArray(points) || points.length < 4) {
      return res.status(400).json(apiError('Need at least 4 points to recognize a shape'));
    }

    // Normalize points to 0..1 range and sample max 60 points
    const step = Math.max(1, Math.floor(points.length / 60));
    const sampled = points
      .filter((_, i) => i % step === 0)
      .map(p => ({
        x: parseFloat((p.x / (canvasWidth || 640)).toFixed(3)),
        y: parseFloat((p.y / (canvasHeight || 480)).toFixed(3)),
      }));

    const prompt = `You are a shape-recognition AI for a creative web app.
The user drew something on a canvas. Here are the normalized (0-1) stroke points (x, y):
${JSON.stringify(sampled)}

Identify the MOST LIKELY shape or symbol. Respond ONLY with valid JSON — no markdown, no explanation:
{
  "shape": "circle|heart|star|triangle|square|arrow|wave|spiral|zigzag|letter_X|unknown",
  "confidence": <number 0.0 to 1.0>,
  "animationTrigger": "love|portal|explode|sparkle|wave|spin|none",
  "emoji": "<single relevant emoji>",
  "uiComponent": "button|modal|portal|card|none",
  "message": "<fun 6-word max message about what was drawn>"
}`;

    const result = await callGeminiJSON(prompt, { temperature: 0.3, maxOutputTokens: 256 });

    // Validate required fields with safe fallback
    const safe = {
      shape: result.shape || 'unknown',
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.5,
      animationTrigger: result.animationTrigger || 'sparkle',
      emoji: result.emoji || '✨',
      uiComponent: result.uiComponent || 'none',
      message: result.message || 'Cool drawing!',
    };

    // Broadcast recognized shape to all collaborators in real-time
    if (req.io) {
      req.io.emit('draw:shape-recognized', safe);
    }

    return res.json(apiSuccess(safe, 'Shape recognized'));
  } catch (err) {
    console.error('recognizeShape error:', err.message);
    return res.status(500).json(apiError('Shape recognition failed: ' + err.message));
  }
};

// POST /api/air-draw/clear
export const clearDrawingRoom = async (req, res) => {
  try {
    const { roomId } = req.body;
    if (req.io && roomId) {
      req.io.to(`draw:${roomId}`).emit('draw:air-clear', { roomId });
    }
    return res.json(apiSuccess({ cleared: true }, 'Canvas cleared'));
  } catch (err) {
    return res.status(500).json(apiError(err.message));
  }
};
