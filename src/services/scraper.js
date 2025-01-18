const axios = require('axios');
const cheerio = require('cheerio');
const Story = require('../models/story');

class Scraper {
    async scrapeStories(broadcastCallback) {
        try {
            console.log('\n=== Starting scraping at', new Date().toLocaleString(), '===');
            
            const response = await axios.get('https://news.ycombinator.com/newest');
            const $ = cheerio.load(response.data);
            const stories = [];
            
            $('.athing').each((i, element) => {
                const $element = $(element);
                const $subtext = $element.next('tr');
                
                const titleElement = $element.find('.titleline > a').first();
                const title = titleElement.text();
                const url = titleElement.attr('href');
                
                const domain = $element.find('.sitestr').text();
                
                const id = $element.attr('id');
                
                 const points = parseInt($subtext.find('.score').text()) || 0;
                const author = $subtext.find('.hnuser').text();
                const timeAgo = $subtext.find('.age').text();
                const commentsText = $subtext.find('a').last().text();
                const commentsCount = parseInt(commentsText) || 0;
                
                let type = 'story';
                if (url && url.startsWith('item?id=')) {
                    type = 'ask';
                } else if (title.toLowerCase().startsWith('show hn:')) {
                    type = 'show';
                }

                stories.push({
                    id: parseInt(id),
                    title,
                    url,
                    author,
                    points,
                    comments_count: commentsCount,
                    type,
                    domain,
                    description: null,
                    time_ago: timeAgo
                });
            });

            
            let newCount = 0;
            let updateCount = 0;
            let unchangedCount = 0;

            for (const story of stories) {
                const result = await Story.create(story);
                
                if (result && result.affectedRows > 0 && !result.changedRows) {
                    if (broadcastCallback) {
                        broadcastCallback(story);
                    }
                    newCount++;
                } 
                else if (result && result.changedRows > 0) {
                    updateCount++;
                } 
                else {
                    unchangedCount++;
                }
            }

            const recentCount = await Story.getRecentStoriesCount();
            console.log('\nScraping Summary:');
            console.log(`- New stories added: ${newCount}`);
            console.log(`- Stories updated: ${updateCount}`);
            console.log(`- Stories unchanged: ${unchangedCount}`);
            console.log(`- Total stories in last 5 minutes: ${recentCount}`);
            console.log('=== Scraping completed ===\n');
            
        } catch (error) {
            console.error('\n❌ Error scraping stories:', error.message);
            throw error;
        }
    }

    async getAllStories(limit = 10, offset = 0) {
        try {
            const [stories, total] = await Story.getAll(limit, offset);
            return [stories, total];
        } catch (error) {
            console.error('Error fetching stories:', error);
            throw error;
        }
    }
}

module.exports = Scraper; 