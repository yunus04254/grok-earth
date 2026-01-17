'use client';

import { useEffect, useRef, useState } from 'react';

export default function Page() {
  const [status, setStatus] = useState('Initializing...');
  const audioContextRef = useRef<AudioContext | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const nextPlayTimeRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const initVoiceAgent = async () => {
      try {
        // Initialize Audio Context
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        nextPlayTimeRef.current = audioContextRef.current.currentTime;

        // Connect to our WebSocket proxy (which connects to xAI API)
        setStatus('Connecting to Grok...');
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${wsProtocol}//${window.location.host}/api/voice-ws`);
        wsRef.current = ws;

        ws.onopen = async () => {
          if (!mounted) return;
          setStatus('Connected! Setting up Eve voice...');
          
          // Resume AudioContext (required by some browsers)
          if (audioContextRef.current?.state === 'suspended') {
            await audioContextRef.current.resume();
          }

          // Small delay to ensure connection is fully established
          await new Promise(resolve => setTimeout(resolve, 100));

          // Configure session with Eve voice
          ws.send(JSON.stringify({
            type: 'session.update',
            session: {
              voice: 'Eve',
              instructions: 'You are a helpful assistant. Keep responses brief and friendly.',
              turn_detection: { type: 'server_vad' },
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              }
            }
          }));

          // Send a simple greeting message
          ws.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'user',
              content: [{ 
                type: 'input_text', 
                text: 'Say hello and introduce yourself briefly in an energetic way!' 
              }]
            }
          }));

          // Request audio response
          ws.send(JSON.stringify({
            type: 'response.create',
            response: { modalities: ['text', 'audio'] }
          }));
        };

        ws.onmessage = async (event) => {
          if (!mounted) return;
          const data = JSON.parse(event.data);
          
          console.log('Received event:', data.type, data);

          if (data.type === 'session.updated') {
            setStatus('Eve is ready to speak!');
          } else if (data.type === 'response.output_audio_transcript.delta') {
            console.log('Eve says:', data.delta);
          } else if (data.type === 'response.output_audio.delta') {
            // Decode and play audio chunk
            if (audioContextRef.current && data.delta) {
              try {
                const audioBytes = Uint8Array.from(atob(data.delta), c => c.charCodeAt(0));
                const audioData = new Int16Array(audioBytes.buffer);
                const floatData = new Float32Array(audioData.length);
                
                for (let i = 0; i < audioData.length; i++) {
                  floatData[i] = audioData[i] / 32768.0;
                }

                const audioBuffer = audioContextRef.current.createBuffer(
                  1,
                  floatData.length,
                  24000
                );
                audioBuffer.getChannelData(0).set(floatData);

                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);

                const playTime = Math.max(
                  nextPlayTimeRef.current,
                  audioContextRef.current.currentTime
                );
                source.start(playTime);
                nextPlayTimeRef.current = playTime + audioBuffer.duration;

                setStatus('Playing audio...');
              } catch (err) {
                console.error('Audio playback error:', err);
              }
            }
          } else if (data.type === 'response.done') {
            setStatus('Complete! Eve has spoken.');
            console.log('Response done:', data);
            ws.close();
          } else if (data.type === 'error') {
            setStatus(`Error: ${data.error?.message || 'Unknown error'}`);
            console.error('API Error:', data.error);
          } else {
            // Log all other event types
            console.log('Other event type:', data.type);
          }
        };

        ws.onerror = (error) => {
          if (!mounted) return;
          console.error('WebSocket error:', error);
          setStatus('Connection error - check API key');
        };

        ws.onclose = () => {
          if (!mounted) return;
          console.log('WebSocket closed');
        };

      } catch (error) {
        console.error('Init error:', error);
        setStatus('Failed to initialize');
      }
    };

    initVoiceAgent();

    return () => {
      mounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Grok Voice Agent
        </h1>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-4 h-4 bg-pink-500 rounded-full animate-pulse" />
          <span className="text-lg font-semibold text-gray-700">Eve Voice</span>
        </div>
        <p className="text-gray-600 mb-6">{status}</p>
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            🎤 Audio will start playing automatically when Eve responds
          </p>
        </div>
      </div>
    </div>
  );
}
