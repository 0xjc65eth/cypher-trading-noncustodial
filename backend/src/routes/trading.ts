// ── Cypher Trading Non-Custodial ──
// Trading Routes
// Quote, swap, perps, history endpoints

import { Router, Request, Response } from 'express';
import { tradingEngine } from '../services/tradingEngine.js';
import { z } from 'zod';

export const tradingRouter = Router();

// Schemas
const quoteSchema = z.object({
  chainId: z.number(),
  fromToken: z.string().min(1),
  toToken: z.string().min(1),
  amount: z.string().min(1),
  slippage: z.number().min(0).max(50).optional(),
});

const swapSchema = z.object({
  quote: z.object({
    fromToken: z.string(),
    toToken: z.string(),
    fromAmount: z.string(),
    toAmount: z.string(),
    chainId: z.number(),
    aggregator: z.string(),
    route: z.array(z.string()),
  }),
  walletAddress: z.string(),
});

const perpsSchema = z.object({
  chainId: z.number(),
  pair: z.string(),
  side: z.enum(['long', 'short']),
  leverage: z.number().min(1).max(100),
  amount: z.string(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
});

// ── GET /api/trading/quote ──
tradingRouter.post('/quote', async (req: Request, res: Response) => {
  try {
    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const quote = await tradingEngine.getBestQuote(parsed.data);
    res.json(quote);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/trading/swap ──
tradingRouter.post('/swap', async (req: Request, res: Response) => {
  try {
    const parsed = swapSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const tx = await tradingEngine.prepareSwap(parsed.data.quote, parsed.data.walletAddress);
    res.json({ tx, message: 'Transaction prepared. Sign on the client side.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/trading/perps ──
tradingRouter.post('/perps', async (req: Request, res: Response) => {
  try {
    const parsed = perpsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const tx = await tradingEngine.openPerpPosition(parsed.data);
    res.json({ tx, message: 'Perp position data prepared. Sign on client.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/trading/history ──
tradingRouter.get('/history', async (req: Request, res: Response) => {
  try {
    const { address, chainId } = req.query;
    if (!address || !chainId) {
      return res.status(400).json({ error: 'address and chainId are required' });
    }

    const history = await tradingEngine.getHistory(address as string, Number(chainId));
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
