// ── Cypher Trading Non-Custodial ──
// Main App Component
// Layout: Voice Orb (center) + Side panels for wallet & trading

import React, { useState } from 'react';
import { VoiceOrb } from './components/VoiceOrb';
import { WalletPanel } from './components/WalletPanel';
import { TradingPanel } from './components/TradingPanel';
import { PortfolioView } from './components/PortfolioView';
import { RiskManager } from './components/RiskManager';
import { Header } from './components/Header';
import { useVoice } from './hooks/useVoice';
import { useWallet } from './hooks/useWallet';

type Tab = 'voice' | 'wallet' | 'trade' | 'portfolio' | 'risk';

export function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>('voice');
  const { isListening, transcript, response, startListening, stopListening, isSpeaking } = useVoice();
  const { isConnected, address, chainId, balance, connect, disconnect } = useWallet();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        address={address}
      />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <aside className="w-80 border-r border-white/10 p-4 flex flex-col gap-4 overflow-y-auto">
          <WalletPanel
            isConnected={isConnected}
            address={address}
            chainId={chainId}
            balance={balance}
            onConnect={connect}
            onDisconnect={disconnect}
          />
          <RiskManager />
        </aside>

        {/* Center — Voice Orb */}
        <section className="flex-1 flex flex-col items-center justify-center p-8">
          {activeTab === 'voice' && (
            <VoiceOrb
              isListening={isListening}
              isSpeaking={isSpeaking}
              transcript={transcript}
              response={response}
              onStartListening={startListening}
              onStopListening={stopListening}
            />
          )}
          {activeTab === 'trade' && (
            <TradingPanel isConnected={isConnected} address={address} />
          )}
          {activeTab === 'portfolio' && (
            <PortfolioView address={address} isConnected={isConnected} />
          )}
        </section>

        {/* Right Panel — Quick Actions */}
        <aside className="w-72 border-l border-white/10 p-4 overflow-y-auto">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Quick Commands</div>
          <div className="space-y-2">
            {[
              'Check my balance',
              'Swap 1 ETH to USDC',
              'Show best price for SOL',
              'Open long on ETH',
              'Set stop-loss at 5%',
              'Show my trade history',
            ].map((cmd) => (
              <button
                key={cmd}
                onClick={() => startListening()}
                className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-colors border border-white/5 hover:border-cyan-500/30"
              >
                💬 {cmd}
              </button>
            ))}
          </div>
        </aside>
      </main>

      {/* Status bar */}
      <footer className="h-8 border-t border-white/10 flex items-center justify-between px-4 text-xs text-gray-600">
        <span>🟢 Voice Engine: OVOS</span>
        <span>⛓️ Multi-Chain | Non-Custodial</span>
        <span>🔒 Keys: Local Only</span>
        {isConnected && (
          <span className="text-green-500">✓ Wallet Connected</span>
        )}
      </footer>
    </div>
  );
}
