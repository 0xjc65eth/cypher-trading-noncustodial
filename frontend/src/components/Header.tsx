// ── Cypher Trading Non-Custodial ──
// Header Component
// App header with navigation tabs

import React from 'react';
import { Mic, Wallet, ArrowDownUp, PieChart, Shield, Github } from 'lucide-react';
import clsx from 'clsx';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: 'voice' | 'wallet' | 'trade' | 'portfolio' | 'risk') => void;
  isConnected: boolean;
  address: string | null;
}

const TABS = [
  { key: 'voice', label: 'Voice', icon: Mic },
  { key: 'trade', label: 'Trade', icon: ArrowDownUp },
  { key: 'portfolio', label: 'Portfolio', icon: PieChart },
  { key: 'risk', label: 'Risk', icon: Shield },
];

export function Header({ activeTab, setActiveTab, isConnected, address }: HeaderProps): React.ReactElement {
  return (
    <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-gray-950/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="text-white font-bold text-xs">C</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Cypher Trading</h1>
            <p className="text-[10px] text-gray-500 leading-none">Non-Custodial Voice Agent</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all',
              activeTab === key
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {isConnected && address && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs text-green-400 font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
        )}
        <a
          href="https://github.com/cypher-trading/cypher-trading-noncustodial"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-colors"
        >
          <Github className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
}
