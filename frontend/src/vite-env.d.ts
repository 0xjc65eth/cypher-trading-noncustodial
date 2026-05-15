/// <reference types="vite/client" />

// Ethereum provider injected by MetaMask/Rabby/Rainbow
interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    isMetaMask?: boolean;
    isRabby?: boolean;
  };
}

interface CypherAPI {
  wallet: {
    getConnection: () => Promise<{ connected: boolean; address: string | null; chainId: number | null }>;
  };
  voice: {
    startListening: () => Promise<boolean>;
    stopListening: () => Promise<boolean>;
    speak: (text: string) => Promise<boolean>;
    onListeningStarted: (callback: () => void) => void;
    onListeningStopped: (callback: () => void) => void;
    onSpeak: (callback: (text: string) => void) => void;
  };
  platform: string;
  isElectron: boolean;
}

declare global {
  interface Window {
    cypher?: CypherAPI;
  }
}
