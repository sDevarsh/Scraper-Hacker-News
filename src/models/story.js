const db = require('../config/database');

class Story {
    static parseTimeAgo(timeAgo) {
        try {
            const now = new Date();
            const matches = timeAgo.match(/(\d+)\s*(minute|hour|day|month|year)s?/);
            
            if (!matches) return now;

            const [, amount, unit] = matches;
            const value = parseInt(amount);

            switch (unit) {
                case 'minute':
                    now.setMinutes(now.getMinutes() - value);
                    break;
                case 'hour':
                    now.setHours(now.getHours() - value);
                    break;
                case 'day':
                    now.setDate(now.getDate() - value);
                    break;
                case 'month':
                    now.setMonth(now.getMonth() - value);
                    break;
                case 'year':
                    now.setFullYear(now.getFullYear() - value);
                    break;
                default:
                    return now;
            }
            
            return now;
        } catch (error) {
            console.error('Error parsing time:', error);
            return new Date();
        }
    }

    static async create(story) {
        const createdAt = this.parseTimeAgo(story.time_ago);
        
        const [existing] = await db.query(
            'SELECT id, points, comments_count FROM stories WHERE id = ?',
            [story.id]
        );

        if (existing.length > 0) {
            if (existing[0].points !== story.points || existing[0].comments_count !== story.comments_count) {
                const [result] = await db.query(
                    `UPDATE stories 
                    SET points = ?, 
                        comments_count = ?
                    WHERE id = ?`,
                    [
                        story.points,
                        story.comments_count,
                        story.id
                    ]
                );
                console.log(`Updated story: "${story.title}" - Points: ${existing[0].points} → ${story.points}, Comments: ${existing[0].comments_count} → ${story.comments_count}`);
                return result;
            }
        } else {
            const [result] = await db.query(
                `INSERT INTO stories (
                    id, title, url, author, points, comments_count, 
                    story_type, domain,  created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?,?, ?)`,
                [
                    story.id, 
                    story.title, 
                    story.url, 
                    story.author, 
                    story.points,
                    story.comments_count || 0,
                    story.type || null,
                    story.domain || null,
                    createdAt
                ]
            );
            console.log(`New story added: "${story.title}" by ${story.author} - Points: ${story.points}, Comments: ${story.comments_count}, Created: ${createdAt.toISOString()}`);
            return result;
        }
    }

    static async getRecentStoriesCount() {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM stories WHERE created_at >= NOW() - INTERVAL 5 MINUTE'
        );
        return rows[0].count;
    }

    static async getRecentStories() {
        const [stories] = await db.query(
            `SELECT * FROM stories 
             WHERE created_at >= NOW() - INTERVAL 5 MINUTE
             ORDER BY created_at DESC`,
        );
        return stories;
    }

    static async getAll(limit = 10, offset = 0) {
        const [stories] = await db.query(
            `SELECT * FROM stories 
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [totalRows] = await db.query(
            'SELECT COUNT(*) as total FROM stories'
        );

        return [stories, totalRows[0].total];
    }
}

module.exports = Story; 