// ── Cypher Trading Non-Custodial ──
// WalletPanel Component
// Non-custodial wallet connection via WalletConnect v2

import React from 'react';
import { Wallet, LogOut, Copy, ExternalLink, Shield } from 'lucide-react';
import clsx from 'clsx';

interface WalletPanelProps {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: Record<string, string> | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  42161: 'Arbitrum',
  8453: 'Base',
  137: 'Polygon',
  7565164: 'Solana',
};

export function WalletPanel({
  isConnected,
  address,
  chainId,
  balance,
  onConnect,
  onDisconnect,
}: WalletPanelProps): React.ReactElement {
  const shortenedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
        <Shield className="w-4 h-4 text-green-500" />
        Non-Custodial
      </div>

      {isConnected ? (
        <div className="space-y-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Connected</span>
          </div>

          {/* Address */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
            <div className="text-xs text-gray-500">Wallet Address</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-gray-300">
                {shortenedAddress}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(address || '')}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Copy className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Chain */}
          {chainId && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-gray-500">Network</div>
              <div className="text-sm text-cyan-400 font-medium">
                {CHAIN_NAMES[chainId] || `Chain ${chainId}`}
              </div>
            </div>
          )}

          {/* Balances */}
          {balance && Object.keys(balance).length > 0 && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs text-gray-500">Balances</div>
              {Object.entries(balance).map(([token, amount]) => (
                <div key={token} className="flex justify-between text-sm">
                  <span className="text-gray-400">{token}</span>
                  <span className="text-gray-200 font-mono">{amount}</span>
                </div>
              ))}
            </div>
          )}

          {/* Disconnect */}
          <button
            onClick={onDisconnect}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Disconnect Wallet
          </button>

          {/* Explorer Link */}
          <a
            href={`https://etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            View on Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            Connect your wallet to start trading. Your keys stay on your device — we never store them.
          </p>
          <button
            onClick={onConnect}
            className={clsx(
              'w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl',
              'bg-gradient-to-r from-cyan-600 to-blue-600',
              'hover:from-cyan-500 hover:to-blue-500',
              'text-white font-medium text-sm',
              'shadow-lg shadow-cyan-500/25',
              'transition-all duration-300 hover:shadow-cyan-500/50',
              'active:scale-[0.98]'
            )}
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet (WalletConnect v2)
          </button>

          <p className="text-xs text-gray-600 text-center">
            🔒 Non-custodial: Your keys, your coins
          </p>
        </div>
      )}
    </div>
  );
}
