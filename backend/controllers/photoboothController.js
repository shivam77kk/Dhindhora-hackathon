import { apiSuccess, apiError } from '../utils/apiResponse.js';

const STYLES = {
  anime:      { prompt: 'anime art style, cel-shaded, vibrant colors, large expressive eyes', mood: 'playful' },
  oilpainting:{ prompt: 'impressionist oil painting, thick brushstrokes, warm palette, museum quality', mood: 'classical' },
  cyberpunk:  { prompt: 'cyberpunk neon style, dark background, electric blues and pinks, circuit patterns', mood: 'futuristic' },
  watercolor: { prompt: 'delicate watercolor painting, soft washes, dreamy pastel tones', mood: 'gentle' },
  comic:      { prompt: 'bold comic book style, halftone dots, thick outlines, pop art colors', mood: 'bold' },
  sketch:     { prompt: 'pencil sketch, fine crosshatching, chiaroscuro shading, artisan quality', mood: 'minimal' },
};

// POST /api/photobooth/describe
// Gemini Vision analyzes the base64 photo and returns a description + style suggestion
export const describePhoto = async (req, res) => {
  try {
    const { imageBase64, style } = req.body;
    if (!imageBase64) return res.status(400).json(apiError('Image data is required'));

    const selectedStyle = STYLES[style] || STYLES.anime;

    const prompt = `You are an AI artist. Analyze this portrait photo and generate a fun, creative description.
Style to apply: ${selectedStyle.prompt}
Mood: ${selectedStyle.mood}

Respond ONLY with valid JSON:
{
  "description": "<2 sentence vivid description of the person in this art style, max 30 words>",
  "dominantFeature": "<their most striking feature e.g. bright eyes, expressive smile>",
  "artisticNote": "<fun 1-sentence artistic commentary, max 15 words>",
  "colorPalette": ["#hex1", "#hex2", "#hex3"],
  "styleEmoji": "<single emoji representing this art style>",
  "title": "<creative title for this portrait, max 5 words>",
  "shareCaption": "<Instagram-ready caption, max 12 words, no hashtags>"
}`;

    // Build Gemini request with image
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Decode base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const mimeType   = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } },
    ]);

    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        description:    'A stunning portrait radiating artistic energy.',
        dominantFeature:'expressive presence',
        artisticNote:   'This portrait captures the soul beautifully.',
        colorPalette:   ['#a855f7', '#ec4899', '#22d3ee'],
        styleEmoji:     '🎨',
        title:          'Digital Masterpiece',
        shareCaption:   'My AI portrait just dropped and it slaps.',
      };
    }

    return res.json(apiSuccess({ ...parsed, style, styleDef: selectedStyle }, 'Photo analyzed'));
  } catch (err) {
    console.error('describePhoto error:', err.message);
    return res.status(500).json(apiError('Photo analysis failed: ' + err.message));
  }
};

// GET /api/photobooth/styles — list all available styles
export const getStyles = async (req, res) => {
  try {
    const styleList = Object.entries(STYLES).map(([id, s]) => ({
      id,
      label: id === 'oilpainting' ? 'Oil Painting' : id.charAt(0).toUpperCase() + id.slice(1),
      mood: s.mood,
    }));
    return res.json(apiSuccess(styleList, 'Styles fetched'));
  } catch (err) {
    return res.status(500).json(apiError(err.message));
  }
};
