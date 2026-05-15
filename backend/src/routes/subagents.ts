// ── Cypher Trading Non-Custodial ──
// Subagent Routes
// API for querying and managing subagents

import { Router, Request, Response } from 'express';
import { subagentManager } from '../server.js';

export const subagentRouter = Router();

// ── GET /api/subagents/status ──
subagentRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    agents: subagentManager.getAllStatuses(),
    note: 'Subagents handle voice, trading, and security coordination',
  });
});

// ── POST /api/subagents/message ──
// Send a message between agents (for debugging / admin)
subagentRouter.post('/message', async (req: Request, res: Response) => {
  const { from, to, type, payload } = req.body;

  if (!from || !to || !type) {
    return res.status(400).json({ error: 'from, to, and type are required' });
  }

  subagentManager.handleMessage({
    from,
    to,
    type,
    payload: payload || {},
  });

  res.json({ status: 'Message routed', from, to, type });
});
