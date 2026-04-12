import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
  process.env.GEMINI_MODEL_PRIMARY || 'gemini-1.5-flash',
  process.env.GEMINI_MODEL_FALLBACK || 'gemini-1.0-pro',
  process.env.GEMINI_MODEL_FALLBACK_2 || 'gemini-pro',
];

const VISION_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro'];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const callGemini = async (prompt, options = {}) => {
  const { temperature = 0.7, maxOutputTokens = 2048, systemInstruction = null } = options;

  for (let modelIndex = 0; modelIndex < MODELS.length; modelIndex++) {
    const modelName = MODELS[modelIndex];
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const config = {
          model: modelName,
          generationConfig: { temperature, maxOutputTokens },
        };
        if (systemInstruction) config.systemInstruction = systemInstruction;
        const model = genAI.getGenerativeModel(config);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (!text) throw new Error('Empty response');
        return text;
      } catch (error) {
        const isQuota = error.message?.includes('429') || error.message?.includes('quota');
        if (attempt < 3) {
          await sleep(isQuota ? 2000 * attempt : 500 * attempt);
        } else if (modelIndex === MODELS.length - 1) {
          throw error;
        }
      }
    }
  }
};

export const callGeminiJSON = async (prompt, options = {}) => {
  const raw = await callGemini(prompt, options);
  const clean = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Gemini did not return valid JSON');
  }
};

export const callGeminiWithImage = async (prompt, base64Image, mimeType, options = {}) => {
  const { temperature = 0.7, maxOutputTokens = 2048 } = options;

  for (let modelIndex = 0; modelIndex < VISION_MODELS.length; modelIndex++) {
    const modelName = VISION_MODELS[modelIndex];
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature, maxOutputTokens },
        });

        const result = await model.generateContent([
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt },
        ]);

        const raw = result.response.text();
        const clean = raw.replace(/```json|```/g, '').trim();

        try {
          return JSON.parse(clean);
        } catch {
          const match = clean.match(/\{[\s\S]*\}/);
          if (match) return JSON.parse(match[0]);
          throw new Error('Vision model did not return valid JSON');
        }
      } catch (error) {
        if (attempt < 3) await sleep(1000 * attempt);
        else if (modelIndex === VISION_MODELS.length - 1) throw error;
      }
    }
  }
};
