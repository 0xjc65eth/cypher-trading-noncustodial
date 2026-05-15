// ── Cypher Trading Non-Custodial ──
// Wallet Routes
// Non-custodial wallet info endpoints (never handle keys)

import { Router, Request, Response } from 'express';

export const walletRouter = Router();

// ── GET /api/wallet/info ──
// Returns wallet connection info (no keys!)
walletRouter.get('/info', async (_req: Request, res: Response) => {
  res.json({
    message: '🔒 Cypher is non-custodial. Wallet keys are stored only on your device.',
    supportedWallets: [
      'MetaMask',
      'Rainbow',
      'Rabby',
      'WalletConnect (any compatible wallet)',
    ],
    supportedChains: [
      { id: 1, name: 'Ethereum' },
      { id: 42161, name: 'Arbitrum' },
      { id: 8453, name: 'Base' },
      { id: 137, name: 'Polygon' },
      { id: 7565164, name: 'Solana' },
    ],
  });
});

// ── GET /api/wallet/balances ──
// Fetches balances via public RPC (address only, no auth needed)
walletRouter.get('/balances', async (req: Request, res: Response) => {
  const { address, chainId } = req.query;

  if (!address || !chainId) {
    return res.status(400).json({ error: 'address and chainId are required' });
  }

  // In production: query RPC nodes for balances
  res.json({
    address,
    chainId: Number(chainId),
    balances: {},
    note: 'Balances fetched via public RPC — no keys needed',
  });
});
