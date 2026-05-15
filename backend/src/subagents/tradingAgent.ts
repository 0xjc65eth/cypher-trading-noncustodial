// ── Cypher Trading Non-Custodial ──
// Subagent: Trading Agent
// Handles trade execution, quotes, swap orchestration

import type { SubagentMessage } from '../../shared/types.js';
import { tradingEngine } from '../services/tradingEngine.js';

export class TradingAgent {
  private manager: any;

  constructor(manager: any) {
    this.manager = manager;
    console.log('[TradingAgent] Initialized');
  }

  handleMessage(message: SubagentMessage): void {
    console.log(`[TradingAgent] Received: ${message.type} from ${message.from}`);

    switch (message.type) {
      case 'voice_quote':
        this.handleQuoteRequest(message.payload);
        break;
      case 'voice_swap':
        this.handleSwapRequest(message.payload);
        break;
      case 'voice_perps':
        this.handlePerpsRequest(message.payload);
        break;
      case 'voice_balance':
        this.handleBalanceRequest(message.payload);
        break;
      case 'voice_history':
        this.handleHistoryRequest(message.payload);
        break;
      case 'confirm_transaction':
        this.handleTransactionConfirmation(message.payload);
        break;
      default:
        console.log(`[TradingAgent] Unknown message type: ${message.type}`);
    }

    this.manager.updateStatus('trading', 'idle');
  }

  private async handleQuoteRequest(payload: any): Promise<void> {
    console.log('[TradingAgent] Getting quote for:', payload.intent?.rawText);

    // Notify security agent for risk check
    this.manager.handleMessage({
      from: 'trading',
      to: 'security',
      type: 'pre_trade_check',
      payload: { action: 'quote', details: payload },
    });
  }

  private async handleSwapRequest(payload: any): Promise<void> {
    console.log('[TradingAgent] Swap requested:', payload.intent?.rawText);

    // Risk check before any trade
    this.manager.handleMessage({
      from: 'trading',
      to: 'security',
      type: 'pre_trade_check',
      payload: { action: 'swap', details: payload },
    });
  }

  private async handlePerpsRequest(payload: any): Promise<void> {
    console.log('[TradingAgent] Perps position requested:', payload.intent?.rawText);

    // Risk check for leveraged positions
    this.manager.handleMessage({
      from: 'trading',
      to: 'security',
      type: 'pre_trade_check',
      payload: {
        action: 'perps',
        details: payload,
        side: payload.intent?.entities?.side || 'long',
      },
    });
  }

  private async handleBalanceRequest(payload: any): Promise<void> {
    console.log('[TradingAgent] Balance check requested');
    // Balance fetches are read-only, no risk check needed
  }

  private async handleHistoryRequest(payload: any): Promise<void> {
    console.log('[TradingAgent] Trade history requested');
  }

  private handleTransactionConfirmation(payload: any): void {
    console.log('[TradingAgent] Transaction confirmation:', payload.txHash);
  }
}
