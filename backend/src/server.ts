// ── Cypher Trading Non-Custodial ──
// Backend Server
// Express + WebSocket server for trading, voice, and subagent communication

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';

import { voiceRouter } from './routes/voice.js';
import { tradingRouter } from './routes/trading.js';
import { walletRouter } from './routes/wallet.js';
import { subagentRouter } from './routes/subagents.js';
import { VoiceAgent } from './subagents/voiceAgent.js';
import { TradingAgent } from './subagents/tradingAgent.js';
import { SecurityAgent } from './subagents/securityAgent.js';

dotenv.config({ path: '../.env' });

const PORT = process.env.BACKEND_PORT || 4000;
const WS_PORT = process.env.VOICE_WEBSOCKET_PORT || 8181;

const app = express();
const server = createServer(app);

// ── Middleware ──
app.use(cors({ origin: ['http://localhost:3000', 'app://.'] }));
app.use(express.json());

// ── Routes ──
app.use('/api/voice', voiceRouter);
app.use('/api/trading', tradingRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/subagents', subagentRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    agents: subagentManager.getAllStatuses(),
  });
});

// ── Subagent Manager ──
class SubagentManager {
  private agents: Map<string, { status: string; lastActivity: number; taskCount: number }> = new Map();

  register(name: string) {
    this.agents.set(name, { status: 'idle', lastActivity: Date.now(), taskCount: 0 });
    console.log(`[Subagent] ${name} registered`);
  }

  updateStatus(name: string, status: string) {
    const agent = this.agents.get(name);
    if (agent) {
      agent.status = status;
      agent.lastActivity = Date.now();
      if (status === 'working') agent.taskCount++;
    }
  }

  getAllStatuses() {
    return Object.fromEntries(this.agents);
  }

  handleMessage(message: { from: string; to: string; type: string; payload: any }) {
    console.log(`[Subagent] ${message.from} → ${message.to}: ${message.type}`);
    this.updateStatus(message.from, 'working');

    // Route messages between agents
    switch (message.to) {
      case 'trading':
        tradingAgent.handleMessage(message);
        break;
      case 'security':
        securityAgent.handleMessage(message);
        break;
      case 'voice':
        voiceAgent.handleMessage(message);
        break;
    }
  }
}

export const subagentManager = new SubagentManager();

// Initialize subagents
const voiceAgent = new VoiceAgent(subagentManager);
const tradingAgent = new TradingAgent(subagentManager);
const securityAgent = new SecurityAgent(subagentManager);

subagentManager.register('voice');
subagentManager.register('trading');
subagentManager.register('security');

// ── WebSocket Server (Voice) ──
const wss = new WebSocketServer({ port: Number(WS_PORT) });

wss.on('connection', (ws: WebSocket) => {
  console.log('[WS] Voice client connected');

  ws.on('message', (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'voice_input') {
        // Process voice input through the voice agent
        console.log('[WS] Voice input:', msg.text);

        // Send to voice subagent for processing
        subagentManager.handleMessage({
          from: 'user',
          to: 'voice',
          type: 'voice_input',
          payload: { text: msg.text },
        });

        // Simulate STT response (in production: Whisper/OVOS processes this)
        ws.send(
          JSON.stringify({
            type: 'stt_result',
            text: msg.text,
            confidence: 0.95,
          })
        );
      }
    } catch (err) {
      console.error('[WS] Error processing message:', err);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('[WS] Voice client disconnected');
  });

  // Send welcome
  ws.send(JSON.stringify({ type: 'connected', message: 'Voice WebSocket connected' }));
});

console.log(`[Voice WS] Server running on ws://localhost:${WS_PORT}`);

// ── Start HTTP server ──
server.listen(PORT, () => {
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  🎙️  Cypher Trading Backend`);
  console.log(`  HTTP:  http://localhost:${PORT}`);
  console.log(`  WS:    ws://localhost:${WS_PORT}`);
  console.log(`  Agents: voice, trading, security`);
  console.log(`═══════════════════════════════════════════════════\n`);
});

export default app;
