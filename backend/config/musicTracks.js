/**
 * NEW CONFIG ADDED FOR DHINDHORA MULTI-FRONTEND
 * Curated royalty-free music tracks mapped by featureId
 * Sources: Pixabay Music (royalty-free for commercial use)
 */
const MUSIC_TRACKS = {
  'roast': {
    trackUrl: 'https://cdn.pixabay.com/audio/2024/11/29/audio_a0c25bffc5.mp3',
    title: 'Hip Hop Beat',
    artist: 'Pixabay',
    bpm: 95,
  },
  'fortune': {
    trackUrl: 'https://cdn.pixabay.com/audio/2024/09/10/audio_6e1f3ae2d5.mp3',
    title: 'Mystical Ambient',
    artist: 'Pixabay',
    bpm: 80,
  },
  'game': {
    trackUrl: 'https://cdn.pixabay.com/audio/2024/10/07/audio_8aefe29a57.mp3',
    title: 'Arcade Energy',
    artist: 'Pixabay',
    bpm: 140,
  },
  'globe': {
    trackUrl: 'https://cdn.pixabay.com/audio/2024/08/21/audio_47bb4d298f.mp3',
    title: 'Space Exploration',
    artist: 'Pixabay',
    bpm: 90,
  },
  'photobooth': {
    trackUrl: 'https://cdn.pixabay.com/audio/2024/07/15/audio_85d1f8b5c7.mp3',
    title: 'Retro Synth Wave',
    artist: 'Pixabay',
    bpm: 110,
  },
  'aircanvas': {
    trackUrl: 'https://cdn.pixabay.com/audio/2024/06/18/audio_4a3e7fc2d9.mp3',
    title: 'Creative Flow',
    artist: 'Pixabay',
    bpm: 100,
  },
  'story': {
    trackUrl: 'https://cdn.pixabay.com/audio/2024/05/20/audio_c9b2a1e3f7.mp3',
    title: 'Epic Cinematic',
    artist: 'Pixabay',
    bpm: 85,
  },
  'webreel': {
    trackUrl: 'https://cdn.pixabay.com/audio/2024/04/15/audio_d8e5f3a2c1.mp3',
    title: 'Digital Galaxy',
    artist: 'Pixabay',
    bpm: 120,
  },
  'prediction': {
    trackUrl: 'https://cdn.pixabay.com/audio/2024/03/10/audio_b7c4d9e1f5.mp3',
    title: 'Cyber Tension',
    artist: 'Pixabay',
    bpm: 130,
  },
  'startup': {
    trackUrl: 'https://cdn.pixabay.com/audio/2024/02/08/audio_a1e3c5d7f9.mp3',
    title: 'Innovation Drive',
    artist: 'Pixabay',
    bpm: 115,
  },
  'hub': {
    trackUrl: 'https://cdn.pixabay.com/audio/2024/01/12/audio_e2f4a6c8d0.mp3',
    title: 'Portal Gateway',
    artist: 'Pixabay',
    bpm: 100,
  },
};

// Fallback track for unknown featureIds
const FALLBACK_TRACK = {
  trackUrl: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',
  title: 'Ambient Dream',
  artist: 'Pixabay',
  bpm: 90,
};

export const getMusicTrack = (featureId) => {
  return MUSIC_TRACKS[featureId] || FALLBACK_TRACK;
};

export default MUSIC_TRACKS;
