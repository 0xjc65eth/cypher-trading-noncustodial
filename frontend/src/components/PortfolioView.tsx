// ── Cypher Trading Non-Custodial ──
// PortfolioView Component
// Shows wallet assets across all supported chains

import React, { useState, useEffect } from 'react';
import { Wallet, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioViewProps {
  address: string | null;
  isConnected: boolean;
}

interface Asset {
  token: string;
  amount: string;
  valueUsd: string;
  change24h: number;
  chain: string;
}

const MOCK_ASSETS: Asset[] = [
  { token: 'ETH', amount: '2.45', valueUsd: '$4,812.50', change24h: 3.4, chain: 'Ethereum' },
  { token: 'USDC', amount: '5,000', valueUsd: '$5,000.00', change24h: 0.0, chain: 'Arbitrum' },
  { token: 'SOL', amount: '42.0', valueUsd: '$6,384.00', change24h: -2.1, chain: 'Solana' },
  { token: 'GMX', amount: '15.3', valueUsd: '$459.00', change24h: 5.8, chain: 'Arbitrum' },
];

export function PortfolioView({ address, isConnected }: PortfolioViewProps): React.ReactElement {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState('$0.00');

  useEffect(() => {
    if (isConnected) {
      // TODO: Fetch real balances from backend via GET /api/wallet/balances
      // When backend is running, replace with:
      //   const data = await fetch(`/api/wallet/balances?address=${address}&chainId=1`)
      //   setAssets(data.balances)
      setAssets(MOCK_ASSETS);
      setTotalValue('$16,655.50');
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <Wallet className="w-12 h-12 text-gray-600" />
        <p className="text-gray-500">Connect your wallet to view your portfolio</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Total Value */}
      <div className="text-center">
        <div className="text-xs text-gray-500 uppercase tracking-widest">Total Portfolio Value</div>
        <div className="text-4xl font-bold text-white mt-1">{totalValue}</div>
        <div className="text-sm text-green-400 mt-1">+2.4% today</div>
      </div>

      {/* Asset List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-widest px-3">
          <span>Asset</span>
          <span>Balance</span>
          <span>Value</span>
          <span>24h</span>
        </div>
        {assets.map((asset) => (
          <div
            key={`${asset.chain}-${asset.token}`}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div>
              <div className="text-sm font-medium text-gray-200">{asset.token}</div>
              <div className="text-xs text-gray-500">{asset.chain}</div>
            </div>
            <div className="text-sm text-gray-300 font-mono">{asset.amount}</div>
            <div className="text-sm text-gray-200">{asset.valueUsd}</div>
            <div
              className={`flex items-center gap-1 text-sm ${
                asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {asset.change24h >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
            </div>
          </div>
        ))}
      </div>

      {/* Refresh */}
      <button
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-400 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Refresh Balances
      </button>
    </div>
  );
}
