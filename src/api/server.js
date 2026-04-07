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
app.use(express.json({ limit: '16kb' }));

// ─── CORS — restrict to known origins ─────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST'],
  maxAge: 86400,
}));

// ─── Config ────────────────────────────────────────────────────────────
if (!process.env.OPENCLAW_API_TOKEN) {
  console.error('FATAL: OPENCLAW_API_TOKEN environment variable is required.');
  process.exit(1);
}
const CFG = {
  gatewayUrl: process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789',
  apiToken:   process.env.OPENCLAW_API_TOKEN,
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

// ─── Simple in-memory rate limiter ────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window

function checkRateLimit(key) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { windowStart: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', sessions: sessions.size });
});

// Create a new chat session
app.post('/sessions', (req, res) => {
  if (!checkRateLimit(req.ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }
  const sessionId = createSessionId();
  sessions.set(sessionId, {
    id: sessionId,
    createdAt: Date.now(),
    lastActive: Date.now(),
    messageCount: 0,
  });
  res.json({ sessionId });
});

// Send a message to the agent
app.post('/chat', async (req, res) => {
  const { sessionId, message } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
  }

  // Rate limit per session
  const sid = getOrCreateSession(sessionId);
  if (!checkRateLimit(`chat:${sid}`)) {
    return res.status(429).json({ error: 'Too many messages. Please wait a moment.' });
  }
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
      return res.status(502).json({ error: 'Agent unavailable' });
    }

    const data = await gatewayRes.json();
    session.messageCount += 1;

    res.json({
      sessionId: sid,
      reply: data.reply || data.message || data.content || JSON.stringify(data),
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to reach agent' });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────
app.listen(CFG.port, () => {
  console.log(`Gold Country IT Chat API running on port ${CFG.port}`);
  console.log(`Session TTL: ${CFG.sessionTTL / 1000 / 60} min`);
});
