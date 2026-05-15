// ── Cypher Trading Non-Custodial ──
// Voice Routes
// STT, TTS, intent recognition endpoints

import { Router, Request, Response } from 'express';

export const voiceRouter = Router();

// ── POST /api/voice/process ──
// Process voice input and return intent + response
voiceRouter.post('/process', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    // In production: this calls OVOS intent recognition
    // For now, we use a simple keyword-based intent matcher
    const intent = recognizeIntent(text);
    const response = generateResponse(intent);

    res.json({ intent, response });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/voice/stt ──
// Speech to text (delegated to OVOS/Whisper skill in production)
voiceRouter.post('/stt', async (req: Request, res: Response) => {
  try {
    // In production: audio data is sent to Whisper via OVOS
    res.json({ text: '', status: 'STT processed via OVOS plugin' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/voice/tts ──
// Text to speech (delegated to OVOS/Mimic3 skill in production)
voiceRouter.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }
    // In production: text is sent to Mimic3/Coqui TTS
    res.json({ audio: '', status: 'TTS processed via OVOS plugin' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Intent Recognition ──
function recognizeIntent(text: string) {
  const lower = text.toLowerCase();

  // Trading intents
  if (lower.match(/swap|exchange|trade .* for/)) {
    const match = lower.match(/(\d+\.?\d*)\s*(eth|usdc|usdt|btc|sol|arb|gmx|link)/gi);
    return {
      type: 'swap',
      confidence: 0.9,
      entities: match ? { amount: match[0], token: match[1] } : {},
      rawText: text,
    };
  }

  if (lower.match(/price|quote|rate|how much|cost/)) {
    return { type: 'quote', confidence: 0.85, entities: {}, rawText: text };
  }

  if (lower.match(/long|short|perpetual|leverage|perp/)) {
    const side = lower.match(/long|short/)?.[0] || 'long';
    return { type: 'perps', confidence: 0.88, entities: { side }, rawText: text };
  }

  if (lower.match(/balance|how much .* have|my portfolio|wallet balance/)) {
    return { type: 'balance', confidence: 0.92, entities: {}, rawText: text };
  }

  if (lower.match(/history|past trades|previous|my trades/)) {
    return { type: 'history', confidence: 0.9, entities: {}, rawText: text };
  }

  if (lower.match(/stop.loss|take.profit|risk|set .* limit/)) {
    return { type: 'risk', confidence: 0.85, entities: {}, rawText: text };
  }

  if (lower.match(/connect wallet|link wallet|login/)) {
    return { type: 'wallet_connect', confidence: 0.95, entities: {}, rawText: text };
  }

  return { type: 'unknown', confidence: 0.5, entities: {}, rawText: text };
}

function generateResponse(intent: any): string {
  switch (intent.type) {
    case 'quote':
      return "Let me check the best price for you. I'm querying 1inch, Uniswap, and Jupiter...";
    case 'swap':
      return 'Preparing your swap. The transaction will be signed on your device.';
    case 'perps':
      return `Opening a ${intent.entities.side || 'long'} position on GMX. Please confirm.`;
    case 'balance':
      return "Fetching your wallet balances across all chains. Remember, I don't store your keys.";
    case 'history':
      return 'Retrieving your trade history from the blockchain...';
    case 'risk':
      return 'Updating your risk settings. All orders execute via smart contracts.';
    case 'wallet_connect':
      return 'Ready to connect your wallet via WalletConnect v2. Your keys stay on your device.';
    default:
      return "I didn't catch that. Try saying: check my balance, swap ETH to USDC, or quote SOL price.";
  }
}
