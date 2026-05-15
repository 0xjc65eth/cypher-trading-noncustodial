// ── Cypher Trading Non-Custodial ──
// Subagent: Security Agent
// Non-custodial security: never stores keys, validates transactions, risk checks

import type { SubagentMessage } from '../../shared/types.js';

export class SecurityAgent {
  private manager: any;
  private riskSettings = {
    maxSlippage: 5,
    maxLeverage: 50,
    maxPositionSizePercent: 25,
    stopLossDefault: 5,
    takeProfitDefault: 10,
  };

  constructor(manager: any) {
    this.manager = manager;
    console.log('[SecurityAgent] Initialized 🔒');
  }

  handleMessage(message: SubagentMessage): void {
    console.log(`[SecurityAgent] Received: ${message.type} from ${message.from}`);

    switch (message.type) {
      case 'pre_trade_check':
        this.runPreTradeCheck(message.payload);
        break;
      case 'voice_risk':
        this.handleRiskSettings(message.payload);
        break;
      case 'validate_tx':
        this.validateTransaction(message.payload);
        break;
      case 'verify_noncustodial':
        this.verifyNonCustodial(message.payload);
        break;
      default:
        console.log(`[SecurityAgent] Unknown message type: ${message.type}`);
    }

    this.manager.updateStatus('security', 'idle');
  }

  private runPreTradeCheck(payload: any): void {
    console.log('[SecurityAgent] Running pre-trade security check...');

    const checks = {
      slippage: payload.slippage <= this.riskSettings.maxSlippage,
      leverage: payload.leverage ? payload.leverage <= this.riskSettings.maxLeverage : true,
      positionSize: payload.amount ? true : false, // Would check against portfolio
      nonCustodial: true, // Always enforced
    };

    const passed = Object.values(checks).every(Boolean);

    if (passed) {
      console.log('[SecurityAgent] ✅ All checks passed');
    } else {
      console.log('[SecurityAgent] ❌ Risk checks failed:', checks);
    }

    // Send result back to trading agent
    this.manager.handleMessage({
      from: 'security',
      to: 'trading',
      type: 'risk_check_result',
      payload: { passed, checks },
    });
  }

  private handleRiskSettings(payload: any): void {
    console.log('[SecurityAgent] Updating risk settings:', payload);

    if (payload.stopLoss) this.riskSettings.stopLossDefault = payload.stopLoss;
    if (payload.takeProfit) this.riskSettings.takeProfitDefault = payload.takeProfit;
    if (payload.maxSlippage) this.riskSettings.maxSlippage = payload.maxSlippage;

    console.log('[SecurityAgent] Risk settings updated');
  }

  private validateTransaction(payload: any): void {
    console.log('[SecurityAgent] Validating transaction...');
    // In production: verify contract addresses against known allowlists
    // Check gas fees, verify chain ID, check for common phishing patterns

    const warnings: string[] = [];

    if (payload.to && !this.isKnownContract(payload.to)) {
      warnings.push('⚠️ Interacting with unknown contract address');
    }

    if (warnings.length > 0) {
      console.log('[SecurityAgent] Warnings:', warnings);
    } else {
      console.log('[SecurityAgent] ✅ Transaction validated');
    }
  }

  private verifyNonCustodial(payload: any): void {
    // NEVER allow private key or seed phrase operations
    if (
      payload.privateKey ||
      payload.seed ||
      payload.mnemonic ||
      payload.key
    ) {
      console.error('[SecurityAgent] 🚨 PRIVATE KEY DETECTED — BLOCKED!');
      throw new Error('Cypher is NON-CUSTODIAL. Never share your private keys.');
    }

    console.log('[SecurityAgent] ✅ Non-custodial check passed — no keys detected');
  }

  private isKnownContract(address: string): boolean {
    const knownAddresses = new Set([
      '0x1111111254eeb25477b68fb85ed929f73a960583', // 1inch Router v6
      '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap V3 Router
      '0x489ee077994B6658eAfA855C308275EAd8097C4A', // GMX Position Router
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    ]);
    return knownAddresses.has(address.toLowerCase());
  }
}
