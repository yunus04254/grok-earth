// Custom server with WebSocket proxy for xAI Voice Agent API
require('dotenv').config({ path: '.env' });

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer, WebSocket } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const XAI_API_KEY = process.env.X_AI_API_KEY;
console.log('API Key loaded:', XAI_API_KEY ? 'Yes' : 'No');
const XAI_REALTIME_URL = 'wss://api.x.ai/v1/realtime';

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // WebSocket server for voice proxy
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url);
    
    if (pathname === '/api/voice-ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (clientWs) => {
    console.log('=== Client connected to voice proxy ===');
    
    let xaiWs = null;
    let messageBuffer = [];
    let isXaiConnected = false;
    let connectionTimeout = null;

    // Connect to xAI with Authorization header
    const connectToXai = () => {
      console.log('Connecting to xAI Voice API...');
      console.log('API Key prefix:', XAI_API_KEY?.substring(0, 10) + '...');
      
      try {
        // Set a connection timeout
        connectionTimeout = setTimeout(() => {
          if (!isXaiConnected) {
            console.error('✗ Connection timeout - xAI took too long to respond');
            if (xaiWs) xaiWs.terminate();
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ 
                type: 'error', 
                error: { message: 'Connection timeout to xAI' } 
              }));
            }
          }
        }, 10000); // 10 second timeout

        xaiWs = new WebSocket(XAI_REALTIME_URL, {
          headers: {
            'Authorization': `Bearer ${XAI_API_KEY}`,
          },
          handshakeTimeout: 10000,
        });

        console.log('WebSocket created, waiting for open event...');

        xaiWs.on('open', () => {
          clearTimeout(connectionTimeout);
          console.log('✓ Connected to xAI Voice API');
          isXaiConnected = true;
          
          // Notify client we're connected
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'proxy.connected' }));
          }
          
          // Send buffered messages
          if (messageBuffer.length > 0) {
            console.log(`Sending ${messageBuffer.length} buffered messages`);
            messageBuffer.forEach(msg => {
              try {
                xaiWs.send(msg);
              } catch (e) {
                console.error('Error sending buffered message:', e.message);
              }
            });
            messageBuffer = [];
          }
        });

        xaiWs.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            
            // Log important events
            if (!['response.output_audio.delta', 'response.output_audio_transcript.delta'].includes(message.type)) {
              console.log('xAI -> Client:', message.type);
              // Log error details
              if (message.type === 'error') {
                console.error('  Error details:', JSON.stringify(message.error || message, null, 2));
              }
            }
            
            // Handle ping/pong
            if (message.type === 'ping') {
              xaiWs.send(JSON.stringify({ type: 'pong' }));
              return;
            }
            
            // Forward to client
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(data.toString());
            }
          } catch (e) {
            // Forward raw data if not JSON
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(data);
            }
          }
        });

        xaiWs.on('error', (error) => {
          clearTimeout(connectionTimeout);
          console.error('✗ xAI WebSocket error:', error.message);
          console.error('  Full error:', error);
          isXaiConnected = false;
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ 
              type: 'error', 
              error: { message: `xAI connection error: ${error.message}` } 
            }));
          }
        });

        xaiWs.on('close', (code, reason) => {
          clearTimeout(connectionTimeout);
          console.log('xAI connection closed:', code, reason?.toString());
          isXaiConnected = false;
          
          // Notify client
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ 
              type: 'proxy.disconnected',
              code,
              reason: reason?.toString()
            }));
          }
        });

        xaiWs.on('unexpected-response', (req, res) => {
          console.error('✗ Unexpected response from xAI:', res.statusCode, res.statusMessage);
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            console.error('  Response body:', body);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ 
                type: 'error', 
                error: { message: `xAI rejected connection: ${res.statusCode} ${res.statusMessage}` } 
              }));
            }
          });
        });

      } catch (e) {
        console.error('✗ Failed to create xAI WebSocket:', e.message);
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ 
            type: 'error', 
            error: { message: `Failed to connect: ${e.message}` } 
          }));
        }
      }
    };

    // Connect to xAI immediately
    if (XAI_API_KEY) {
      connectToXai();
    } else {
      console.error('X_AI_API_KEY not set');
      clientWs.send(JSON.stringify({ 
        type: 'error', 
        error: { message: 'API key not configured' } 
      }));
    }

    // Handle messages from client
    clientWs.on('message', (data) => {
      const message = data.toString();
      
      try {
        const parsed = JSON.parse(message);
        console.log('Client -> xAI:', parsed.type);
      } catch {
        console.log('Client -> xAI: [binary data]');
      }

      if (isXaiConnected && xaiWs?.readyState === WebSocket.OPEN) {
        xaiWs.send(message);
      } else {
        console.log('Buffering message (xAI not connected yet)');
        messageBuffer.push(message);
      }
    });

    clientWs.on('close', () => {
      console.log('Client disconnected');
      if (xaiWs) {
        xaiWs.close();
      }
    });

    clientWs.on('error', (error) => {
      console.error('Client WebSocket error:', error.message);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Voice WebSocket proxy at ws://${hostname}:${port}/api/voice-ws`);
  });
});
