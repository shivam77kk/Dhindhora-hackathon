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

const cleanJSON = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`JSON parsing failed: ${e.message}`);
  }
};


const getSafetyMockResponse = (prompt, isJSON) => {
  console.warn('🛡️ Entering Safety Mock Mode (AI API Blocked or Failed)');
  if (!isJSON) return "In the heart of the digital galaxy, our vision transcends the physical. We build not just with code, but with the stardust of potential. Dhindhora is the echo of our collective ambition.";

  
  if (prompt.includes('webreel content') || prompt.includes('Analyze this image')) {
    return {
      topic: "Digital Innovation",
      emotion: "Inspiring",
      colorPalette: ["#6C63FF", "#EC4899", "#06B6D4"],
      title: "The Future of Digital Stardust",
      tagline: "Building the impossible with the tools of tomorrow.",
      heroText: "Create. Innovate. Transcend.",
      musicMood: "epic",
      category: "startup",
      sections: [
        { title: "The Vision", content: "Exploring the boundaries of what AI can achieve in a decentralized world.", visualHint: "scroll" },
        { title: "The Engine", content: "Powered by Anti-Gravity technology and the collective stardust of creators.", visualHint: "particle" },
        { title: "The Galaxy", content: "Join the community that amplifies your story beyond the horizon.", visualHint: "3D" }
      ],
      interactionHook: "Click to orbit the core vision",
      cta: "Launch Your Story"
    };
  }

  if (prompt.includes('personality')) {
    return {
      type: "The Visionary",
      emoji: "🚀",
      description: "You see the galaxy not as a void, but as a canvas of infinite potential.",
      strengths: ["Innovation", "Clarity", "Leadership"],
      weaknesses: ["Impatience", "Over-analysis"],
      compatibleWith: "The Creator",
      spirit_animal: "Phoenix",
      color: "#6C63FF",
      tagline: "Defining the future through the lens of stardust."
    };
  }

  
  return { success: true, message: "AI response generated via Safety SOP", text: "Proceed with the galaxy mission." };
};


export const callAIRobust = async (prompt, type = 'text', options = {}) => {
  const { 
    temperature = 0.7, 
    maxOutputTokens = 2048, 
    systemInstruction = null,
    isJSON = false,
    imageData = null,
    mimeType = null
  } = options;

  const activeModels = type === 'vision' ? VISION_MODELS : MODELS;
  let lastError;

  for (let modelIndex = 0; modelIndex < activeModels.length; modelIndex++) {
    const modelName = activeModels[modelIndex];
    console.log(`🤖 Attempting ${type} generation with model: ${modelName}`);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const config = {
          model: modelName,
          generationConfig: { temperature, maxOutputTokens },
        };
        if (systemInstruction) config.systemInstruction = systemInstruction;
        
        const model = genAI.getGenerativeModel(config);
        let result;

        if (type === 'vision' && imageData) {
          result = await model.generateContent([
            { inlineData: { data: imageData, mimeType } },
            { text: prompt },
          ]);
        } else {
          result = await model.generateContent(prompt);
        }

        const text = result.response.text();
        if (!text) throw new Error('Empty AI response');

        if (isJSON) {
          try {
            return cleanJSON(text);
          } catch (jsonErr) {
            console.warn(`⚠️ JSON Parse Failed on attempt ${attempt}. Retrying with repair prompt...`);
            const repairPrompt = `The previous response was not valid JSON. Please fix it and return ONLY the valid JSON object. Original response: ${text}`;
            const repairResult = await model.generateContent(repairPrompt);
            const repairedText = repairResult.response.text();
            return cleanJSON(repairedText);
          }
        }

        return text;
      } catch (error) {
        lastError = error;
        const isQuota = error.message?.includes('429') || error.message?.includes('quota');
        console.error(`❌ Attempt ${attempt} failed with model ${modelName}: ${error.message}`);

        if (attempt < 3) {
          const waitTime = isQuota ? 3000 * attempt : 1000 * attempt;
          await sleep(waitTime);
        }
      }
    }
  }

  
  return getSafetyMockResponse(prompt, isJSON);
};


export const callGemini = (prompt, options) => callAIRobust(prompt, 'text', options);
export const callGeminiJSON = (prompt, options) => callAIRobust(prompt, 'text', { ...options, isJSON: true });
export const callGeminiWithImage = (prompt, base64Image, mimeType, options) => 
  callAIRobust(prompt, 'vision', { ...options, isJSON: true, imageData: base64Image, mimeType });
