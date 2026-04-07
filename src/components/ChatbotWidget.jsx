/**
 * ChatbotWidget — Gold Country IT
 * Connects to the local API server which proxies to OpenClaw.
 */

import { useState, useEffect, useRef } from 'react'
import './ChatbotWidget.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const MAX_RETRIES = 2
const MAX_CHARS = 500 // aligned with widget UI limit

// Persist session ID across page reloads
function getStoredSessionId() {
  try { return sessionStorage.getItem('gcit_chat_sid') } catch { return null }
}
function setStoredSessionId(sid) {
  try { sessionStorage.setItem('gcit_chat_sid', sid) } catch {}
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState(getStoredSessionId)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Create a session on first open
  useEffect(() => {
    if (open && !sessionId) {
      fetch(`${API_BASE}/sessions`, { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          setSessionId(data.sessionId)
          setStoredSessionId(data.sessionId)
        })
        .catch(() => setError('Could not connect to chat server.'))
    }
  }, [open, sessionId])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const sendMessage = async (e, retryCount = 0) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    if (userMsg.length > MAX_CHARS) return // hard cap on UI side
    setInput('')
    setLoading(true)
    setError(null)

    // Append user message immediately
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userMsg }])

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: userMsg }),
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const data = await res.json()
      const reply = typeof data.reply === 'string'
        ? data.reply
        : JSON.stringify(data.reply || data)

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: reply }])
    } catch (err) {
      // Retry up to MAX_RETRIES times on network errors
      if (retryCount < MAX_RETRIES && (err.name === 'TypeError' || err.message?.includes('fetch'))) {
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)))
        return sendMessage(e, retryCount + 1)
      }
      setError('Failed to get a response. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        className="chatbot-trigger"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Chat with us'}
        title={open ? 'Close chat' : 'Chat with us'}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="Gold Country IT Assistant">
          <div className="chatbot-panel__header">
            <span>💬 Gold Country IT Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </div>

          <div className="chatbot-panel__messages">
            {messages.length === 0 && !loading && (
              <div className="chatbot-welcome">
                <p>👋 Hey there! I'm the Gold Country IT assistant.</p>
                <p>Ask me anything about our services, pricing, or how we can help your business.</p>
                <p className="chatbot-welcome__hint">Typical response time: a few seconds</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-msg chatbot-msg--${msg.role}`}>
                <div className="chatbot-msg__bubble">
                  {msg.text.split('\n').map((line, j) => (
                    <span key={j}>{line}<br/></span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-msg chatbot-msg--assistant">
                <div className="chatbot-msg__bubble chatbot-msg__bubble--typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            {error && (
              <div className="chatbot-error">{error}</div>
            )}

            <div ref={bottomRef} />
          </div>

          <form className="chatbot-panel__input" onSubmit={sendMessage}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask me anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              maxLength={MAX_CHARS}
            />
            <button type="submit" disabled={!input.trim() || loading} aria-label="Send">
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  )
}
