// ── Cypher Trading Non-Custodial ──
// Voice Service
// WebSocket client for STT, intent recognition, TTS

const WS_URL = `ws://localhost:${import.meta.env.VITE_VOICE_WS_PORT || 8181}`;

type VoiceCallback = (data: any) => void;

class VoiceService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, VoiceCallback[]> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('[VoiceService] Connected');
      this.emit('connected', {});
    };

    this.ws.onclose = () => {
      console.log('[VoiceService] Disconnected, reconnecting in 3s...');
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      this.emit('disconnected', {});
    };

    this.ws.onerror = (err) => {
      console.error('[VoiceService] Error:', err);
      this.emit('error', { error: err });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data);
      } catch {
        console.warn('[VoiceService] Invalid message:', event.data);
      }
    };
  }

  send(type: string, payload: Record<string, unknown> = {}): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...payload }));
    }
  }

  sendVoiceInput(text: string): void {
    this.send('voice_input', { text });
  }

  on(event: string, callback: VoiceCallback): void {
    const existing = this.listeners.get(event) || [];
    existing.push(callback);
    this.listeners.set(event, existing);
  }

  off(event: string, callback: VoiceCallback): void {
    const existing = this.listeners.get(event) || [];
    this.listeners.set(
      event,
      existing.filter((cb) => cb !== callback)
    );
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => cb(data));
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }
}

export const voiceService = new VoiceService();
