import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/image', async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url' });
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Invalid protocol' });
    }
    const allowed = (process.env.ALLOWED_IMAGE_HOSTS || 'images.unsplash.com').split(',').map(s => s.trim().toLowerCase());
    if (!allowed.includes(parsed.hostname.toLowerCase())) {
      return res.status(403).json({ error: 'Host não autorizado' });
    }

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'PrimeStoreProxy/1.0',
        Accept: 'image/*',
      },
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(Buffer.from(response.data));
  } catch (error) {
    return next(error);
  }
});

export default router;
