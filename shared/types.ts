// ── Cypher Trading Non-Custodial ──
// Shared Types
// Used across frontend, backend, and subagents

// ==================== WALLET ====================
export interface WalletConnection {
  address: string;
  chainId: number;
}

// ==================== TRADING ====================
export interface QuoteRequest {
  chainId: number;
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number; // default 0.5%
}

export interface QuoteResponse {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  price: string;
  chainId: number;
  aggregator: string;
  estimatedGas: string;
  validForMs: number;
  route: string[];
}

export interface DexRoute {
  aggregator: string;
  fromAmount: string;
  toAmount: string;
  price: string;
  gas: string;
  path: string[];
}

export interface SwapTransaction {
  to: string;
  data: string;
  value: string;
  gasLimit?: number;
}

export interface PerpPositionParams {
  chainId: number;
  pair: string; // e.g. "ETH/USD"
  side: 'long' | 'short';
  leverage: number;
  amount: string;
  stopLoss?: number; // percentage
  takeProfit?: number; // percentage
}

export interface PerpPosition {
  id: string;
  pair: string;
  side: 'long' | 'short';
  leverage: number;
  size: string;
  entryPrice: string;
  currentPrice: string;
  pnl: string;
  pnlPercent: string;
  stopLoss: number | null;
  takeProfit: number | null;
  chainId: number;
  status: 'open' | 'closed' | 'liquidated';
}

// ==================== VOICE ====================
export interface VoiceIntent {
  type:
    | 'quote'
    | 'swap'
    | 'perps'
    | 'balance'
    | 'history'
    | 'risk'
    | 'wallet_connect'
    | 'wallet_disconnect'
    | 'unknown';
  confidence: number;
  entities: Record<string, string>;
  rawText: string;
}

export interface VoiceResponse {
  text: string;
  audio?: string; // base64 encoded
  action?: VoiceAction;
}

export interface VoiceAction {
  type: 'navigate' | 'execute' | 'confirm' | 'error';
  payload?: Record<string, unknown>;
}

// ==================== RISK ====================
export interface RiskSettings {
  stopLoss: number; // percentage
  takeProfit: number; // percentage
  maxPositionSize: number; // percentage of portfolio
  maxLeverage: number;
  maxSlippage: number; // percentage
}

// ==================== SUBAGENTS ====================
export interface SubagentMessage {
  from: string; // agent name
  to: string; // agent name
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface SubagentStatus {
  name: string;
  status: 'idle' | 'working' | 'error';
  lastActivity: number;
  taskCount: number;
}
