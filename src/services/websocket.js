const WebSocket = require('ws');
const Story = require('../models/story');

class WebSocketServer {
    constructor() {
        this.wss = null;
        this.clients = new Set();
    }

    initialize(server) {
        this.wss = new WebSocket.Server({ server });
        this.wss.on('connection', this.handleConnection.bind(this));
        
        console.log('WebSocket Server initialized');
    }

    async handleConnection(ws) {
        console.log('New client connected');
        this.clients.add(ws);

        try {
           const recentStories = await Story.getRecentStories();
            ws.send(JSON.stringify({
                type: 'initial',
                stories: recentStories
            }));
        } catch (error) {
            console.error('Error sending recent stories:', error);
        }

        ws.on('close', () => {
            console.log('Client disconnected');
            this.clients.delete(ws);
        });
    }

    broadcastStory(story) {
        const message = JSON.stringify({
            type: 'new_story',
            story: story
        });

        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}

const wsServer = new WebSocketServer();
module.exports = wsServer;