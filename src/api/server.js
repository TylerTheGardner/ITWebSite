/**
 * src/api/server.js
 * Express API bridge — proxies website chat requests to the OpenClaw gateway.
 *
 * Environment variables:
 *   PORT          — API server port (default 3001)
 *   GATEWAY_URL   — OpenClaw gateway URL (default http://127.0.0.1:18789)
 *   GATEWAY_TOKEN — OpenClaw auth token (from openclaw.json)
 *   AGENT_ID      — OpenClaw agent ID to use (default gold-country-it-chat)
 */

import express from 'express'
import crypto from 'crypto'

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3001
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://127.0.0.1:18789'
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || '400cdf5eee1ab60c79563908d78df0534ad8bea10a0d4db6'
const AGENT_ID = process.env.AGENT_ID || 'gold-country-it-chat'

// ─── Session Store (in-memory, expires after 30 min inactivity) ───────────────
const sessions = new Map()

function createSessionId() {
  return crypto.randomUUID()
}

function getOrCreateSession(sessionId) {
  if (!sessionId || !sessions.has(sessionId)) {
    const newId = createSessionId()
    sessions.set(newId, {
      id: newId,
      openclawSessionId: null,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    })
    return sessions.get(newId)
  }
  const session = sessions.get(sessionId)
  session.lastActiveAt = Date.now()
  return session
}

// ─── Session cleanup (30-min timeout) ────────────────────────────────────────
const SESSION_TTL_MS = 30 * 60 * 1000
setInterval(() => {
  const now = Date.now()
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActiveAt > SESSION_TTL_MS) {
      sessions.delete(id)
    }
  }
}, 60_000)

// ─── Routes ───────────────────────────────────────────────────────────────────

/** POST /api/sessions — create a new visitor session */
app.post('/api/sessions', (req, res) => {
  const session = getOrCreateSession()
  res.json({ sessionId: session.id })
})

/** GET /api/sessions/:sessionId — look up a session */
app.get('/api/sessions/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId)
  if (!session) return res.status(404).json({ error: 'Session not found or expired' })
  session.lastActiveAt = Date.now()
  res.json({ sessionId: session.id })
})

/** POST /api/sessions/:sessionId/chat — send a message and stream response */
app.post('/api/sessions/:sessionId/chat', async (req, res) => {
  const { message } = req.body
  const sessionId = req.params.sessionId

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '`message` is required (string)' })
  }

  const session = sessions.get(sessionId)
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired' })
  }
  session.lastActiveAt = Date.now()

  try {
    let endpoint, method, body

    if (session.openclawSessionId) {
      endpoint = `${GATEWAY_URL}/v1/sessions/${session.openclawSessionId}/messages`
      method = 'POST'
      body = { message }
    } else {
      const createRes = await fetch(`${GATEWAY_URL}/v1/sessions?agentId=${AGENT_ID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GATEWAY_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId: AGENT_ID }),
      })

      if (!createRes.ok) {
        const errText = await createRes.text()
        console.error('[gateway] session create failed:', createRes.status, errText)
        return res.status(502).json({ error: 'Failed to create gateway session', detail: errText })
      }

      const createData = await createRes.json()
      session.openclawSessionId = createData.sessionId || createData.id
      sessions.set(sessionId, session)

      endpoint = `${GATEWAY_URL}/v1/sessions/${session.openclawSessionId}/messages`
      method = 'POST'
      body = { message }
    }

    const gatewayRes = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!gatewayRes.ok) {
      const errText = await gatewayRes.text()
      console.error('[gateway] message send failed:', gatewayRes.status, errText)
      return res.status(502).json({ error: 'Failed to send message to gateway', detail: errText })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    gatewayRes.body.pipeTo(new WritableStream({
      write(chunk) { res.write(chunk) },
      close() { res.end() },
      abort(err) { console.error('[gateway] stream error:', err); res.end() },
    }))

  } catch (err) {
    console.error('[api] Unexpected error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Gold Country IT API server running on http://localhost:${PORT}`)
  console.log(`  → Gateway:  ${GATEWAY_URL}`)
  console.log(`  → Agent ID: ${AGENT_ID}`)
})
