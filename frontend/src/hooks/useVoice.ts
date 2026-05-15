// ── Cypher Trading Non-Custodial ──
// useVoice Hook
// Manages voice recording, STT, TTS, and intent processing

import { useState, useCallback, useEffect, useRef } from 'react';

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  error: string | null;
}

const VOICE_WS_URL = `ws://localhost:${import.meta.env.VITE_VOICE_WS_PORT || 8181}`;

export function useVoice() {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    response: '',
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize WebSocket connection to voice backend
  useEffect(() => {
    const ws = new WebSocket(VOICE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => console.log('[Voice] WebSocket connected');
    ws.onclose = () => console.log('[Voice] WebSocket disconnected');
    ws.onerror = (err) => console.error('[Voice] WebSocket error', err);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'stt_result') {
        setState((prev) => ({ ...prev, transcript: data.text }));
      } else if (data.type === 'intent_result') {
        setState((prev) => ({
          ...prev,
          response: data.response,
          isSpeaking: true,
        }));
        // Auto-stop speaking after response
        setTimeout(() => {
          setState((prev) => ({ ...prev, isSpeaking: false }));
        }, 3000);
      } else if (data.type === 'tts_audio') {
        // Play TTS audio
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.play().catch(console.error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // Browser Speech Recognition (fallback when WebSocket is not available)
  const startBrowserRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[Voice] Browser speech recognition not available');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setState((prev) => ({ ...prev, transcript: text }));

      // Send to backend for intent processing
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'voice_input', text }));
      }
    };

    recognition.onerror = (event: any) => {
      console.error('[Voice] Recognition error:', event.error);
      setState((prev) => ({ ...prev, error: event.error }));
    };

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false }));
    };

    recognition.start();
  }, []);

  const startListening = useCallback(() => {
    setState((prev) => ({ ...prev, isListening: true, transcript: '', response: '', error: null }));

    // Try browser recognition first, WebSocket STT as fallback
    startBrowserRecognition();

    // Also notify Electron main process (if available)
    window.cypher?.voice.startListening();
  }, [startBrowserRecognition]);

  const stopListening = useCallback(() => {
    setState((prev) => ({ ...prev, isListening: false }));
    recognitionRef.current?.stop();
    window.cypher?.voice.stopListening();
  }, []);

  // Wake word detection simulation
  useEffect(() => {
    // In production: OVOS wake word plugin handles "Hey Cypher" detection
    // This is a placeholder for UI demo
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        // Ctrl+M = toggle mic
        if (state.isListening) {
          stopListening();
        } else {
          startListening();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.isListening, startListening, stopListening]);

  return {
    isListening: state.isListening,
    isSpeaking: state.isSpeaking,
    transcript: state.transcript,
    response: state.response,
    error: state.error,
    startListening,
    stopListening,
  };
}
