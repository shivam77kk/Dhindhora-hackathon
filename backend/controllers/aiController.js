import {
  runStartupEvaluationAgent, runStoryEngineAgent, runEmotionThemeAgent,
  runPersonalityAgent, runWebreelContentAgent, runRoastAgent,
} from '../services/langGraphService.js';
import { callGemini, callGeminiJSON, callGeminiWithImage } from '../services/geminiService.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export const getEmotionTheme = async (req, res) => {
  try {
    const { emotion, intensity } = req.body;
    const theme = await runEmotionThemeAgent(emotion, intensity);
    res.json(apiSuccess(theme));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const evaluateStartup = async (req, res) => {
  try {
    const { idea } = req.body;
    const result = await runStartupEvaluationAgent(idea, (step) => {
      req.io.emit('startup:step', step);
    });
    res.json(apiSuccess(result));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const continueStory = async (req, res) => {
  try {
    const { genre, choice, previousContext } = req.body;
    const result = await runStoryEngineAgent(genre, choice, previousContext);
    res.json(apiSuccess(result));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const analyzePersonality = async (req, res) => {
  try {
    const { answers } = req.body;
    const result = await runPersonalityAgent(answers);
    res.json(apiSuccess(result));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const generateWebreelContent = async (req, res) => {
  try {
    const { topic, category } = req.body;
    const userInfo = `${req.user.name}, ${req.user.bio || 'a creator'}`;
    const result = await runWebreelContentAgent(topic, category, userInfo);
    res.json(apiSuccess(result));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const getRoast = async (req, res) => {
  try {
    const { profileText } = req.body;
    const result = await runRoastAgent(profileText);
    res.json(apiSuccess(result));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const aiChat = async (req, res) => {
  try {
    const { message, persona, history } = req.body;
    const systemInstr = persona ? `You are ${persona}. Stay in character at all times.` : null;
    const contextHistory = history ? history.slice(-6).map(h => `${h.role}: ${h.content}`).join('\n') : '';
    const prompt = `${contextHistory}\nuser: ${message}\nassistant:`;
    const reply = await callGemini(prompt, { systemInstruction: systemInstr, temperature: 0.85 });
    res.json(apiSuccess({ reply }));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};

export const streamPoem = async (req, res) => {
  try {
    const { topic } = req.body;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const poem = await callGemini(`Write a beautiful 8-line poem about: "${topic}". Make it vivid and emotionally resonant.`);
    const lines = poem.split('\n').filter(l => l.trim());
    for (const line of lines) {
      res.write(`data: ${JSON.stringify({ line })}\n\n`);
      await new Promise(r => setTimeout(r, 300));
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e) {
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
};

export const multimodalCreate = async (req, res) => {
  try {
    const { type } = req.body;
    const file = req.file;
    let analysisResult;

    if (type === 'photo' || type === 'video') {
      const base64Image = file.buffer.toString('base64');
      const mimeType = file.mimetype;
      analysisResult = await callGeminiWithImage(
        `Analyze this image and create a complete webreel. Extract:
1. Main subject/theme
2. Dominant emotions conveyed
3. Color palette (3 hex codes)
4. Suggested webreel title (catchy, max 8 words)
5. Tagline (max 15 words)
6. Hero text (3 powerful words)
7. Music mood (calm/epic/upbeat/melancholy/intense)
8. 3 webreel sections with content
9. Interaction hook idea

Respond ONLY as valid JSON (no markdown):
{
  "topic": "...",
  "emotion": "...",
  "colorPalette": ["#hex1", "#hex2", "#hex3"],
  "title": "...",
  "tagline": "...",
  "heroText": "...",
  "musicMood": "...",
  "category": "startup|story|portfolio|product|personal",
  "sections": [
    {"title": "...", "content": "...", "visualHint": "3D|particle|scroll"}
  ],
  "interactionHook": "..."
}`,
        base64Image, mimeType
      );
    } else if (type === 'voice') {
      const { transcript } = req.body;
      analysisResult = await callGeminiJSON(
        `Analyze this voice transcript and create a complete webreel:
Transcript: "${transcript}"

Respond ONLY as valid JSON:
{
  "topic": "...",
  "emotion": "...",
  "colorPalette": ["#6C63FF", "#EC4899", "#06B6D4"],
  "title": "...",
  "tagline": "...",
  "heroText": "...",
  "musicMood": "...",
  "category": "personal",
  "sections": [{"title": "...", "content": "...", "visualHint": "particle"}],
  "interactionHook": "..."
}`
      );
    }

    let sourceUrl = null;
    if (file) {
      try {
        const resourceType = type === 'voice' ? 'video' : 'image';
        const upload = await uploadToCloudinary(file.buffer, {
          resourceType, folder: 'dhindhora/multimodal',
        });
        sourceUrl = upload.secure_url;
      } catch (e) {
        console.error('Source file upload failed:', e.message);
      }
    }

    res.json(apiSuccess({ content: analysisResult, sourceUrl, createdFrom: type }));
  } catch (e) {
    res.status(500).json(apiError(`Multimodal creation failed: ${e.message}`));
  }
};
