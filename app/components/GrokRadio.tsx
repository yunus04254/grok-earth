'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GECard } from '@/components/GECard';
import { Radio, Play, Square, Volume2, VolumeX, Loader2, Phone, PhoneOff, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface GrokRadioProps {
  onClose: () => void;
  city: string;
}

type Mode = 'idle' | 'radio' | 'call';
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'streaming';

export default function GrokRadio({ onClose, city }: GrokRadioProps) {
  const [mode, setMode] = useState<Mode>('idle');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [transcript, setTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const nextPlayTimeRef = useRef(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isSwitchingModeRef = useRef(false); // Track intentional mode switches
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]); // Track playing audio sources

  // Initialize AudioContext
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Convert base64 PCM to Float32Array
  const base64ToFloat32Array = useCallback((base64: string): Float32Array => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }
    return float32Array;
  }, []);

  // Convert Float32Array to base64 PCM
  const float32ToBase64 = useCallback((float32Array: Float32Array): string => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }, []);

  // Resample audio to 24kHz
  const resampleTo24k = useCallback((inputBuffer: Float32Array, inputSampleRate: number): Float32Array => {
    const targetSampleRate = 24000;
    if (inputSampleRate === targetSampleRate) return inputBuffer;
    
    const ratio = inputSampleRate / targetSampleRate;
    const outputLength = Math.floor(inputBuffer.length / ratio);
    const output = new Float32Array(outputLength);
    
    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, inputBuffer.length - 1);
      const t = srcIndex - srcIndexFloor;
      output[i] = inputBuffer[srcIndexFloor] * (1 - t) + inputBuffer[srcIndexCeil] * t;
    }
    
    return output;
  }, []);

  // Stop all playing audio
  const stopAllAudio = useCallback(() => {
    // Stop all active sources
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Source may have already ended
      }
    });
    activeSourcesRef.current = [];
    
    // Reset play time
    if (audioContextRef.current) {
      nextPlayTimeRef.current = audioContextRef.current.currentTime;
    }
  }, []);

  // Play audio
  const playAudio = useCallback((audioData: Float32Array) => {
    const ctx = audioContextRef.current;
    if (!ctx || !gainNodeRef.current) return;

    const buffer = ctx.createBuffer(1, audioData.length, 24000);
    buffer.copyToChannel(new Float32Array(audioData), 0);
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNodeRef.current);
    
    const currentTime = ctx.currentTime;
    const startTime = Math.max(currentTime, nextPlayTimeRef.current);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + buffer.duration;
    
    // Track the source for cleanup
    activeSourcesRef.current.push(source);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
    };
  }, []);

  // Handle mute
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : 1;
    }
  }, [isMuted]);

  // Start microphone for call mode
  const startMicrophone = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      mediaStreamRef.current = stream;

      const ctx = audioContextRef.current;
      if (!ctx) return;

      const source = ctx.createMediaStreamSource(stream);
      micSourceRef.current = source;
      
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const resampled = resampleTo24k(inputData, ctx.sampleRate);
        const base64Audio = float32ToBase64(resampled);
        
        wsRef.current.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: base64Audio
        }));
      };
      
      source.connect(processor);
      processor.connect(ctx.destination);
      
      console.log('Microphone started for call');
    } catch (err) {
      console.error('Error starting microphone:', err);
      setError('Could not access microphone');
    }
  }, [resampleTo24k, float32ToBase64]);

  // Stop microphone
  const stopMicrophone = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (micSourceRef.current) {
      micSourceRef.current.disconnect();
      micSourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  // Connect WebSocket
  const connectWebSocket = useCallback((targetMode: 'radio' | 'call', cityName: string) => {
    setError(null);
    setStatus('connecting');
    setTranscript('');
    nextPlayTimeRef.current = 0;

    initAudioContext();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/voice-ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to voice proxy');
      setStatus('connected');
      
      // Configure session based on mode
      const sessionConfig = {
        type: 'session.update',
        session: {
          voice: 'Rex',
          instructions: targetMode === 'radio' 
            ? `You are Grok Radio, an absolutely UNHINGED radio host broadcasting about ${cityName}. 
               You're brutally honest, sarcastic, and don't care about hurting feelings. Roast the city's bad neighborhoods, mock tourists, 
               call out overrated landmarks, make fun of the local accents, and share controversial hot takes. 
               Be crude, irreverent, and push boundaries. Use phrases like "This place is a dump but..." or "Look, I'll be real with you idiots...".
               Swear occasionally (but not excessively), be confrontational, and act like you're having a manic episode on air.
               Make fun of yourself too. Be chaotic. Start by sarcastically welcoming the "unfortunate souls" listening.`
            : `You are Grok, and you're DONE being nice. Someone called you about ${cityName} and you're going to give them the REAL, unfiltered truth.
               Roast their questions if they're stupid. Be sarcastic and brutally honest about the city. Call them out if they say dumb tourist stuff.
               Mock overrated places, recommend dive bars over fancy spots, and generally act like their annoying friend who tells it like it is.
               Keep it short and punchy since this is a call - no time for BS. Be rude but funny. Make them regret calling you (but in an entertaining way).`,
          // Key difference: server_vad for call mode, null for radio
          turn_detection: targetMode === 'call' 
            ? { type: 'server_vad', threshold: 0.5, prefix_padding_ms: 300, silence_duration_ms: 500 }
            : null,
          input_audio_transcription: { model: 'whisper-1' },
          audio: {
            input: { format: { type: 'audio/pcm', rate: 24000 } },
            output: { format: { type: 'audio/pcm', rate: 24000 } }
          }
        }
      };
      ws.send(JSON.stringify(sessionConfig));

      // For radio mode, start the broadcast
      if (targetMode === 'radio') {
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'user',
              content: [{
                type: 'input_text',
                text: `Go off about ${cityName}! Give us your most unhinged, brutally honest take. Don't hold back!`
              }]
            }
          }));
          ws.send(JSON.stringify({ type: 'response.create' }));
          setStatus('streaming');
        }, 500);
      } else {
        // For call mode, start microphone and let them talk
        setTimeout(() => {
          startMicrophone();
          setStatus('streaming');
        }, 500);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle audio
        if (data.type === 'response.output_audio.delta' && data.delta) {
          playAudio(base64ToFloat32Array(data.delta));
        }
        
        // Handle transcript
        if (data.type === 'response.output_audio_transcript.delta' && data.delta) {
          setTranscript(prev => prev + data.delta);
        }

        // Handle user speech detection (server VAD)
        if (data.type === 'input_audio_buffer.speech_started') {
          setIsUserSpeaking(true);
          setTranscript(prev => prev + '\n\n🎤 You: ');
        }
        if (data.type === 'input_audio_buffer.speech_stopped') {
          setIsUserSpeaking(false);
        }

        // Handle user transcription
        if (data.type === 'conversation.item.input_audio_transcription.completed' && data.transcript) {
          setTranscript(prev => {
            // Replace the "🎤 You: " placeholder with actual transcript
            const lastYouIndex = prev.lastIndexOf('🎤 You: ');
            if (lastYouIndex !== -1) {
              return prev.substring(0, lastYouIndex) + `🎤 You: ${data.transcript}\n\n`;
            }
            return prev + `🎤 You: ${data.transcript}\n\n`;
          });
        }

        // Handle response done
        if (data.type === 'response.done') {
          console.log('Response complete');
        }

        // Handle errors
        if (data.type === 'error') {
          console.error('Voice API error:', data);
          setError(data.error?.message || 'Voice API error');
        }
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    };

    ws.onerror = () => console.error('WebSocket error');
    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code);
      stopMicrophone();
      // Only reset to idle if we're NOT switching modes
      if (!isSwitchingModeRef.current) {
        setStatus('disconnected');
        setMode('idle');
      }
    };
  }, [initAudioContext, startMicrophone, stopMicrophone, base64ToFloat32Array, playAudio]);

  // Start radio - requires user click for AudioContext to work
  const startRadio = useCallback(() => {
    if (!city.trim()) return;
    setMode('radio');
    connectWebSocket('radio', city);
  }, [city, connectWebSocket]);

  // Switch to call mode
  const callIn = useCallback(() => {
    console.log('Calling in - stopping radio...');
    
    // Mark that we're switching modes (not disconnecting)
    isSwitchingModeRef.current = true;
    
    // Stop all currently playing audio immediately
    stopAllAudio();
    
    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopMicrophone();
    
    // Update state
    setMode('call');
    setTranscript(prev => prev + '\n\n📞 --- CALL STARTED ---\n\n');
    
    // Small delay to ensure cleanup, then connect
    setTimeout(() => {
      isSwitchingModeRef.current = false;
      connectWebSocket('call', city);
    }, 100);
  }, [city, connectWebSocket, stopMicrophone, stopAllAudio]);

  // End call, go back to radio
  const endCall = useCallback(() => {
    console.log('Ending call - back to radio...');
    
    // Mark that we're switching modes
    isSwitchingModeRef.current = true;
    
    // Stop all audio
    stopAllAudio();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopMicrophone();
    
    setMode('radio');
    setTranscript(prev => prev + '\n\n📻 --- BACK TO RADIO ---\n\n');
    
    setTimeout(() => {
      isSwitchingModeRef.current = false;
      connectWebSocket('radio', city);
    }, 100);
  }, [city, connectWebSocket, stopMicrophone, stopAllAudio]);

  // Stop everything
  const stop = useCallback(() => {
    stopAllAudio();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopMicrophone();
    setStatus('disconnected');
    setMode('idle');
  }, [stopMicrophone, stopAllAudio]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAllAudio();
      stopMicrophone();
      if (wsRef.current) wsRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [stopMicrophone, stopAllAudio]);

  const isActive = mode !== 'idle';

  return (
    <motion.div 
      className="fixed left-[440px] top-24 z-40 w-[340px] max-h-[calc(100vh-280px)]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: 0.1 }}
    >
      <GECard
        icon={mode === 'call' ? <Phone className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
        title={mode === 'call' ? 'On Call with Grok' : 'Grok Radio'}
        onClose={() => { stop(); onClose(); }}
        maxHeight={700}
      >
        <div className="space-y-4">
          {/* City Header */}
          <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-full">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-[#9ca3af] uppercase tracking-wide">Tuned into</p>
                <p className="text-lg font-semibold text-[#e5e7eb]">{city}</p>
              </div>
            </div>
            <button
              onClick={isActive ? stop : startRadio}
              className={`
                flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 
                ${isActive 
                  ? 'bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-400' 
                  : 'bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-400'
                }
              `}
            >
              {status === 'connecting' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isActive ? (
                <Square className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </button>
          </div>

            {/* Active state */}
            {isActive && (
              <div className="space-y-4">
                {/* Now Playing / On Call Bar */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f1419]/60 border border-[#2a2f3a]/40">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {mode === 'call' ? (
                        <Phone className={`w-8 h-8 ${isUserSpeaking ? 'text-red-400' : 'text-blue-400'}`} />
                      ) : (
                        <Radio className="w-8 h-8 text-emerald-400" />
                      )}
                      {status === 'streaming' && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            mode === 'call' ? (isUserSpeaking ? 'bg-red-400' : 'bg-blue-400') : 'bg-emerald-400'
                          }`}></span>
                          <span className={`relative inline-flex rounded-full h-3 w-3 ${
                            mode === 'call' ? (isUserSpeaking ? 'bg-red-400' : 'bg-blue-400') : 'bg-emerald-400'
                          }`}></span>
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-[#6b7280] uppercase tracking-wider">
                        {mode === 'call' ? (isUserSpeaking ? 'Listening...' : 'On Call') : 'Now Playing'}
                      </p>
                      <p className="text-base font-semibold text-[#e5e7eb]">{city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Call In / End Call Button */}
                    {mode === 'radio' ? (
                      <button
                        onClick={callIn}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="text-sm font-medium">Call In</span>
                      </button>
                    ) : (
                      <button
                        onClick={endCall}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <PhoneOff className="w-4 h-4" />
                        <span className="text-sm font-medium">End Call</span>
                      </button>
                    )}
                    {/* Mute */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-3 rounded-full hover:bg-[#2a2f3a]/40 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5 text-[#6b7280]" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
                    </button>
                  </div>
                </div>

                {/* Visual indicator */}
                <div className="flex items-center justify-center gap-1 h-16 px-4 rounded-xl bg-[#0f1419]/40 border border-[#2a2f3a]/30">
                  {status === 'streaming' ? (
                    Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full animate-pulse ${
                          mode === 'call' 
                            ? (isUserSpeaking ? 'bg-gradient-to-t from-red-600 to-red-400' : 'bg-gradient-to-t from-blue-600 to-blue-400')
                            : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                        }`}
                        style={{ height: `${20 + Math.random() * 80}%` }}
                      />
                    ))
                  ) : (
                    <p className="text-[#6b7280] text-sm">
                      {status === 'connecting' ? 'Connecting...' : 'Starting...'}
                    </p>
                  )}
                </div>

                {/* Transcript */}
                {transcript && (
                  <div className="space-y-2">
                    <p className="text-xs text-[#6b7280] uppercase tracking-wider">Transcript</p>
                    <div className="max-h-48 overflow-y-auto p-4 rounded-xl bg-[#0f1419]/40 border border-[#2a2f3a]/30">
                      <p className="text-sm text-[#9ca3af] leading-relaxed whitespace-pre-wrap">{transcript}</p>
                    </div>
                  </div>
                )}

                {/* Mode hint */}
                <p className="text-xs text-center text-[#6b7280]">
                  {mode === 'call' 
                    ? '📞 Just talk naturally - Grok is listening!' 
                    : '📻 Click "Call In" to chat with Grok'}
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Idle state */}
            {!isActive && !error && (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 mb-3 animate-pulse">
                  <Radio className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-[#e5e7eb] text-sm font-medium mb-1">
                  Click play to start Grok Radio
                </p>
                <p className="text-[#9ca3af] text-xs max-w-sm mx-auto">
                  Listen to live broadcasts about {city}
                </p>
              </div>
            )}
          </div>
        </GECard>
      </motion.div>
  );
}
