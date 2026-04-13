import { callGemini, callGeminiJSON } from './geminiService.js';

export const runEmotionThemeAgent = async (emotion, intensity = 0.5) => {
  const prompt = `You are an emotion-to-3D-scene mapper for an immersive web experience called Dhindhora.
Given emotion: "${emotion}" at intensity ${intensity} (0-1 scale).

Respond ONLY as valid JSON (no markdown):
{
  "galaxyColor": "#hex",
  "particleSpeed": 0.5,
  "cameraDistance": 8,
  "fogDensity": 0.03,
  "musicMood": "calm|epic|melancholy|upbeat|tense",
  "ambientColor": "#hex",
  "pulseRate": 1.0,
  "starCount": 500000,
  "description": "one line describing the scene"
}`;

  return await callGeminiJSON(prompt);
};

export const runStartupEvaluationAgent = async (idea, onStep) => {
  const steps = [
    { title: 'Market Analysis', prompt: `Analyze the market potential for this startup idea: "${idea}". Be concise (3-4 sentences). Include TAM/SAM/SOM estimates.` },
    { title: 'Technical Feasibility', prompt: `Evaluate technical feasibility of: "${idea}". Rate complexity 1-10. List key tech challenges (3 points).` },
    { title: 'Competition Analysis', prompt: `List top 3 competitors for: "${idea}". For each: name, strength, weakness. Be concise.` },
    { title: 'Revenue Model', prompt: `Suggest 3 revenue models for: "${idea}". For each: model name, estimated revenue potential, time to revenue.` },
    { title: 'Final Score', prompt: `Give a final startup viability score (0-100) for: "${idea}". Format: {"score": N, "verdict": "...", "topRisk": "...", "topOpportunity": "...", "advice": "..."}. Respond ONLY as JSON.` },
  ];

  const results = [];
  for (const step of steps) {
    if (onStep) onStep({ title: step.title, content: 'Processing...', timestamp: Date.now() });
    const result = await callGemini(step.prompt);
    results.push({ title: step.title, content: result });
    if (onStep) onStep({ title: step.title, content: result, timestamp: Date.now() });
  }

  let finalScore;
  try {
    finalScore = await callGeminiJSON(results[results.length - 1].content);
  } catch {
    finalScore = { score: 70, verdict: 'Promising', topRisk: 'Market uncertainty', topOpportunity: 'First mover advantage', advice: 'Validate with customers ASAP' };
  }

  return { steps: results, finalScore };
};

export const runStoryEngineAgent = async (genre, choice, previousContext) => {
  const prompt = `You are an interactive story engine for Dhindhora Weboreels.
Genre: ${genre}
Previous context: ${previousContext || 'Start a brand new story.'}
User choice: ${choice || 'Begin the story'}

Write the next scene (3-4 paragraphs, vivid and engaging).
Then provide exactly 3 choices for the reader.

Respond ONLY as JSON:
{
  "scene": "...",
  "choices": ["choice1", "choice2", "choice3"],
  "mood": "tense|exciting|mysterious|romantic|funny",
  "visualHint": "description for 3D background scene"
}`;

  return await callGeminiJSON(prompt);
};

export const runPersonalityAgent = async (answers) => {
  const prompt = `Analyze these personality quiz answers and create a fun, shareable personality profile.
Answers: ${JSON.stringify(answers)}

Respond ONLY as JSON:
{
  "type": "The Visionary|The Creator|The Explorer|The Strategist|The Rebel",
  "emoji": "🚀",
  "description": "2-3 sentence personality description",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "compatibleWith": "another type",
  "spirit_animal": "animal name",
  "color": "#hex",
  "tagline": "a catchy one-liner"
}`;

  return await callGeminiJSON(prompt);
};

export const runWebreelContentAgent = async (topic, category, userInfo) => {
  const prompt = `Generate complete webreel content for Dhindhora platform.
Topic: "${topic}"
Category: ${category}
Creator: ${userInfo}

Create engaging, viral content. Respond ONLY as JSON:
{
  "title": "catchy title (max 8 words)",
  "tagline": "powerful tagline (max 15 words)",
  "heroText": "3 powerful words for hero section",
  "category": "${category}",
  "emotion": "primary emotion",
  "colorPalette": ["#hex1", "#hex2", "#hex3"],
  "musicMood": "ambient|epic|upbeat|melancholy|tense",
  "sections": [
    {"title": "section title", "content": "2-3 sentences", "visualHint": "3D|particle|scroll"},
    {"title": "section title", "content": "2-3 sentences", "visualHint": "3D|particle|scroll"},
    {"title": "section title", "content": "2-3 sentences", "visualHint": "3D|particle|scroll"}
  ],
  "interactionHook": "idea for interactive element",
  "cta": "call to action text"
}`;

  return await callGeminiJSON(prompt);
};

export const runRoastAgent = async (profileText) => {
  const prompt = `You are a savage but funny roast comedian AI for Dhindhora platform.
Roast this profile in 3-4 lines. Be hilarious but not mean. Use Gen-Z humor.
Profile: "${profileText}"

Respond ONLY as JSON:
{
  "roast": "the roast text",
  "burnLevel": "mild|medium|well-done|cremated",
  "emoji": "🔥",
  "comeback": "a witty comeback the person could use"
}`;

  return await callGeminiJSON(prompt);
};
