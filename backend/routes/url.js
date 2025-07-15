import express from 'express';
import Url from '../models/Url.js';
import { nanoid } from 'nanoid';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const generateShortCode = () => {
  return nanoid(8);
};

router.post('/api/shorten', authenticateToken, async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if URL already exists for this user
    const existingUrl = await Url.findOne({ originalUrl, userId: req.user.userId });
    if (existingUrl) {
      return res.json({
        shortCode: existingUrl.shortCode,
        originalUrl: existingUrl.originalUrl,
        shortUrl: `${req.protocol}://${req.get('host')}/api/${existingUrl.shortCode}`
      });
    }

    let shortCode;
    let isUnique = false;
    
    while (!isUnique) {
      shortCode = generateShortCode();
      const existingCode = await Url.findOne({ shortCode });
      if (!existingCode) {
        isUnique = true;
      }
    }

    const url = new Url({
      originalUrl,
      shortCode,
      userId: req.user.userId
    });

    await url.save();

    res.status(201).json({
      shortCode,
      originalUrl,
      shortUrl: `${req.protocol}://${req.get('host')}/api/${shortCode}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect to original URL
router.get('/api/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const url = await Url.findOne({ shortCode: code });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Track click
    url.clicks += 1;
    url.clickHistory.push({
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    await url.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get URL stats
router.get('/api/stats/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;
    
    const url = await Url.findOne({ shortCode: code, userId: req.user.userId });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      clickHistory: url.clickHistory
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's URLs with pagination
router.get('/api/urls', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const urls = await Url.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Url.countDocuments({ userId: req.user.userId });

    res.json({
      urls,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUrls: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete URL
router.delete('/api/urls/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;
    
    const url = await Url.findOneAndDelete({ shortCode: code, userId: req.user.userId });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
