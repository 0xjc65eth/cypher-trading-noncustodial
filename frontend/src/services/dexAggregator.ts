// ── Cypher Trading Non-Custodial ──
// DEX Aggregator Service
// Routes requests to the best aggregator based on chain:
//   Ethereum/Arbitrum/Base → 1inch
//   Solana → Jupiter
//   GMX/Perps → native GMX contracts

import type { QuoteRequest, QuoteResponse, DexRoute } from '@shared/types';

const BACKEND_URL = '/api';

export const dexAggregator = {
  /**
   * Get the best route across all available DEX aggregators
   */
  async getBestQuote(request: QuoteRequest): Promise<QuoteResponse & { routes: DexRoute[] }> {
    const res = await fetch(`${BACKEND_URL}/dex/best-quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch quote' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  /**
   * Get quotes from all available aggregators
   */
  async getAllQuotes(request: QuoteRequest): Promise<(QuoteResponse & { aggregator: string })[]> {
    const res = await fetch(`${BACKEND_URL}/dex/all-quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) throw new Error('Failed to fetch quotes');
    return res.json();
  },
};
