// ── Cypher Trading Non-Custodial ──
// Trading Service
// Fetches quotes and executes swaps via DEX aggregators
// All transactions are signed client-side via the connected wallet

import { walletService } from './walletService';
import { ethers } from 'ethers';
import type { QuoteRequest, QuoteResponse, SwapRequest, PerpPositionParams } from '@shared/types';

const BACKEND_URL = '/api';

export const tradingService = {
  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    const res = await fetch(`${BACKEND_URL}/trading/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Quote failed' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async executeSwap(quote: QuoteResponse, walletAddress: string): Promise<string> {
    // Get the transaction data from the backend
    const res = await fetch(`${BACKEND_URL}/trading/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote, walletAddress }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Swap preparation failed' }));
      throw new Error(error.message);
    }

    const { tx } = await res.json();

    // Sign the transaction on the client side
    const signer = await walletService.getSigner();
    const txResponse = await signer.sendTransaction({
      to: tx.to,
      data: tx.data,
      value: ethers.parseEther(tx.value || '0'),
      gasLimit: tx.gasLimit ? ethers.toBigInt(tx.gasLimit) : undefined,
    });

    console.log('[TradingService] Swap sent:', txResponse.hash);
    await txResponse.wait();
    return txResponse.hash;
  },

  async openPerpPosition(params: PerpPositionParams): Promise<string> {
    const res = await fetch(`${BACKEND_URL}/trading/perps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Perps position failed' }));
      throw new Error(error.message);
    }

    const { tx } = await res.json();

    const signer = await walletService.getSigner();
    const txResponse = await signer.sendTransaction({
      to: tx.to,
      data: tx.data,
      value: ethers.parseEther(tx.value || '0'),
    });

    console.log('[TradingService] Perp position opened:', txResponse.hash);
    await txResponse.wait();
    return txResponse.hash;
  },

  async getTradeHistory(address: string, chainId: number): Promise<any[]> {
    const res = await fetch(
      `${BACKEND_URL}/trading/history?address=${address}&chainId=${chainId}`
    );
    if (!res.ok) throw new Error('Failed to fetch trade history');
    return res.json();
  },
};
