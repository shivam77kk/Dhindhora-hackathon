import { generateMusicForWebreel } from '../services/musicService.js';
import Webreel from '../models/Webreel.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export const generateMusic = async (req, res) => {
  try {
    const { emotion, topic, colorPalette, musicMood, webreelId } = req.body;
    const result = await generateMusicForWebreel({ emotion, topic, colorPalette, musicMood });

    if (result.type === 'audio' && result.buffer) {
      try {
        const uploadResult = await uploadToCloudinary(result.buffer, {
          resourceType: 'video',
          folder: 'dhindhora/music',
          public_id: `music_${webreelId || Date.now()}`,
        });
        if (webreelId) {
          await Webreel.findByIdAndUpdate(webreelId, {
            musicUrl: uploadResult.secure_url, musicStatus: 'ready',
            musicPrompt: result.metadata.prompt,
          });
        }
        return res.json(apiSuccess({ type: 'audio', url: uploadResult.secure_url, metadata: result.metadata }));
      } catch (uploadErr) {
        console.error('Music upload failed:', uploadErr.message);
      }
    }

    if (webreelId) {
      await Webreel.findByIdAndUpdate(webreelId, {
        musicStatus: 'ready', musicPrompt: result.metadata.prompt,
      });
    }
    res.json(apiSuccess({ type: 'synthesis', metadata: result.metadata }));
  } catch (e) {
    res.status(500).json(apiError(e.message));
  }
};
