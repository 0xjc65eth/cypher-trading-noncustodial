// ── Cypher Trading Non-Custodial ──
// Subagent: Voice Agent
// Handles STT/TTS/intent recognition coordination

import type { SubagentMessage, VoiceIntent, VoiceResponse } from '../../shared/types.js';

export class VoiceAgent {
  private manager: any;

  constructor(manager: any) {
    this.manager = manager;
    console.log('[VoiceAgent] Initialized');
  }

  handleMessage(message: SubagentMessage): void {
    console.log(`[VoiceAgent] Received: ${message.type}`);

    switch (message.type) {
      case 'voice_input':
        this.processVoiceInput(message.payload.text);
        break;
      case 'wake_word':
        this.handleWakeWord();
        break;
      case 'stt_result':
        this.handleSTTResult(message.payload.text);
        break;
      default:
        console.log(`[VoiceAgent] Unknown message type: ${message.type}`);
    }

    this.manager.updateStatus('voice', 'idle');
  }

  private processVoiceInput(text: string): void {
    const intent = this.recognizeIntent(text);

    // Route to appropriate agent
    switch (intent.type) {
      case 'quote':
      case 'swap':
      case 'perps':
      case 'history':
        this.manager.handleMessage({
          from: 'voice',
          to: 'trading',
          type: `voice_${intent.type}`,
          payload: { intent, rawText: text },
        });
        break;
      case 'balance':
        this.manager.handleMessage({
          from: 'voice',
          to: 'trading',
          type: 'voice_balance',
          payload: { intent, rawText: text },
        });
        break;
      case 'risk':
        this.manager.handleMessage({
          from: 'voice',
          to: 'security',
          type: 'voice_risk',
          payload: { intent, rawText: text },
        });
        break;
      default:
        console.log('[VoiceAgent] Unknown intent:', intent.type);
    }
  }

  private handleWakeWord(): void {
    console.log('[VoiceAgent] Wake word detected: "Hey Cypher"');
    // Trigger listening mode
  }

  private handleSTTResult(text: string): void {
    console.log(`[VoiceAgent] STT result: "${text}"`);
    this.processVoiceInput(text);
  }

  private recognizeIntent(text: string): VoiceIntent {
    const lower = text.toLowerCase();

    if (lower.match(/swap|exchange|trade .* for/)) {
      return { type: 'swap', confidence: 0.9, entities: {}, rawText: text };
    }
    if (lower.match(/price|quote|rate|how much|cost/)) {
      return { type: 'quote', confidence: 0.85, entities: {}, rawText: text };
    }
    if (lower.match(/long|short|perpetual|leverage|perp/)) {
      const side = lower.match(/long|short/)?.[0] as 'long' | 'short' || 'long';
      return { type: 'perps', confidence: 0.88, entities: { side }, rawText: text };
    }
    if (lower.match(/balance|my portfolio|wallet balance/)) {
      return { type: 'balance', confidence: 0.92, entities: {}, rawText: text };
    }
    if (lower.match(/history|past trades|my trades/)) {
      return { type: 'history', confidence: 0.9, entities: {}, rawText: text };
    }
    if (lower.match(/stop.loss|take.profit|risk|limit/)) {
      return { type: 'risk', confidence: 0.85, entities: {}, rawText: text };
    }

    return { type: 'unknown', confidence: 0.5, entities: {}, rawText: text };
  }
}
