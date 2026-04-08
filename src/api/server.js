require('dotenv').config();

/**
 * Gold Country IT — Chat API Server (local dev)
 *
 * Mirrors the stateless Vercel function at api/chat.js so local dev
 * works without deploying. Exposes POST /api/chat.
 *
 * Environment variables (src/api/.env):
 *   OPENCLAW_GATEWAY_URL  — Gateway base URL (default: http://127.0.0.1:18789)
 *   OPENCLAW_API_TOKEN    — Gateway auth token
 *   AGENT_ID              — Agent ID (default: gold-country-it-chat)
 *   PORT                  — Server port (default: 3001)
 */

const express = require('express');
const cors    = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

const CFG = {
  gatewayUrl: process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789',
  apiToken:   process.env.OPENCLAW_API_TOKEN   || '',
  agentId:    process.env.AGENT_ID             || 'gold-country-it-chat',
  port:       parseInt(process.env.PORT        || '3001', 10),
};

app.get('/health', (_req, res) => res.json({ status: 'ok', agent: CFG.agentId }));

app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
  }
  if (!Array.isArray(history)) {
    return res.status(400).json({ error: 'history must be an array' });
  }

  const cleanHistory = history
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20);

  const messages = [...cleanHistory, { role: 'user', content: message }];

  try {
    const gatewayRes = await fetch(`${CFG.gatewayUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(CFG.apiToken && { Authorization: `Bearer ${CFG.apiToken}` }),
      },
      body: JSON.stringify({ model: `openclaw/${CFG.agentId}`, messages, max_tokens: 1024 }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!gatewayRes.ok) {
      const text = await gatewayRes.text().catch(() => '');
      throw new Error(`Gateway ${gatewayRes.status}: ${text.slice(0, 200)}`);
    }

    const data  = await gatewayRes.json();
    const reply = data.choices?.[0]?.message?.content || '';

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
      return res.status(504).json({ error: 'Request timed out. Please try again.' });
    }
    res.status(502).json({ error: 'Failed to reach agent', detail: err.message });
  }
});

app.listen(CFG.port, () => {
  console.log(`Gold Country IT Chat API (local) → http://localhost:${CFG.port}`);
  console.log(`Gateway: ${CFG.gatewayUrl} | Agent: ${CFG.agentId}`);
});
