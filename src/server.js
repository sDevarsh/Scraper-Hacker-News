const express = require('express');
const initializeDatabase = require('./config/init-db');
const Scraper = require('./services/scraper');
const wsServer = require('./services/websocket');
const cron = require('node-cron');
const storiesRoutes = require('./routes/stories');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.use('/api/stories', storiesRoutes);

async function runScraper() {
    const scraper = new Scraper();
    try {
        await scraper.scrapeStories((story) => wsServer.broadcastStory(story));
        console.log('Scraping completed at:', new Date().toISOString());
    } catch (error) {
        console.error('Error during scraping:', error);
    }
}

initializeDatabase()
    .then(async () => {
        const server = app.listen(PORT, () => {
            console.log(`HTTP Server is running on port ${PORT}`);
        });

        wsServer.initialize(server);

        await runScraper();

        cron.schedule('* * * * *', async () => {
            console.log('Running scheduled scrape');
            await runScraper();
        });
    })
    .catch(error => {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }); 