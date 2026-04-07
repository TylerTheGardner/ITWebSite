/**
 * ChatbotWidget — placeholder for OpenClaw AI agent integration.
 *
 * To embed the chatbot, replace the contents of this component with
 * the embed code or SDK initialization provided by your agent platform.
 *
 * Common integration patterns:
 *   1. Script-tag embed: add the <script> tag in index.html and trigger
 *      the widget via a global method (e.g., window.OpenClaw.open()).
 *   2. React SDK: import and render the provider/widget component here.
 *   3. iframe embed: render an <iframe> pointing to your agent's hosted URL.
 *
 * The floating button below is a stub — wire it up once the SDK is ready.
 */

import { useState } from 'react'
import './ChatbotWidget.css'

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)

  // TODO: replace stub panel with real agent embed
  return (
    <>
      <button
        className="chatbot-trigger"
        onClick={() => setOpen(o => !o)}
        aria-label="Chat with us"
        title="Chat with us"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="Chat">
          <div className="chatbot-panel__header">
            <span>💬 Gold Country IT Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </div>
          <div className="chatbot-panel__body">
            <p>AI assistant coming soon!</p>
            <p>
              In the meantime, reach us at{' '}
              <a href="mailto:tylerthegardner@gmail.com">tylerthegardner@gmail.com</a>{' '}
              or <a href="tel:+13036537381">(303) 653-7381</a>.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
