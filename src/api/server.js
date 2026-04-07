/**
 * Gold Country IT — Chat API Server
 *
 * Proxies chat requests to the OpenClaw gateway's OpenAI-compatible
 * /v1/chat/completions endpoint. Handles multi-user session management.
 *
 * Usage:
 *   node server.js
 *
 * Environment variables:
 *   OPENCLAW_GATEWAY_URL  — Gateway base URL (default: http://127.0.0.1:18789)
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

// --- Config ----------------------------------------------------------------
const CFG = {
  gatewayUrl:  process.env.OPENCLAW_GATEWAY_URL  || 'http://127.0.0.1:18789',
  apiToken:    process.env.OPENCLAW_API_TOKEN     || '',
  agentId:     process.env.AGENT_ID              || 'gold-country-it-chat',
  port:        parseInt(process.env.PORT || '3001', 10),
  sessionTTL:  parseInt(process.env.SESSION_TTL_MS || '1800000', 10),
};

// --- In-memory session store ------------------------------------------------
const sessions = new Map();

function createSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

function getOrCreateSession(sessionId) {
  if (!sessionId || !sessions.has(sessionId)) {
    sessionId = createSessionId();
  }
  const now = Date.now();
  const existing = sessions.get(sessionId);
  const session = existing || {
    id: sessionId,
    createdAt: now,
    lastActive: now,
    messageCount: 0,
    history: [],
  };
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

// --- Rate limiter -----------------------------------------------------------
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(key) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { windowStart: now, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= RATE_LIMIT_MAX;
}

// --- Send message to gateway via /v1/chat/completions -----------------------
async function sendToGateway(session, userMessage) {
  // Build conversation history in OpenAI format
  session.history.push({ role: 'user', content: userMessage });

  // Cap history to last 20 messages to keep context manageable
  const recentHistory = session.history.slice(-20);

  const body = {
    model: `openclaw/${CFG.agentId}`,
    messages: recentHistory,
    max_tokens: 1024,
  };

  const res = await fetch(`${CFG.gatewayUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CFG.apiToken}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gateway returned ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || '';

  // Store assistant reply in history
  session.history.push({ role: 'assistant', content: reply });

  return reply;
}

// --- Routes -----------------------------------------------------------------

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    sessions: sessions.size,
    agent: CFG.agentId,
  });
});

app.post('/sessions', (_req, res) => {
  const sessionId = createSessionId();
  sessions.set(sessionId, {
    id: sessionId,
    createdAt: Date.now(),
    lastActive: Date.now(),
    messageCount: 0,
    history: [],
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
    const reply = await sendToGateway(session, message);
    session.messageCount += 1;
    res.json({ sessionId: sid, reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
      res.status(504).json({ error: 'Request timed out. Please try again.' });
    } else {
      res.status(502).json({ error: 'Failed to reach agent', detail: err.message });
    }
  }
});

// --- Start ------------------------------------------------------------------
app.listen(CFG.port, () => {
  console.log(`Gold Country IT Chat API running on port ${CFG.port}`);
  console.log(`Gateway:  ${CFG.gatewayUrl}/v1/chat/completions`);
  console.log(`Agent:    ${CFG.agentId}`);
});
