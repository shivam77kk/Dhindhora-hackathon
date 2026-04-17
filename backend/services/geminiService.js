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

  
  // Battle-specific mock — MUST come before solo roast check since battle prompts also contain 'roast'
  if (prompt.includes('Fighter 1') || prompt.includes('roast battle show')) {
    const name1Match = prompt.match(/Fighter 1:\s*"([^"]+)"/i);
    const name2Match = prompt.match(/Fighter 2:\s*"([^"]+)"/i);
    const traits1Match = prompt.match(/Fighter 1:\s*"[^"]+"\s*—\s*traits:\s*"([^"]+)"/i);
    const traits2Match = prompt.match(/Fighter 2:\s*"[^"]+"\s*—\s*traits:\s*"([^"]+)"/i);
    const n1 = name1Match ? name1Match[1] : 'Fighter 1';
    const n2 = name2Match ? name2Match[1] : 'Fighter 2';
    const t1 = traits1Match ? traits1Match[1] : 'mysterious';
    const t2 = traits2Match ? traits2Match[1] : 'legendary';

    return {
      rounds: [
        { round: 1, person1Attack: `${n2} claims to be "${t2}"? That's just a fancy way of saying "forgettable". Even autocomplete skips your name.`, person2Attack: `${n1} says they're "${t1}" — the only thing ${t1} about you is how ${t1}ly boring you are. WiFi has more personality.`, roundWinner: 'person1', crowdReaction: '🔥 The crowd goes WILD!' },
        { round: 2, person1Attack: `${n2} thinks being "${t2}" is a flex? My phone's screensaver has more charisma. Even Siri left you on read.`, person2Attack: `${n1}, your "${t1}" energy is giving discount-bin vibes. If personality was currency, you'd owe the bank.`, roundWinner: 'person2', crowdReaction: '😱 OH NO THEY DIDN\'T!' },
        { round: 3, person1Attack: `${n2}, even your mirror does a double take — and not in a good way. "${t2}" is just code for "trying too hard".`, person2Attack: `${n1}, being "${t1}" is your whole identity and it's STILL not enough. Your vibe is a loading screen that never loads.`, roundWinner: 'tie', crowdReaction: '🤯 ABSOLUTE CARNAGE!' },
      ],
      overallWinner: 'tie',
      finalVerdict: `Both ${n1} and ${n2} brought the heat — but neither brought enough ice for those burns!`,
      trophyLine: 'The Trophy of Mutual Destruction 🏆',
    };
  }

  // Solo roast mock — extract name/traits from prompt and generate a personalized fallback
  if (prompt.includes('roast') || prompt.includes('comedian')) {
    const nameMatch = prompt.match(/Person's name:\s*"([^"]+)"/i);
    // Match traits from multiple possible prompt formats
    const traitsMatch = prompt.match(/described themselves as:\s*"([^"]+)"/i)
      || prompt.match(/Their description:\s*"([^"]+)"/i)
      || prompt.match(/user described themselves as:\s*"([^"]+)"/i);
    const name = nameMatch ? nameMatch[1] : 'Friend';
    const traits = traitsMatch ? traitsMatch[1] : '';

    // Pick varied roasts based on name/traits hash
    const hash = (name + traits).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const roasts = [
      `${name} says they're "${traits || 'interesting'}". That's a creative way to say "average". Even autocorrect gives up trying to spell your personality.`,
      `${name} described themselves as "${traits || 'unique'}". I've seen more excitement in a loading spinner. Your personality buffering is at 3%.`,
      `So ${name} is "${traits || 'a regular person'}"? That's like putting "breathing" on your resume. Even your shadow tries to walk away sometimes.`,
      `${name} claims to be "${traits || 'special'}". The only thing special here is how confidently boring that sounds. Your vibe is dial-up internet in a 5G world.`,
      `Ah yes, ${name} — "${traits || 'living the dream'}". More like living the screensaver. Your personality has the energy of an unread notification.`,
      `${name} told us they're "${traits || 'one of a kind'}". One of a kind? More like buy-one-get-one-free at the discount store of personalities.`,
    ];
    const praises = [
      `But honestly, ${name} has the kind of energy that lights up a room. Keep being unapologetically you — the world needs that.`,
      `Real talk though, ${name} clearly has guts. It takes courage to put yourself out there, and that alone makes you legendary.`,
      `Jokes aside, ${name} radiates genuine confidence. That kind of authenticity is rare and genuinely inspiring.`,
      `Beneath it all, ${name} has a spark that most people only dream of. Never dim that light.`,
      `For real though, ${name} is the kind of person who makes everything more interesting. Never change.`,
      `In all seriousness, ${name} brings something special to the table. The world is better with you in it.`,
    ];
    const nicknames = ['The Human Buffer', 'Captain Obvious', 'WiFi Signal in a Cave', 'The Walking Screensaver', 'Ctrl+Z Personified', 'The Dial-Up Legend'];
    const verdicts = ['ICONIC', 'LEGENDARY', 'CHAOTIC', 'UNFILTERED', 'FEARLESS', 'UNSTOPPABLE'];
    const superpowers = ['Making awkward look cool', 'Overthinking at light speed', 'Turning vibes into chaos', 'Being unforgettable accidentally', 'Radiating confused energy', 'Surviving on pure audacity'];
    const weaknesses = ['Allergic to self-awareness', 'Too much confidence juice', 'Cannot read the room', 'Chronically unbothered', 'Dangerously delusional', 'Immune to good advice'];
    const emojis = ['🔥', '💀', '🤡', '👑', '⚡', '🎭'];

    const idx = hash % roasts.length;
    return {
      roast: roasts[idx],
      praise: praises[idx],
      verdict: verdicts[idx],
      roastScore: 40 + (hash % 55),
      funnyNickname: nicknames[idx],
      superpower: superpowers[idx],
      weakness: weaknesses[idx],
      emoji: emojis[idx],
      shareText: `${name} just got DESTROYED on Dhindhora! 🔥`,
    };
  }

  // Shape recognition mock for Air Canvas
  if (prompt.includes('shape-recognition') || prompt.includes('stroke points')) {
    const shapes = ['circle', 'heart', 'star', 'triangle', 'square', 'spiral', 'wave'];
    const triggers = ['sparkle', 'love', 'explode', 'spin', 'portal', 'wave', 'sparkle'];
    const messages = ['Nice strokes!', 'Love it!', 'Stellar work!', 'Sharp edges!', 'Boxy vibes!', 'Hypnotic!', 'Wavy baby!'];
    const shapeEmojis = ['⭕', '❤️', '⭐', '🔺', '⬛', '🌀', '🌊'];
    const hash = prompt.length % shapes.length;
    return {
      shape: shapes[hash],
      confidence: 0.72 + (hash * 0.03),
      animationTrigger: triggers[hash],
      emoji: shapeEmojis[hash],
      uiComponent: 'none',
      message: messages[hash],
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
