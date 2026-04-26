/**
 * MessageBubble — renders one chat message (user or assistant)
 *
 * Props:
 *   role    — "user" | "assistant"
 *   content — the message text
 */

import { useState } from 'react'

export function MessageBubble({ role, content }) {
  const isUser = role === 'user'

  // Local state — only this bubble needs to know if it was just copied
  // After 2 seconds, resets back to false automatically
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)  // reset after 2s
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
        animation: 'fadeSlideIn 0.2s ease',
      }}
    >
      {/* Avatar — only shown for assistant */}
      {!isUser && (
        <div
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', marginRight: '8px', flexShrink: 0, marginTop: '4px',
          }}
        >
          🤖
        </div>
      )}

      {/* Bubble + copy button wrapped together */}
      <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>

        {/* Message bubble */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isUser ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f0f0f0',
            color: isUser ? '#fff' : '#1a1a1a',
            fontSize: '15px', lineHeight: '1.6',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}
        >
          {content}
        </div>

        {/* Copy button — ONLY for assistant messages */}
        {!isUser && (
          <button
            onClick={handleCopy}
            style={{
              marginTop: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              color: copied ? '#16a34a' : '#9ca3af',
              padding: '2px 4px',
              borderRadius: '4px',
              transition: 'color 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}