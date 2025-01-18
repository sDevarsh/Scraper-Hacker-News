const db = require('./database');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
        
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.end();

        await db.query(`
            CREATE TABLE IF NOT EXISTS stories (
                id INT PRIMARY KEY,
                title VARCHAR(255),
                url TEXT,
                author VARCHAR(100),
                points INT,
                comments_count INT DEFAULT 0,
                story_type VARCHAR(50),
                domain VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('Database and tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

module.exports = initializeDatabase; 