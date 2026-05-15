// ── Cypher Trading Non-Custodial ──
// TradingPanel Component
// Quote, swap, perps, and multi-chain trading UI

import React, { useState } from 'react';
import { ArrowDownUp, TrendingUp, Zap, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface TradingPanelProps {
  isConnected: boolean;
  address: string | null;
}

type TradeMode = 'quote' | 'swap' | 'perps';

const CHAINS = [
  { id: 1, name: 'Ethereum' },
  { id: 42161, name: 'Arbitrum' },
  { id: 8453, name: 'Base' },
  { id: 7565164, name: 'Solana' },
];

const TOKENS = ['ETH', 'USDC', 'USDT', 'WBTC', 'SOL', 'ARB', 'GMX', 'LINK'];

export function TradingPanel({ isConnected, address }: TradingPanelProps): React.ReactElement {
  const [mode, setMode] = useState<TradeMode>('quote');
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [chain, setChain] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);

  const handleGetQuote = async () => {
    if (!amount) return;
    setLoading(true);
    // TODO: call backend /api/trading/quote
    setTimeout(() => {
      setQuote(`1 ${fromToken} ≈ ${(Math.random() * 1900 + 1800).toFixed(2)} ${toToken}`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Mode Selector */}
      <div className="flex rounded-lg bg-white/5 p-1 border border-white/10">
        {[
          { key: 'quote', label: 'Quote', icon: Zap },
          { key: 'swap', label: 'Swap', icon: ArrowDownUp },
          { key: 'perps', label: 'Perps', icon: TrendingUp },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setMode(key as TradeMode); setQuote(null); }}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm transition-all',
              mode === key
                ? 'bg-cyan-500/20 text-cyan-400 font-medium'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Chain Selector */}
      <select
        value={chain}
        onChange={(e) => setChain(Number(e.target.value))}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50"
      >
        {CHAINS.map((c) => (
          <option key={c.id} value={c.id} className="bg-gray-900">
            ⛓️ {c.name}
          </option>
        ))}
      </select>

      {/* From / To */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <select
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            className="w-28 px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50"
          >
            {TOKENS.map((t) => (
              <option key={t} value={t} className="bg-gray-900">{t}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-right text-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => { const t = fromToken; setFromToken(toToken); setToToken(t); }}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <ArrowDownUp className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            className="w-28 px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50"
          >
            {TOKENS.filter((t) => t !== fromToken).map((t) => (
              <option key={t} value={t} className="bg-gray-900">{t}</option>
            ))}
          </select>
          <div className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-right text-lg text-gray-600">
            {quote ? quote.split('≈')[1]?.trim() || '0.00' : '0.00'}
          </div>
        </div>
      </div>

      {/* Quote / Result */}
      {quote && mode === 'quote' && (
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm text-center">
          {quote} — via 1inch/Jupiter aggregator
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={mode === 'quote' ? handleGetQuote : undefined}
        disabled={!isConnected || loading || !amount}
        className={clsx(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all',
          isConnected
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50 active:scale-[0.98]'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : mode === 'quote' ? (
          <>
            <Zap className="w-4 h-4" />
            Get Best Price
          </>
        ) : mode === 'swap' ? (
          <>
            <ArrowDownUp className="w-4 h-4" />
            Swap Now
          </>
        ) : (
          <>
            <TrendingUp className="w-4 h-4" />
            Open Position
          </>
        )}
      </button>

      {!isConnected && (
        <p className="text-xs text-center text-gray-600">
          Connect your wallet to start trading
        </p>
      )}
    </div>
  );
}
