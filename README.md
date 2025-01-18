# Story Scraper & Real-time Updates

A Node.js application that scrapes stories and provides real-time updates through WebSocket connections.

## 🚀 Features

- Story scraping and data collection
- Real-time updates via WebSocket
- RESTful API endpoints for story management
- MySQL database integration 
- Environment-based configuration

Note: The database will be automatically created if it doesn't exist.

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn package manager


## 🔧 Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
```

## 🛠️ Installation

1. Clone the repository: 
2. Install dependencies: npm i
3. Configure environment variables: 
4. Start the server: npm start


The application will automatically create the database and required tables on first run.

## 📡 API Documentation


### REST API Endpoints

### WebSocket API

Connect to WebSocket endpoint to receive real-time story updates:

```
ws://localhost:3000/ws
```

#### Get Stories
Retrieve stories with pagination support.

```
GET /api/stories // Returns first 10 stories
GET /api/stories?page=1&limit=20 // Returns first 20 stories
GET /api/stories?page=2&limit=10 // Returns second page of 10 stories
```


