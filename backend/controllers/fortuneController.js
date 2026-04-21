import { callGeminiJSON } from '../services/geminiService.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import FortuneReading from '../models/FortuneReading.js';

// LangGraph-style multi-step fortune agent
async function runFortuneAgent(answers, onStep) {
  const steps = [];
  const addStep = (label, data) => {
    const s = { label, data, timestamp: Date.now() };
    steps.push(s);
    if (onStep) onStep(s);
  };

  addStep('reading', 'Consulting the cosmic archives...');

  // Step 1: Parse the spiritual meaning of each answer
  const meaningPrompt = `These are answers to 3 mystical questions from a personality oracle web app.
The questions were:
Q1: Choose your element — Fire / Water / Earth / Air / Void
Q2: Choose your time of power — Dawn / Dusk / Midnight / Noon / Eclipse  
Q3: Choose your spirit path — Hunter / Healer / Builder / Wanderer / Oracle

User's answers: ${JSON.stringify(answers)}

Analyze the mystical significance. Respond ONLY with valid JSON:
{
  "elementMeaning": "<1 sentence about their element choice>",
  "timeMeaning": "<1 sentence about their time choice>",
  "pathMeaning": "<1 sentence about their path choice>",
  "overallArchetype": "<one word archetype e.g. MYSTIC, WARRIOR, SAGE, CREATOR, REBEL>"
}`;

  const meaning = await callGeminiJSON(meaningPrompt, { temperature: 0.7, maxOutputTokens: 512 });
  addStep('archetype', `You are the ${meaning.overallArchetype || 'MYSTIC'}...`);

  // Step 2: Generate the full cosmic reading
  const readingPrompt = `You are an ancient cosmic oracle generating a hyper-personalized mystical reading for a web experience.
User archetype: ${meaning.overallArchetype || 'MYSTIC'}
Their choices: Element=${answers[0]}, Time=${answers[1]}, Path=${answers[2]}
Element meaning: ${meaning.elementMeaning || 'A powerful elemental connection'}
Path meaning: ${meaning.pathMeaning || 'A destined journey'}

Create an epic, dramatic, poetic cosmic reading. Be mystical, specific, and surprising.
Respond ONLY with valid JSON:
{
  "spiritAnimal": "<specific animal with 1-sentence reason, max 15 words>",
  "cosmicElement": "<element name + what it means for them, max 15 words>",
  "destinyQuote": "<dramatic destiny quote attributed to a cosmic entity, max 20 words>",
  "hiddenPower": "<their secret superpower, max 10 words>",
  "fatalFlaw": "<their dramatic weakness, max 10 words, poetic>",
  "lifeQuest": "<their cosmic mission in this lifetime, max 15 words>",
  "luckyNumber": <integer 1-99>,
  "auraColor": "<hex color that represents their aura>",
  "cardEmoji": "<single most fitting emoji>",
  "warningSign": "<a dramatic cosmic warning, max 12 words>",
  "cosmicAlliance": "<a famous person or mythological figure who shares their energy>"
}`;

  addStep('revelation', 'The cosmos speaks...');
  const reading = await callGeminiJSON(readingPrompt, { temperature: 0.9, maxOutputTokens: 1024 });
  addStep('complete', 'Your cosmic reading is ready!');

  return { ...reading, archetype: meaning.overallArchetype || 'MYSTIC', steps };
}

// POST /api/fortune/generate
export const generateFortune = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length !== 3) {
      return res.status(400).json(apiError('Exactly 3 answers required'));
    }

    const steps = [];
    const result = await runFortuneAgent(answers, (step) => {
      steps.push(step);
      // Broadcast progress via Socket.io
      if (req.io) req.io.emit('fortune:step', step);
    });

    // Validate required fields with fallbacks
    const safe = {
      spiritAnimal:    result.spiritAnimal    || 'The Phoenix rising from creative flames',
      cosmicElement:   result.cosmicElement   || 'Void — the space between possibilities',
      destinyQuote:    result.destinyQuote    || '"Your story is written in stardust and chosen paths"',
      hiddenPower:     result.hiddenPower     || 'Seeing through the veil of ordinary reality',
      fatalFlaw:       result.fatalFlaw       || 'Chasing horizons that forever recede',
      lifeQuest:       result.lifeQuest       || 'To ignite the spark in those who have lost their way',
      luckyNumber:     parseInt(result.luckyNumber) || 7,
      auraColor:       result.auraColor       || '#a855f7',
      cardEmoji:       result.cardEmoji       || '🔮',
      warningSign:     result.warningSign     || 'Beware the golden cage of comfort',
      cosmicAlliance:  result.cosmicAlliance  || 'Nikola Tesla',
      archetype:       result.archetype       || 'MYSTIC',
    };

    // Persist to MongoDB
    const entry = await FortuneReading.create({ answers, ...safe });

    if (req.io) {
      req.io.emit('fortune:new', { _id: entry._id, archetype: safe.archetype, cardEmoji: safe.cardEmoji, auraColor: safe.auraColor });
    }

    return res.json(apiSuccess({ ...safe, _id: entry._id.toString(), steps }, 'Fortune revealed!'));
  } catch (err) {
    console.error('generateFortune error:', err.message);
    return res.status(500).json(apiError('Fortune generation failed: ' + err.message));
  }
};

// GET /api/fortune/recent — show recent community readings
export const getRecentReadings = async (req, res) => {
  try {
    const readings = await FortuneReading.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .select('archetype cardEmoji auraColor destinyQuote spiritAnimal createdAt likes')
      .lean();
    return res.json(apiSuccess(readings, 'Recent readings'));
  } catch (err) {
    return res.status(500).json(apiError(err.message));
  }
};

// POST /api/fortune/:id/like
export const likeFortune = async (req, res) => {
  try {
    const reading = await FortuneReading.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!reading) return res.status(404).json(apiError('Reading not found'));
    return res.json(apiSuccess({ likes: reading.likes }));
  } catch (err) {
    return res.status(500).json(apiError(err.message));
  }
};
