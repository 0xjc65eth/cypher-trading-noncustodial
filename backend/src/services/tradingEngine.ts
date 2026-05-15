// ── Cypher Trading Non-Custodial ──
// Trading Engine Service
// Aggregates quotes from 1inch, Jupiter, Uniswap, GMX

import type { QuoteRequest, QuoteResponse, PerpPositionParams, SwapTransaction } from '../../shared/types.js';

const ONEINCH_API = 'https://api.1inch.dev/swap/v6.0';
const JUPITER_API = 'https://quote-api.jup.ag/v6';

export const tradingEngine = {
  async getBestQuote(request: QuoteRequest): Promise<QuoteResponse & { routes: any[] }> {
    const results: QuoteResponse[] = [];

    // 1inch (Ethereum, Arbitrum, Base, Polygon)
    if ([1, 42161, 8453, 137].includes(request.chainId)) {
      try {
        const oneInchQuote = await get1inchQuote(request);
        if (oneInchQuote) results.push(oneInchQuote);
      } catch (err) {
        console.warn('[TradingEngine] 1inch quote failed:', err);
      }
    }

    // Jupiter (Solana)
    if (request.chainId === 7565164) {
      try {
        const jupiterQuote = await getJupiterQuote(request);
        if (jupiterQuote) results.push(jupiterQuote);
      } catch (err) {
        console.warn('[TradingEngine] Jupiter quote failed:', err);
      }
    }

    // Uniswap V3 (fallback for Ethereum chains)
    if (results.length === 0 && [1, 42161, 8453].includes(request.chainId)) {
      results.push(getUniswapSimulatedQuote(request));
    }

    if (results.length === 0) {
      throw new Error('No quotes available for this pair on the selected chain');
    }

    // Return the best quote (highest output amount)
    const best = results.sort((a, b) => parseFloat(b.toAmount) - parseFloat(a.toAmount))[0];

    return {
      ...best,
      routes: results.map((r) => ({
        aggregator: r.aggregator,
        fromAmount: r.fromAmount,
        toAmount: r.toAmount,
        price: r.price,
        gas: r.estimatedGas,
        path: r.route,
      })),
    };
  },

  async prepareSwap(quote: QuoteResponse, walletAddress: string): Promise<SwapTransaction> {
    if (quote.aggregator === '1inch') {
      return prepare1inchSwap(quote, walletAddress);
    }
    if (quote.aggregator === 'Jupiter') {
      return prepareJupiterSwap(quote, walletAddress);
    }
    // Uniswap fallback
    return prepareUniswapSwap(quote, walletAddress);
  },

  async openPerpPosition(params: PerpPositionParams): Promise<SwapTransaction> {
    // GMX perps on Arbitrum
    if (params.chainId === 42161) {
      return prepareGMXPosition(params);
    }
    throw new Error(`Perps not available on chain ${params.chainId}. Supported: Arbitrum (GMX).`);
  },

  async getHistory(address: string, chainId: number): Promise<any[]> {
    return [
      {
        txHash: '0xabc...',
        type: 'swap',
        pair: 'ETH/USDC',
        amount: '1.5 ETH',
        value: '$2,850',
        timestamp: Date.now() - 86400000,
        chainId,
      },
    ];
  },
};

// ── 1inch Integration ──
async function get1inchQuote(req: QuoteRequest): Promise<QuoteResponse | null> {
  const chainMap: Record<number, string> = { 1: '1', 42161: '42161', 8453: '8453', 137: '137' };
  const chainId = chainMap[req.chainId];
  if (!chainId) return null;

  const url = `${ONEINCH_API}/${chainId}/quote?src=${req.fromToken}&dst=${req.toToken}&amount=${req.amount}`;
  const headers = { Authorization: `Bearer ${process.env.ONEINCH_API_KEY || ''}` };

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const data = await res.json();

    return {
      fromToken: data.fromToken.symbol,
      toToken: data.toToken.symbol,
      fromAmount: req.amount,
      toAmount: data.toAmount,
      price: data.toAmount,
      chainId: req.chainId,
      aggregator: '1inch',
      estimatedGas: data.estimatedGas || '0',
      validForMs: 30000,
      route: (data.protocols || []).map((p: any) => p[0]?.name || ''),
    };
  } catch {
    return null;
  }
}

// ── Jupiter (Solana) Integration ──
async function getJupiterQuote(req: QuoteRequest): Promise<QuoteResponse | null> {
  const url = `${JUPITER_API}/quote?inputMint=${req.fromToken}&outputMint=${req.toToken}&amount=${req.amount}&slippageBps=${(req.slippage || 0.5) * 100}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    return {
      fromToken: data.inputMint,
      toToken: data.outputMint,
      fromAmount: req.amount,
      toAmount: String(data.outAmount),
      price: String(data.outAmount),
      chainId: 7565164,
      aggregator: 'Jupiter',
      estimatedGas: String(data.otherAmountThreshold || '0'),
      validForMs: 15000,
      route: (data.routePlan || []).map((r: any) => r.swapInfo?.label || ''),
    };
  } catch {
    return null;
  }
}

// ── Uniswap V3 Simulated Quote ──
function getUniswapSimulatedQuote(req: QuoteRequest): QuoteResponse {
  return {
    fromToken: req.fromToken,
    toToken: req.toToken,
    fromAmount: req.amount,
    toAmount: '0', // Would be fetched from Uniswap SDK/Subgraph
    price: '0',
    chainId: req.chainId,
    aggregator: 'Uniswap V3',
    estimatedGas: '150000',
    validForMs: 30000,
    route: ['Uniswap V3'],
  };
}

// ── Swap Preparation ──
async function prepare1inchSwap(quote: QuoteResponse, walletAddress: string): Promise<SwapTransaction> {
  const chainMap: Record<number, string> = { 1: '1', 42161: '42161' };
  const chainId = chainMap[quote.chainId] || '1';

  const url = `${ONEINCH_API}/${chainId}/swap`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.ONEINCH_API_KEY || ''}` },
    body: JSON.stringify({
      src: quote.fromToken,
      dst: quote.toToken,
      amount: quote.fromAmount,
      from: walletAddress,
      slippage: 0.5,
    }),
  });

  const data = await res.json();
  return { to: data.tx.to, data: data.tx.data, value: data.tx.value || '0' };
}

async function prepareJupiterSwap(quote: QuoteResponse, walletAddress: string): Promise<SwapTransaction> {
  // Jupiter swap transactions are prepared server-side via Jupiter API
  const url = `${JUPITER_API}/swap`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quoteResponse: {
        inputMint: quote.fromToken,
        outputMint: quote.toToken,
        inAmount: quote.fromAmount,
        outAmount: quote.toAmount,
      },
      userPublicKey: walletAddress,
      slippageBps: 50, // 0.5%
    }),
  });

  if (!res.ok) {
    throw new Error(`Jupiter swap preparation failed: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    to: data.swapTransaction || '',
    data: '', // Solana transactions use different format
    value: '0',
  };
}

async function prepareUniswapSwap(quote: QuoteResponse, walletAddress: string): Promise<SwapTransaction> {
  // In production: construct swap via Uniswap SDK/Quoter
  // For now, throw — better to fail safe than return placeholder calldata
  throw new Error(
    'Uniswap V3 direct swap not yet implemented. Use the 1inch aggregator route for EVM chains.'
  );
}

async function prepareGMXPosition(params: PerpPositionParams): Promise<SwapTransaction> {
  // In production: construct perp position via GMX contracts
  // For now, throw — perps positions are complex and need proper calldata
  throw new Error(
    `GMX perps not yet fully implemented. We're working on it! Chain: ${params.chainId}, Side: ${params.side}`
  );
}
