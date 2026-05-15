// ── Cypher Trading Non-Custodial ──
// Electron Preload Script
// Exposes safe IPC bridge to renderer

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('cypher', {
  // Wallet methods (non-custodial — keys never leave renderer)
  wallet: {
    getConnection: () => ipcRenderer.invoke('wallet:get-connection'),
  },

  // Voice methods
  voice: {
    startListening: () => ipcRenderer.invoke('voice:start-listening'),
    stopListening: () => ipcRenderer.invoke('voice:stop-listening'),
    speak: (text: string) => ipcRenderer.invoke('voice:speak', text),
    onListeningStarted: (callback: () => void) =>
      ipcRenderer.on('voice:listening-started', callback),
    onListeningStopped: (callback: () => void) =>
      ipcRenderer.on('voice:listening-stopped', callback),
    onSpeak: (callback: (text: string) => void) =>
      ipcRenderer.on('voice:speak', (_event, text) => callback(text)),
  },

  // App info
  platform: process.platform,
  isElectron: true,
});
