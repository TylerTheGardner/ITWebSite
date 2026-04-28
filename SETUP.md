# Gold Country IT Chat Setup

## What Was Built

### Files created

| File | Purpose |
|------|---------|
| `src/agents/gold-country-it-chat.json` | Narrow pre-sales agent config |
| `src/api/server.js` | Express API bridge (session + streaming) |
| `src/components/ChatbotWidget.jsx` | React chat widget |
| `src/components/ChatbotWidget.css` | Widget styles |

---

## 1. Register the Agent with OpenClaw

The gateway needs to know about the `gold-country-it-chat` agent. Run this from the ITWebSite directory:

```bash
cd C:\Users\Tyler\Documents\GitHub\ITWebSite
openclaw agents add src/agents/gold-country-it-chat.json
```

Or, from any directory:
```bash
openclaw agents add "C:\Users\Tyler\Documents\GitHub\ITWebSite\src\agents\gold-country-it-chat.json"
```

---

## 2. Start the API Server

The API bridge proxies website chat requests to the local OpenClaw gateway and manages visitor sessions.

```bash
# Install express (first time only)
npm install express

# Start the server
node src/api/server.js
```

**Environment variables** (optional, defaults work for local dev):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API server port |
| `GATEWAY_URL` | `http://127.0.0.1:18789` | OpenClaw gateway URL |
| `GATEWAY_TOKEN` | `400cdf5e…` | Auth token (from openclaw.json) |
| `AGENT_ID` | `gold-country-it-chat` | OpenClaw agent ID |

**For production**, set `VITE_API_URL` in your React build to your deployed API server URL. In development, the widget defaults to `http://localhost:3001`.

---

## 3. Configure Gateway for External Access

The gateway runs at `127.0.0.1:18789` (loopback only). To receive traffic from your website, you need to expose it.

### Option A — Tailscale (recommended)

Tailscale is already configured in your gateway config (`"tailscale": { "mode": "serve" }`).

1. Install and authenticate Tailscale on the gateway machine if not already done.
2. Run: `openclaw gateway restart`
3. Get your Tailscale hostname: `tailscale status`
4. Set `GATEWAY_URL=https://your-tailscale-hostname:18789` in the API server environment.
5. Set `VITE_API_URL=https://your-api-server-hostname:3001` in the React app.

### Option B — ngrok (quick dev/testing)

```bash
ngrok http 18789 --domain=your-domain.ngrok-free.app
# or just
ngrok http 18789
```

Use the ngrok HTTPS URL as `GATEWAY_URL`.

### Option C — Cloudflare Tunnel

```bash
cloudflared tunnel --url http://127.0.0.1:18789
```

---

## 4. Add the Widget to Your Site

The widget is already integrated in `Contact.jsx` via `<ChatbotWidget />`. To add it **site-wide** (appears on every page), add it to `App.jsx`:

```jsx
// src/App.jsx
import ChatbotWidget from './components/ChatbotWidget'

// In the JSX, anywhere inside the fragment (before </>):
<ChatbotWidget />
```

To limit it to just the Contact page, it already is there. ✓

---

## 5. Local Testing Checklist

```bash
# 1. Start OpenClaw gateway (should already be running)
openclaw gateway status

# 2. Start the API server
node src/api/server.js
# Output: Gold Country IT API server running on http://localhost:3001

# 3. Start the React dev server
npm run dev

# 4. Visit http://localhost:5173 (or your Vite port)
#    Click 💬 in the bottom-right corner
#    You should see the welcome message
#    Type a message and get a streaming response
```

### Test the API directly:

```bash
# Create a session
curl -X POST http://localhost:3001/api/sessions
# Returns: { "sessionId": "abc-123" }

# Send a chat message
curl -X POST http://localhost:3001/api/sessions/abc-123/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"What services do you offer?\"}"
```

---

## React Widget Props / Configuration

The widget reads from these environment variables (Vite):

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001` | API bridge base URL |

Set in a `.env.local` file:
```
VITE_API_URL=http://localhost:3001
```

For production (GitHub Pages + deployed API):
```
VITE_API_URL=https://your-api-server.com
```

---

## Session Model

- Each browser **tab** gets its own `sessionId` stored in `localStorage`
- Sessions expire **30 minutes** after last activity (server-side cleanup)
- Each visitor session is **independent** — no cross-contamination of context
- The API server maintains a map: `visitorSessionId → openclawSessionId`

---

## Production Deployment Notes

- The React widget makes direct API calls to `/api` — those must be proxied through a CDN or the API server must be publicly accessible.
- The API server holds session state in memory — for multiple API server instances, move session storage to Redis or a database.
- The `GATEWAY_TOKEN` should be stored as a secret, not hardcoded — use environment variables in production.
