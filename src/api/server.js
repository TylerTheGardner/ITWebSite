/**
 * Gold Country IT — Chat API Server
 * 
 * Proxies website chat requests to the OpenClaw gateway.
 * Handles session creation and multi-user session management.
 * 
 * Usage:
 *   node server.js
 * 
 * Environment variables:
 *   OPENCLAW_GATEWAY_URL  — Full URL to OpenClaw gateway (default: http://127.0.0.1:18789)
 *   OPENCLAW_API_TOKEN    — Gateway auth token (from openclaw.json)
 *   AGENT_ID              — Agent ID to use (default: gold-country-it-chat)
 *   PORT                  — Server port (default: 3001)
 *   SESSION_TTL_MS        — Session timeout in ms (default: 1800000 = 30 min)
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// ─── Config ────────────────────────────────────────────────────────────
const CFG = {
  gatewayUrl: process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789',
  apiToken:   process.env.OPENCLAW_API_TOKEN   || '400cdf5eee1ab60c79563908d78df0534ad8bea10a0d4db6',
  agentId:    process.env.AGENT_ID              || 'gold-country-it-chat',
  port:       parseInt(process.env.PORT || '3001', 10),
  sessionTTL: parseInt(process.env.SESSION_TTL_MS || '1800000', 10), // 30 min
};

// ─── In-memory session store ──────────────────────────────────────────
// For production, replace with Redis or similar
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

// Run cleanup every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

// ─── Routes ─────────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', sessions: sessions.size, agent: CFG.agentId });
});

// Create a new chat session
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

// Get session info (no auth needed — sessionId is the key)
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

// Send a message to the agent
app.post('/chat', async (req, res) => {
  const { sessionId, message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  // Resolve or create session
  const sid = getOrCreateSession(sessionId);
  const session = sessions.get(sid);

  try {
    // Call OpenClaw gateway — create a new message in the session
    const gatewayRes = await fetch(`${CFG.gatewayUrl}/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CFG.apiToken}`,
      },
      body: JSON.stringify({
        agentId: CFG.agentId,
        sessionKey: `web:${sid}`,
        message,
      }),
    });

    if (!gatewayRes.ok) {
      const err = await gatewayRes.text();
      console.error('Gateway error:', gatewayRes.status, err);
      return res.status(502).json({ error: 'Agent unavailable', detail: err });
    }

    const data = await gatewayRes.json();
    session.messageCount += 1;

    res.json({
      sessionId: sid,
      reply: data.reply || data.message || data.content || JSON.stringify(data),
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to reach agent', detail: err.message });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────
app.listen(CFG.port, () => {
  console.log(`Gold Country IT Chat API running on port ${CFG.port}`);
  console.log(`Gateway: ${CFG.gatewayUrl}`);
  console.log(`Agent:   ${CFG.agentId}`);
  console.log(`Session TTL: ${CFG.sessionTTL / 1000 / 60} min`);
});
