'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Radio, Loader2, X } from 'lucide-react';
import { GECard } from '@/components/GECard';

interface VoiceAgentProps {
  onClose: () => void;
}

export default function VoiceAgent({ onClose }: VoiceAgentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('Click Start to begin');
  const [isReceivingAudio, setIsReceivingAudio] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  // Connect to xAI Voice Agent via WebSocket proxy
  const connect = async () => {
    try {
      setStatus('Connecting to Grok...');
      
      // Connect to local WebSocket proxy that handles xAI authentication
      // The proxy in server.js authenticates with xAI using the API key
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/voice-ws`;
      
      console.log('Connecting to WebSocket proxy:', wsUrl);
      
      const ws = new WebSocket(wsUrl);

      // Configure session after connection
      ws.onopen = () => {
        console.log('WebSocket opened successfully!');
        
        // Send session configuration
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            model: 'grok-2-1212',
            voice: 'Ara', // Warm, friendly female voice
            instructions: `You are a knowledgeable radio host discussing current events, history, and interesting facts about cities around the world. 
Be engaging, informative, and conversational. If the user asks about a specific place, provide interesting insights and historical context.`,
            turn_detection: {
              type: 'server_vad', // Server-side voice activity detection
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200
            },
            input_audio_transcription: {
              model: 'whisper-1'
            }
          }
        }));

        setIsConnected(true);
        setStatus('Connected! Grok is greeting you...');
        
        // Send an initial message to trigger Grok's greeting
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            console.log('Sending initial prompt to start the radio show...');
            // Create a user message to trigger the greeting
            ws.send(JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'message',
                role: 'user',
                content: [
                  {
                    type: 'input_text',
                    text: 'Hello! Start the show with your warm greeting.'
                  }
                ]
              }
            }));
            
            // Request Grok to respond
            ws.send(JSON.stringify({
              type: 'response.create',
            }));
          }
        }, 500);
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        console.log('WS Message:', message.type, message);

        switch (message.type) {
          case 'session.created':
          case 'session.updated':
            console.log('Session ready:', message);
            break;

          case 'conversation.item.input_audio_transcription.completed':
            // User's speech transcribed
            setTranscript(prev => [...prev, `You: ${message.transcript}`]);
            break;

          case 'response.output_audio_transcript.delta':
            // Assistant's speech transcript
            const lastTranscript = transcript[transcript.length - 1];
            if (lastTranscript?.startsWith('Grok:')) {
              setTranscript(prev => {
                const newTranscripts = [...prev];
                newTranscripts[newTranscripts.length - 1] += message.delta;
                return newTranscripts;
              });
            } else {
              setTranscript(prev => [...prev, `Grok: ${message.delta}`]);
            }
            break;

          case 'response.output_audio.delta':
            // Received audio chunk - decode and play
            if (message.delta) {
              console.log('Received audio chunk, length:', message.delta.length);
              setStatus('Grok is speaking...');
              setIsReceivingAudio(true);
              await playAudioChunk(message.delta);
            }
            break;
          
          case 'response.output_audio.done':
            console.log('Audio output completed');
            setIsReceivingAudio(false);
            setStatus('Ready');
            break;

          case 'input_audio_buffer.speech_started':
            setStatus('Listening...');
            break;

          case 'input_audio_buffer.speech_stopped':
            setStatus('Processing...');
            break;

          case 'response.done':
            setStatus('Ready');
            break;

          case 'error':
            console.error('Error:', message.error);
            setStatus(`Error: ${message.error.message}`);
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('Connection error');
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setStatus(`Disconnected: ${event.reason || event.code}`);
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Connection error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Start capturing audio from microphone
  const startListening = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 24000,
        } 
      });
      mediaStreamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert float32 to int16 PCM
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Convert to base64
        const base64 = arrayBufferToBase64(pcm16.buffer);

        // Send to WebSocket
        wsRef.current.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: base64
        }));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsListening(true);
      setStatus('Microphone active - speak anytime!');
    } catch (error) {
      console.error('Microphone error:', error);
      
      // Check if it's a permission error
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setStatus('Microphone permission denied - you can still listen!');
          alert('Microphone access was denied. You can still listen to Grok Radio, but you won\'t be able to speak. To enable your microphone, allow access in your browser settings.');
        } else if (error.name === 'NotFoundError') {
          setStatus('No microphone found - you can still listen!');
          alert('No microphone found. You can still listen to Grok Radio!');
        } else {
          setStatus('Microphone error - you can still listen!');
        }
      } else {
        setStatus('Microphone error - you can still listen!');
      }
    }
  };

  // Stop capturing audio
  const stopListening = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsListening(false);
  };

  // Play audio chunk received from Grok
  const playAudioChunk = async (base64Audio: string) => {
    try {
      console.log('Playing audio chunk...');
      
      if (!audioContextRef.current) {
        console.log('Creating new AudioContext for playback');
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      const audioContext = audioContextRef.current;
      console.log('AudioContext state:', audioContext.state);
      
      // Resume audio context if it's suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        console.log('Resuming suspended AudioContext');
        await audioContext.resume();
      }
      
      // Decode base64 to array buffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log('Decoded audio bytes:', bytes.length);

      // Convert PCM16 to Float32 for Web Audio API
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7FFF);
      }

      console.log('Converted to float32, samples:', float32.length);
      audioQueueRef.current.push(float32);
      console.log('Queue length:', audioQueueRef.current.length);

      if (!isPlayingRef.current) {
        console.log('Starting playback...');
        playNextChunk();
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const playNextChunk = async () => {
    if (audioQueueRef.current.length === 0) {
      console.log('Audio queue empty, stopping playback');
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift()!;
    const audioContext = audioContextRef.current!;

    console.log('Playing chunk, samples:', chunk.length, 'duration:', chunk.length / 24000, 's');

    const audioBuffer = audioContext.createBuffer(1, chunk.length, 24000);
    audioBuffer.getChannelData(0).set(chunk);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.onended = () => {
      console.log('Chunk ended, playing next...');
      playNextChunk();
    };
    source.start();
    console.log('Audio source started');
  };

  // Helper to convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Monitor audio context state
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioContextRef.current) {
        console.log('AudioContext state check:', audioContextRef.current.state);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl">
        <GECard
          icon={<Radio className="h-6 w-6" />}
          title="Grok Voice Agent"
          onClose={onClose}
        >
          <div className="space-y-6">
            {/* Status */}
            <div className="text-center space-y-2">
              <p className="text-sm text-[#9ca3af] mb-2">{status}</p>
              <div className="flex items-center justify-center gap-4">
                {isConnected && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-500">Connected</span>
                  </div>
                )}
                {isReceivingAudio && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs text-blue-500">Audio Playing</span>
                  </div>
                )}
              </div>
              {isConnected && audioContextRef.current?.state === 'suspended' && (
                <button
                  onClick={async () => {
                    console.log('Manually resuming AudioContext');
                    await audioContextRef.current?.resume();
                    console.log('AudioContext state:', audioContextRef.current?.state);
                  }}
                  className="mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
                >
                  🔊 Click to enable audio
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-4">
              {!isConnected ? (
                <>
                  <button
                    onClick={connect}
                    className="px-6 py-3 bg-[#60a5fa] hover:bg-[#3b82f6] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Radio className="w-5 h-5" />
                    Start Radio
                  </button>
                  <p className="text-xs text-[#9ca3af] text-center">
                    Grok will greet you automatically. Enable mic to respond.
                  </p>
                </>
              ) : (
                <>
                  {!isListening ? (
                    <button
                      onClick={startListening}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                      title="Click to enable your microphone and speak back to Grok"
                    >
                      <Mic className="w-5 h-5" />
                      Enable Mic (Optional)
                    </button>
                  ) : (
                    <button
                      onClick={stopListening}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <MicOff className="w-5 h-5" />
                      Mute
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Transcript */}
            {transcript.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2 border-t border-[#2a2f3a]/40 pt-4">
                {transcript.map((text, index) => (
                  <div
                    key={index}
                    className={`text-sm ${
                      text.startsWith('You:') ? 'text-[#60a5fa]' : 'text-[#34d399]'
                    }`}
                  >
                    {text}
                  </div>
                ))}
              </div>
            )}

            {/* Instructions */}
            <div className="text-xs text-[#6b7280] text-center space-y-1">
              <p>• Click "Start Radio" to connect to Grok</p>
              <p>• Enable your microphone to speak with the AI</p>
              <p>• Grok will respond with voice in real-time</p>
            </div>
          </div>
        </GECard>
      </div>
    </div>
  );
}
