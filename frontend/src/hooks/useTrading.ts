// ── Cypher Trading Non-Custodial ──
// useTrading Hook
// Manages DEX quotes, swaps, perps positions

import { useState, useCallback } from 'react';
import { tradingService } from '../services/tradingService';

interface QuoteRequest {
  chainId: number;
  fromToken: string;
  toToken: string;
  amount: string;
}

export function useTrading() {
  const [loading, setLoading] = useState(false);

  const getQuote = useCallback(async (request: QuoteRequest) => {
    setLoading(true);
    try {
      const quote = await tradingService.getQuote(request);
      return quote;
    } catch (err) {
      console.error('[Trading] Quote error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeSwap = useCallback(
    async (quote: any, walletAddress: string) => {
      setLoading(true);
      try {
        const tx = await tradingService.executeSwap(quote, walletAddress);
        return tx;
      } catch (err) {
        console.error('[Trading] Swap error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const openPerpPosition = useCallback(
    async (params: {
      chainId: number;
      pair: string;
      side: 'long' | 'short';
      leverage: number;
      amount: string;
    }) => {
      setLoading(true);
      try {
        const tx = await tradingService.openPerpPosition(params);
        return tx;
      } catch (err) {
        console.error('[Trading] Perp error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    getQuote,
    executeSwap,
    openPerpPosition,
  };
}
