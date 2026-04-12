import fetch from 'node-fetch';
import { callGemini } from './geminiService.js';
import dotenv from 'dotenv';
dotenv.config();

export const generateMusicForWebreel = async ({ emotion, topic, colorPalette, musicMood }) => {
  const musicMetadata = await generateMusicMetadata({ emotion, topic, colorPalette, musicMood });

  if (process.env.HUGGINGFACE_API_KEY) {
    try {
      const audioBuffer = await callHuggingFaceMusicGen(musicMetadata.prompt);
      if (audioBuffer) {
        return { type: 'audio', url: null, buffer: audioBuffer, metadata: musicMetadata };
      }
    } catch (e) {
      console.log('HuggingFace MusicGen failed, using Tone.js fallback:', e.message);
    }
  }

  return { type: 'synthesis', metadata: musicMetadata };
};

const generateMusicMetadata = async ({ emotion, topic, colorPalette, musicMood }) => {
  const prompt = `You are a music director AI. Create a music description for a webreel.
Topic: ${topic}
Emotion: ${emotion || 'neutral'}
Music Mood: ${musicMood || 'ambient'}
Color Palette: ${colorPalette?.join(', ') || 'purple, pink, blue'}

Respond ONLY as valid JSON (no markdown, no backticks):
{
  "prompt": "detailed music generation prompt for MusicGen",
  "bpm": 120,
  "key": "C minor",
  "timeSignature": "4/4",
  "instruments": ["synthesizer", "drums", "bass"],
  "mood": "epic",
  "intro": "description of intro",
  "build": "description of main section",
  "outro": "description of outro",
  "toneJsSynthesis": {
    "oscillatorType": "sine",
    "filterFreq": 800,
    "reverbDecay": 2.5,
    "delayTime": "8n",
    "noteSequence": ["C4", "E4", "G4", "B4", "D5"],
    "noteDuration": "8n"
  }
}`;

  const raw = await callGemini(prompt, { temperature: 0.7 });
  const clean = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    return {
      prompt: `${musicMood || 'ambient'} electronic music for ${topic}`,
      bpm: 120,
      key: 'C minor',
      instruments: ['synthesizer'],
      mood: 'ambient',
      toneJsSynthesis: {
        oscillatorType: 'sine',
        filterFreq: 800,
        reverbDecay: 3,
        noteSequence: ['C4', 'E4', 'G4'],
        noteDuration: '4n',
      },
    };
  }
};

const callHuggingFaceMusicGen = async (prompt) => {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/facebook/musicgen-small',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );
  if (!response.ok) throw new Error(`HF API error: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};
