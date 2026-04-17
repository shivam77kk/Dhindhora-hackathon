import { callGeminiJSON } from '../services/geminiService.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import RoastEntry from '../models/RoastEntry.js';


export const generateRoast = async (req, res) => {
  try {
    const { name, traits, roastLevel } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json(apiError('Name is required'));
    }

    const level = ['mild', 'medium', 'savage'].includes(roastLevel) ? roastLevel : 'medium';
    const levelDesc = {
      mild: 'very light, friendly teasing — like a best friend joking around',
      medium: 'genuinely funny roast — witty and a bit savage but not mean',
      savage: 'hilariously brutal (but never offensive, racist, or genuinely hurtful)',
    }[level];

    const userTraits = (traits || '').trim();
    const traitInstructions = userTraits
      ? `CRITICAL: The user described themselves as: "${userTraits}". You MUST directly reference and roast specific things from their description. DO NOT give a generic roast. Pick apart what they said about themselves and make fun of THOSE specific details.`
      : `The user gave no description. Roast them for being too boring/scared to even describe themselves.`;

    const prompt = `You are a world-class stand-up comedian AI creating a PERSONALIZED roast for a web app.
Person's name: "${name.trim()}"

${traitInstructions}

Roast intensity: ${levelDesc}

IMPORTANT RULES:
- The roast MUST be UNIQUE and PERSONALIZED to what they said about themselves
- Reference their SPECIFIC traits, habits, interests, or quirks they mentioned
- If they said they like coding, roast their coding. If they said they're a chai addict, roast that.
- NEVER give a generic "you're so unique" type roast — always target their self-description
- Keep it funny, creative, and shareable. Never genuinely offensive.
- Max 2 sentences per field.

Respond ONLY with valid JSON — no markdown, no backticks, no extra text:
{
  "roast": "<2-sentence funny roast DIRECTLY referencing their description>",
  "praise": "<2-sentence genuine heartfelt compliment based on what they shared>",
  "verdict": "<1 ALL-CAPS word that defines them e.g. LEGENDARY>",
  "roastScore": <integer 1-100 how roastable they are>,
  "funnyNickname": "<creative funny nickname inspired by their traits max 4 words>",
  "superpower": "<their ridiculous superpower based on their traits max 6 words>",
  "weakness": "<their silly weakness based on their traits max 6 words>",
  "emoji": "<single emoji that represents them based on their description>",
  "shareText": "<punchy social media one-liner max 12 words>"
}`;

    const result = await callGeminiJSON(prompt, { temperature: 0.92, maxOutputTokens: 512 });

    
    const safe = {
      roast:         result.roast         || `${name} is so unique, even AI is confused.`,
      praise:        result.praise        || `${name} brings genuine energy to everything.`,
      verdict:       result.verdict       || 'ICONIC',
      roastScore:    Math.min(100, Math.max(1, parseInt(result.roastScore) || 70)),
      funnyNickname: result.funnyNickname || 'The One and Only',
      superpower:    result.superpower    || 'Being impossible to ignore',
      weakness:      result.weakness      || 'Too much personality',
      emoji:         result.emoji         || '🔥',
      shareText:     result.shareText     || `${name} just got roasted on Dhindhora!`,
    };

    
    const entry = await RoastEntry.create({
      name: name.trim(),
      roastLevel: level,
      ...safe,
    });

    
    if (req.io) {
      req.io.emit('roast:new-entry', {
        _id: entry._id,
        name: entry.name,
        roastScore: entry.roastScore,
        verdict: entry.verdict,
        funnyNickname: entry.funnyNickname,
        roast: entry.roast,
        emoji: entry.emoji,
        createdAt: entry.createdAt,
      });
    }

    return res.json(apiSuccess({ ...safe, entryId: entry._id.toString() }, 'Roast generated!'));
  } catch (err) {
    console.error('generateRoast error:', err.message);
    return res.status(500).json(apiError('Roast generation failed: ' + err.message));
  }
};


export const getRoastLeaderboard = async (req, res) => {
  try {
    const entries = await RoastEntry.find()
      .sort({ roastScore: -1, createdAt: -1 })
      .limit(25)
      .select('name roastScore verdict funnyNickname roast emoji roastLevel createdAt')
      .lean();
    return res.json(apiSuccess(entries, 'Leaderboard fetched'));
  } catch (err) {
    console.error('getRoastLeaderboard error:', err.message);
    return res.status(500).json(apiError(err.message));
  }
};


export const roastBattle = async (req, res) => {
  try {
    const { person1, person2 } = req.body;

    if (!person1?.name || !person2?.name) {
      return res.status(400).json(apiError('Both fighters need names'));
    }

    const prompt = `You are an AI host for an epic roast battle show.
Fighter 1: "${person1.name}" — traits: "${person1.traits || 'mysterious'}"
Fighter 2: "${person2.name}" — traits: "${person2.traits || 'legendary'}"

Host a 3-round roast battle. Each fighter roasts the other. Keep it funny and entertaining, never genuinely offensive.
Respond ONLY with valid JSON — no markdown, no extra text:
{
  "rounds": [
    {
      "round": 1,
      "person1Attack": "<fighter 1 roast of fighter 2, max 2 sentences>",
      "person2Attack": "<fighter 2 roast of fighter 1, max 2 sentences>",
      "roundWinner": "person1|person2|tie",
      "crowdReaction": "<crowd reaction with emoji max 8 words>"
    },
    {
      "round": 2,
      "person1Attack": "...",
      "person2Attack": "...",
      "roundWinner": "person1|person2|tie",
      "crowdReaction": "..."
    },
    {
      "round": 3,
      "person1Attack": "...",
      "person2Attack": "...",
      "roundWinner": "person1|person2|tie",
      "crowdReaction": "..."
    }
  ],
  "overallWinner": "person1|person2|tie",
  "finalVerdict": "<epic 1 sentence final verdict>",
  "trophyLine": "<funny trophy description max 8 words>"
}`;

    const result = await callGeminiJSON(prompt, { temperature: 0.92, maxOutputTokens: 1024 });

    
    if (!Array.isArray(result.rounds) || result.rounds.length === 0) {
      throw new Error('Invalid battle format from AI');
    }

    return res.json(apiSuccess(result, 'Battle completed!'));
  } catch (err) {
    console.error('roastBattle error:', err.message);
    return res.status(500).json(apiError('Battle failed: ' + err.message));
  }
};
