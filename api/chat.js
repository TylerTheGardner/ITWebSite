/**
 * Gold Country IT — Chat API (Vercel Serverless Function)
 *
 * Stateless: the client sends full conversation history with each request.
 * No session storage needed.
 *
 * Environment variables (set in Vercel dashboard):
 *   OPENCLAW_GATEWAY_URL  — publicly reachable gateway URL
 *   OPENCLAW_API_TOKEN    — gateway auth token
 *   AGENT_ID              — agent ID (default: gold-country-it-chat)
 */

const ALLOWED_ORIGINS = [
  'https://tylerthegardner.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
];

module.exports = async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
  const apiToken   = process.env.OPENCLAW_API_TOKEN   || '';
  const agentId    = process.env.AGENT_ID             || 'gold-country-it-chat';

  // Sanitize and cap history, then append the new user message
  const cleanHistory = history
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20);

  const messages = [...cleanHistory, { role: 'user', content: message }];

  try {
    const gatewayRes = await fetch(`${gatewayUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiToken && { Authorization: `Bearer ${apiToken}` }),
      },
      body: JSON.stringify({ model: `openclaw/${agentId}`, messages, max_tokens: 1024 }),
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
    res.status(502).json({ error: 'Failed to reach agent' });
  }
};
