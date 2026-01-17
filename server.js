const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // WebSocket proxy server
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url);

    if (pathname === '/api/voice-ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        // Connect to xAI API
        const apiKey = process.env.X_AI_API_KEY;
        const xaiWs = new WebSocket('wss://api.x.ai/v1/realtime', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        // Buffer messages until xAI connection is ready
        const messageBuffer = [];
        let xaiConnected = false;

        // Proxy messages from client to xAI
        ws.on('message', (message) => {
          const data = JSON.parse(message);
          console.log('Client -> xAI:', data.type);
          
          if (xaiConnected && xaiWs.readyState === WebSocket.OPEN) {
            xaiWs.send(message);
          } else {
            // Buffer messages until connection is ready
            messageBuffer.push(message);
            console.log('Buffering message:', data.type);
          }
        });

        // Proxy messages from xAI to client
        xaiWs.on('message', (message) => {
          const data = JSON.parse(message);
          console.log('xAI -> Client:', data.type);
          
          // Handle ping/pong
          if (data.type === 'ping') {
            // Respond with pong
            xaiWs.send(JSON.stringify({ type: 'pong' }));
            console.log('Sent pong response');
          }
          
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        });

        // Handle connections
        xaiWs.on('open', () => {
          console.log('Connected to xAI API');
          xaiConnected = true;
          
          // Send all buffered messages
          console.log('Sending', messageBuffer.length, 'buffered messages');
          while (messageBuffer.length > 0) {
            const bufferedMsg = messageBuffer.shift();
            xaiWs.send(bufferedMsg);
          }
        });

        xaiWs.on('error', (error) => {
          console.error('xAI WebSocket error:', error);
          ws.close();
        });

        xaiWs.on('close', () => {
          console.log('xAI connection closed');
          ws.close();
        });

        ws.on('close', () => {
          console.log('Client connection closed');
          xaiWs.close();
        });

        ws.on('error', (error) => {
          console.error('Client WebSocket error:', error);
          xaiWs.close();
        });
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
