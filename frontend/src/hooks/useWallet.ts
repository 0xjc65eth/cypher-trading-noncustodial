// ── Cypher Trading Non-Custodial ──
// useWallet Hook
// Non-custodial wallet connection via WalletConnect v2
// NEVER stores private keys or seeds — keys remain on user's device

import { useState, useCallback, useEffect } from 'react';
import { walletService } from '../services/walletService';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: Record<string, string> | null;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
    error: null,
  });

  // Initialize WalletConnect on mount
  useEffect(() => {
    walletService.initialize().catch((err) => {
      console.error('[Wallet] Init error:', err);
      setState((prev) => ({ ...prev, error: 'Failed to initialize WalletConnect' }));
    });
  }, []);

  const connect = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));
      const connection = await walletService.connect();

      setState((prev) => ({
        ...prev,
        isConnected: true,
        address: connection.address,
        chainId: connection.chainId,
      }));

      // Fetch initial balances
      const balances = await walletService.getBalances(connection.address);
      setState((prev) => ({
        ...prev,
        balance: balances,
      }));
    } catch (err: any) {
      console.error('[Wallet] Connection error:', err);
      setState((prev) => ({
        ...prev,
        error: err.message || 'Failed to connect wallet',
        isConnected: false,
      }));
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await walletService.disconnect();
      setState({
        isConnected: false,
        address: null,
        chainId: null,
        balance: null,
        error: null,
      });
    } catch (err: any) {
      console.error('[Wallet] Disconnect error:', err);
    }
  }, []);

  return {
    isConnected: state.isConnected,
    address: state.address,
    chainId: state.chainId,
    balance: state.balance,
    error: state.error,
    connect,
    disconnect,
  };
}
