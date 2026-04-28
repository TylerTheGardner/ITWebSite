/**
 * ChatbotWidget — Gold Country IT website chat widget.
 * Uses the local API bridge (/api) which proxies to the OpenClaw gateway.
 * Each browser tab gets its own session stored in localStorage.
 */

import { useState, useEffect, useRef } from 'react'
import './ChatbotWidget.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const SESSION_KEY = 'gc_it_session_id'

function getSessionId() {
  return localStorage.getItem(SESSION_KEY)
}
function setSessionId(id) {
  localStorage.setItem(SESSION_KEY, id)
}

async function createSession() {
  const res = await fetch(`${API_BASE}/api/sessions`, { method: 'POST' })
  const data = await res.json()
  setSessionId(data.sessionId)
  return data.sessionId
}

async function sendMessage(sessionId, message) {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  return res
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionIdState] = useState(() => getSessionId())
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  // Auto-open session on first open
  useEffect(() => {
    if (open && !sessionId) {
      createSession()
        .then(id => setSessionIdState(id))
        .catch(() => setError('Could not connect to chat server.'))
    }
  }, [open, sessionId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || !sessionId || loading) return

    const userMsg = { role: 'user', text: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await sendMessage(sessionId, userMsg.text)

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Server error')
      }

      // Read SSE stream
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      // Add assistant placeholder
      setMessages(prev => [...prev, { role: 'assistant', text: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        // Update last message with accumulated text
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', text: fullText }
          return updated
        })
      }

    } catch (err) {
      setError(err.message || 'Failed to get a response. Please try again.')
      // Remove failed user message and show error inline
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  function handleToggle() {
    setOpen(o => !o)
    setError(null)
  }

  return (
    <>
      <button className="chatbot-trigger" onClick={handleToggle} aria-label="Chat with us">
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="Gold Country IT Chat">
          <div className="chatbot-panel__header">
            <span>💬 Gold Country IT Assistant</span>
            <button onClick={handleToggle} aria-label="Close chat">✕</button>
          </div>

          <div className="chatbot-panel__messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <p>👋 Hey there! I'm the Gold Country IT assistant.</p>
                <p>I can help with questions about our services, pricing, or availability. What are you working on?</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg--${msg.role}`}>
                <div className="chatbot-msg__bubble">{msg.text || (msg.role === 'assistant' && loading ? '…' : '')}</div>
              </div>
            ))}

            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="chatbot-msg chatbot-msg--assistant">
                <div className="chatbot-msg__bubble chatbot-msg__bubble--typing">
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                </div>
              </div>
            )}

            {error && (
              <div className="chatbot-error">{error}</div>
            )}

            <div ref={bottomRef} />
          </div>

          <form className="chatbot-panel__form" onSubmit={handleSend}>
            <input
              type="text"
              className="chatbot-panel__input"
              placeholder="Ask me anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="chatbot-panel__send"
              disabled={!input.trim() || loading}
              aria-label="Send"
            >
              ⏎
            </button>
          </form>
        </div>
      )}
    </>
  )
}
