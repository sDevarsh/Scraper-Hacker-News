const express = require('express');
const router = express.Router();
const Scraper = require('../services/scraper');

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const scraper = new Scraper();
        const [stories, total] = await scraper.getAllStories(limit, offset);
        
        res.json({
            stories,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({ error: 'Failed to fetch stories' });
    }
});

module.exports = router; 