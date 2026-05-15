// ── Cypher Trading Non-Custodial ──
// Wallet Service
// Handles WalletConnect v2 + MetaMask injection for non-custodial wallet connection
// 🔒 NON-CUSTODIAL: Keys are NEVER stored, sent, or requested

import { ethers } from 'ethers';
import { Web3Wallet } from '@walletconnect/web3wallet';

const WC_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// ERC20 ABI (minimal for balanceOf)
const ERC20_ABI = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'];

const TOKEN_ADDRESSES: Record<number, Record<string, string>> = {
  1: { USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  42161: { USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
};

interface WalletConnection {
  address: string;
  chainId: number;
  provider: ethers.BrowserProvider;
}

let connection: WalletConnection | null = null;
let web3wallet: Web3Wallet | null = null;

export const walletService = {
  async initialize() {
    if (!WC_PROJECT_ID || WC_PROJECT_ID === 'your_walletconnect_project_id_here') {
      console.warn('[WalletService] WalletConnect v2 not configured. Falling back to MetaMask injection only.');
      console.warn('[WalletService] Get your project ID at https://cloud.walletconnect.com');
      return;
    }

    try {
      web3wallet = await Web3Wallet.init({
        projectId: WC_PROJECT_ID,
        metadata: {
          name: 'Cypher Trading',
          description: 'Non-Custodial Voice Assistant for Crypto Trading',
          url: 'https://cypher.trading',
          icons: ['https://cypher.trading/icon.png'],
        },
      });
      console.log('[WalletService] WalletConnect v2 initialized');
    } catch (err) {
      console.error('[WalletService] WalletConnect v2 init failed, falling back to MetaMask:', err);
    }
  },

  async connect(): Promise<{ address: string; chainId: number }> {
    // Strategy 1: Try WalletConnect v2 for mobile/dApp wallets
    if (web3wallet) {
      try {
        const { uri, approval } = await web3wallet.core.pairing.create();
        // In production: show the QR code / URI to the user
        console.log('[WalletService] WalletConnect URI:', uri);

        // Wait for session approval
        const session = await approval();
        const accounts = session.namespaces.eip155?.accounts || [];

        if (accounts.length === 0) {
          throw new Error('No accounts returned from WalletConnect');
        }

        // Parse chain:account format (e.g., "eip155:1:0x...")
        const [, chainRef, accountRef] = accounts[0].split(':');
        const chainId = parseInt(chainRef || '1', 10);
        const address = ethers.getAddress(accountRef || '');

        // Create provider via fallback RPC (read-only), signing happens via WC
        const provider = new ethers.BrowserProvider(ethers.getDefaultProvider('mainnet'));
        connection = { address, chainId, provider };

        this.setupEventListeners();
        console.log('[WalletService] Connected via WalletConnect:', address, 'Chain:', chainId);
        return { address, chainId };
      } catch (err) {
        console.warn('[WalletService] WalletConnect connection failed, trying MetaMask:', err);
      }
    }

    // Strategy 2: Fallback to injected provider (MetaMask, Rabby, Rainbow extension)
    return this.connectInjected();
  },

  async connectInjected(): Promise<{ address: string; chainId: number }> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error(
        'No Web3 wallet found. Options:\n' +
        '1. Install MetaMask/Phantom browser extension\n' +
        '2. Configure WalletConnect project ID in .env for mobile wallet support'
      );
    }

    try {
      const accounts: string[] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const address = ethers.getAddress(accounts[0] as string);

      const chainIdHex: string = await window.ethereum.request({
        method: 'eth_chainId',
      });
      const chainId = parseInt(chainIdHex, 16);

      const provider = new ethers.BrowserProvider(window.ethereum);
      connection = { address, chainId, provider };

      this.setupEventListeners();
      console.log('[WalletService] Connected via Injected:', address, 'Chain:', chainId);
      return { address, chainId };
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      if (error.code === 4001) {
        throw new Error('Wallet connection rejected by user');
      }
      throw err;
    }
  },

  setupEventListeners() {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', (newAccounts: unknown) => {
      const accounts = newAccounts as string[];
      if (accounts.length === 0) {
        this.disconnect();
      } else if (connection) {
        connection.address = ethers.getAddress(accounts[0]);
      }
    });

    window.ethereum.on('chainChanged', (chainIdHex: unknown) => {
      if (connection) {
        connection.chainId = parseInt(chainIdHex as string, 16);
      }
    });
  },

  async disconnect() {
    if (web3wallet) {
      try {
        // Disconnect all active sessions
        const sessions = web3wallet.getActiveSessions();
        for (const session of Object.values(sessions)) {
          await web3wallet.disconnectSession({
            topic: session.topic,
            reason: { code: 6000, message: 'User disconnected' },
          });
        }
      } catch (err) {
        console.warn('[WalletService] WC disconnect error:', err);
      }
    }
    connection = null;
    console.log('[WalletService] Disconnected');
  },

  async getBalances(address: string): Promise<Record<string, string>> {
    if (!connection) throw new Error('Wallet not connected');

    const balances: Record<string, string> = {};

    // Native token balance
    const nativeBalance = await connection.provider.getBalance(address);
    balances['ETH'] = ethers.formatEther(nativeBalance).slice(0, 8);

    // ERC20 balances
    const chainTokens = TOKEN_ADDRESSES[connection.chainId];
    if (chainTokens) {
      for (const [symbol, tokenAddress] of Object.entries(chainTokens)) {
        try {
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, connection.provider);
          const balance = await contract.balanceOf(address);
          const decimals = await contract.decimals();
          balances[symbol] = ethers.formatUnits(balance, decimals).slice(0, 8);
        } catch {
          // Token might not exist on this chain, skip
        }
      }
    }

    return balances;
  },

  async getSigner(): Promise<ethers.JsonRpcSigner> {
    if (!connection) throw new Error('Wallet not connected');
    return connection.provider.getSigner();
  },

  getConnection() {
    return connection;
  },

  isConnected(): boolean {
    return connection !== null;
  },
};
