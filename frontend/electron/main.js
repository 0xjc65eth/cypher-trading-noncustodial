// ── Cypher Trading Non-Custodial ──
// Electron Main Process
// Handles desktop window, IPC for voice, wallet security

import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV !== 'production';
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Cypher Trading — Voice Assistant',
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Security: only allow connections to well-known DEX APIs
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "connect-src 'self' ws://localhost:* https://*.walletconnect.com https://*.walletconnect.org https://*.infura.io https://*.alchemy.com https://*.1inch.io https://*.jup.ag https://*.solana.com https://*.arbitrum.io; " +
          "script-src 'self' 'unsafe-inline'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https:;",
        ],
      },
    });
  });

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── IPC Handlers ──
// Wallet requests pass through IPC but NEVER store keys
ipcMain.handle('wallet:get-connection', async () => {
  // Returns current wallet connection info from the renderer's state
  // Keys are NEVER sent to main process
  return { connected: true, address: null, chainId: null };
});

ipcMain.handle('voice:start-listening', async () => {
  // Trigger voice listening mode
  mainWindow?.webContents.send('voice:listening-started');
  return true;
});

ipcMain.handle('voice:stop-listening', async () => {
  mainWindow?.webContents.send('voice:listening-stopped');
  return true;
});

ipcMain.handle('voice:speak', async (_event, text: string) => {
  // Send TTS text to renderer for audio output
  mainWindow?.webContents.send('voice:speak', text);
  return true;
});

// ── App lifecycle ──
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('web-contents-created', (_event, contents) => {
  // Prevent opening new windows (security)
  contents.setWindowOpenHandler(({ url }) => {
    // Only allow trusted domains
    const allowed = [
      'https://app.uniswap.org',
      'https://1inch.io',
      'https://jup.ag',
      'https://app.gmx.io',
    ];
    const allowedDomain = allowed.find((d) => url.startsWith(d));
    if (allowedDomain) {
      return { action: 'allow' };
    }
    return { action: 'deny' };
  });
});
