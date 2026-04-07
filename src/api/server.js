/**
 * Gold Country IT — Chat API Server (WebSocket版)
 * 
 * Uses the OpenClaw gateway WebSocket protocol instead of the broken HTTP /v1/chat/completions endpoint.
 * Handles session creation and multi-user session management.
 * 
 * Usage:
 *   node server.js
 * 
 * Environment variables:
 *   OPENCLAW_GATEWAY_WS   — WebSocket URL to OpenClaw gateway (default: ws://127.0.0.1:18789)
 *   OPENCLAW_API_TOKEN    — Gateway auth token (from openclaw.json)
 *   AGENT_ID              — Agent ID to use (default: gold-country-it-chat)
 *   PORT                  — Server port (default: 3001)
 *   SESSION_TTL_MS        — Session timeout in ms (default: 1800000 = 30 min)
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const WebSocket = require('ws');

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// ─── Config ────────────────────────────────────────────────────────────
const CFG = {
  gatewayWs:   process.env.OPENCLAW_GATEWAY_WS   || 'ws://127.0.0.1:18789',
  apiToken:    process.env.OPENCLAW_API_TOKEN    || '400cdf5eee1ab60c79563908d78df0534ad8bea10a0d4db6',
  agentId:     process.env.AGENT_ID              || 'gold-country-it-chat',
  port:        parseInt(process.env.PORT || '3001', 10),
  sessionTTL:  parseInt(process.env.SESSION_TTL_MS || '1800000', 10), // 30 min
};

// ─── In-memory session store ──────────────────────────────────────────
const sessions = new Map();

function createSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

function getOrCreateSession(sessionId) {
  if (!sessionId || !sessions.has(sessionId)) {
    sessionId = createSessionId();
  }
  const now = Date.now();
  const session = sessions.get(sessionId) || { id: sessionId, createdAt: now, lastActive: now, messageCount: 0 };
  session.lastActive = now;
  sessions.set(sessionId, session);
  return sessionId;
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActive > CFG.sessionTTL) {
      sessions.delete(id);
    }
  }
}

setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

// ─── WebSocket gateway client ────────────────────────────────────────
let gatewayWs = null;
let gatewayResolvers = null;

function connectGateway() {
  return new Promise((resolve, reject) => {
    const url = `${CFG.gatewayWs}/v1/chat/post`;
    const ws = new WebSocket(url, undefined, {
      headers: { Authorization: `Bearer ${CFG.apiToken}` },
    });

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Gateway connection timeout'));
    }, 15000);

    ws.on('open', () => {
      clearTimeout(timeout);
      gatewayWs = ws;
      gatewayResolvers = {};
      console.log(`Gateway WS connected: ${url}`);
      resolve(ws);
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        // Route message to the right pending promise
        if (msg.id && gatewayResolvers[msg.id]) {
          gatewayResolvers[msg.id](msg);
          delete gatewayResolvers[msg.id];
        }
      } catch (e) {
        console.error('Failed to parse gateway message:', e);
      }
    });

    ws.on('close', () => {
      console.warn('Gateway WS closed');
      gatewayWs = null;
      gatewayResolvers = null;
      // Reconnect after 3s
      setTimeout(() => connectGateway().catch(console.error), 3000);
    });

    ws.on('error', (err) => {
      console.error('Gateway WS error:', err.message);
    });
  });
}

// ─── Send message via gateway WebSocket ─────────────────────────────
function sendGatewayMessage(sessionKey, message) {
  return new Promise(async (resolve, reject) => {
    if (!gatewayWs || gatewayWs.readyState !== WebSocket.OPEN) {
      await connectGateway();
    }

    const id = crypto.randomBytes(8).toString('hex');
    const msg = {
      id,
      type: 'message',
      agentId: CFG.agentId,
      sessionKey,
      message,
    };

    const timeout = setTimeout(() => {
      delete gatewayResolvers[id];
      reject(new Error('Gateway message timeout'));
    }, 60_000);

    gatewayResolvers[id] = (response) => {
      clearTimeout(timeout);
      resolve(response);
    };

    gatewayWs.send(JSON.stringify(msg));
  });
}

// ─── Routes ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    sessions: sessions.size,
    agent: CFG.agentId,
    gatewayConnected: gatewayWs?.readyState === WebSocket.OPEN,
  });
});

app.post('/sessions', (req, res) => {
  const sessionId = createSessionId();
  sessions.set(sessionId, {
    id: sessionId,
    createdAt: Date.now(),
    lastActive: Date.now(),
    messageCount: 0,
  });
  res.json({ sessionId });
});

app.get('/sessions/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired' });
  }
  res.json({
    sessionId: session.id,
    messageCount: session.messageCount,
    lastActive: session.lastActive,
  });
});

app.post('/chat', async (req, res) => {
  const { sessionId, message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
  }

  const sid = getOrCreateSession(sessionId);
  const session = sessions.get(sid);

  if (!checkRateLimit(`chat:${sid}`)) {
    return res.status(429).json({ error: 'Too many messages. Please wait a moment.' });
  }

  try {
    const response = await sendGatewayMessage(`web:${sid}`, message);
    session.messageCount += 1;

    // Extract reply from WebSocket response format
    const reply = response.reply || response.message || response.content || JSON.stringify(response);
    res.json({ sessionId: sid, reply });
  } catch (err) {
    console.error('Chat error:', err);
    if (err.message.includes('timeout')) {
      res.status(504).json({ error: 'Request timed out. Please try again.' });
    } else {
      res.status(500).json({ error: 'Failed to reach agent', detail: err.message });
    }
  }
});

// ─── Start ─────────────────────────────────────────────────────────────
async function start() {
  try {
    await connectGateway();
  } catch (err) {
    console.warn('Initial gateway connection failed, will retry:', err.message);
  }

  const server = app.listen(CFG.port, () => {
    console.log(`Gold Country IT Chat API running on port ${CFG.port}`);
    console.log(`Gateway WS: ${CFG.gatewayWs}`);
    console.log(`Agent:      ${CFG.agentId}`);
  });

  process.on('SIGINT', () => {
    server.close(() => process.exit(0));
  });
  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
  });
}

start();
