# Gold Country IT — Chatbot Setup Guide

## What Was Built

- **Narrow agent** — `gold-country-it-chat` pre-sales agent with a warm, sunny personality. Answers questions about services, pricing, and availability. Stays in scope.
- **API server** — Express.js proxy that handles multi-user sessions and forwards messages to the OpenClaw gateway.
- **React chat widget** — Floating chat button (bottom-right) on the Contact page. Streams responses from the agent.

---

## Architecture

```
Browser (Contact page)
    ↓  POST /chat { message, sessionId }
    ↓
API Server (src/api/server.js) — handles sessions
    ↓  HTTP POST to gateway
    ↓
OpenClaw Gateway (127.0.0.1:18789)
    ↓
Narrow Agent (gold-country-it-chat)
```

---

## Setup

### 1. Register the narrow agent with OpenClaw

Copy the agent config into your OpenClaw agents directory:

```
openclaw agents add C:\Users\Tyler\.openclaw\agents\gold-country-it-chat.json
```

Or manually add it via the OpenClaw control UI.

### 2. Install and start the API server

```bash
cd src/api
npm install

# Start the server (runs on port 3001 by default)
node server.js

# Or for development with auto-reload:
npm run dev
```

### 3. Expose the gateway for external access

The API server calls `127.0.0.1:18789` — if you want the website to work from outside your local network, you need to expose the gateway.

**Option A — Cloudflare Tunnel (recommended, free):**
```bash
cloudflared tunnel --url http://127.0.0.1:18789
# Copy the *.trycloudflare.com URL → set as OPENCLAW_GATEWAY_URL in src/api/.env
```

**Option B — Tailscale (you already have this set up):**
Your gateway is already configured with Tailscale in serve mode. The Tailscale URL would be:
`http://100.82.x.x:18789` (your Tailscale IP)

**Option C — ngrok:**
```bash
ngrok http 18789
# Copy the https://*.ngrok.io URL → set as OPENCLAW_GATEWAY_URL in src/api/.env
```

### 4. Update the API URL for production

When deploying the API server publicly, update `VITE_API_URL` in `.env` to point to your live API server URL.

---

## Running Locally

```bash
# Terminal 1 — API server
cd src/api
node server.js

# Terminal 2 — React dev server
npm run dev
```

Then open `http://localhost:5173/contact` and try the chat.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/ChatbotWidget.jsx` | React chat widget (already in Contact page) |
| `src/components/ChatbotWidget.css` | Widget styles |
| `src/api/server.js` | Express proxy + session manager |
| `src/api/package.json` | API server dependencies |
| `src/api/.env` | API config (gateway URL, token, agent ID) |
| `.env` | Vite env — `VITE_API_URL` for the React widget |
| `C:\Users\Tyler\.openclaw\agents\gold-country-it-chat.json` | Narrow agent definition |

---

## Exposing the API Server

For the website to reach the API from a deployed domain:

1. Deploy `src/api/server.js` to a hosting platform (Railway, Render, Fly.io, or a $5 VPS)
2. Set the environment variables (`OPENCLAW_GATEWAY_URL`, `OPENCLAW_API_TOKEN`, `AGENT_ID`) in your host's dashboard
3. Update `VITE_API_URL` in the React app's deployed `.env` to point to your API URL
4. Rebuild and redeploy the React site

---

## Multi-User Sessions

- Each browser tab gets a unique `sessionId` (UUID), stored in React state
- Sessions expire after 30 minutes of inactivity (configurable via `SESSION_TTL_MS`)
- Sessions are stored in-memory on the API server (no database needed for low traffic)
- For production/high traffic, replace the in-memory `Map` with Redis

---

## Customizing the Agent

Edit `C:\Users\Tyler\.openclaw\agents\gold-country-it-chat.json` to change:
- System prompt (tone, scope, services)
- Model selection
- Response behavior

Restart the gateway after editing the agent config.
