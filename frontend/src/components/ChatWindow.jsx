import { useState, useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'

/**
 * ChatWindow — the main chat UI component.
 *
 * Responsibilities:
 * - Show all messages (scrollable)
 * - Show typing indicator while AI responds
 * - Show error banner if something goes wrong
 * - Handle user input (textarea + send button)
 * - Auto-scroll to bottom as new tokens stream in
 */
const MAX_CHARS = 2000;
const WARN_THRESHOLD = 1800;
export function ChatWindow() {
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef(null)   // for auto-scrolling
  const textareaRef = useRef(null)

  // Pull everything we need from our custom hook
  const { messages, isLoading, error, sendMessage, clearChat, clearError } = useChat()

  // Auto-scroll to bottom whenever messages change (including during streaming)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle form submission
  const handleSend = async () => {
    const text = inputText.trim()
    if (!text || isLoading) return

    setInputText('')      
    // clear the input immediately
    //reset height after clearing the input
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    await sendMessage(text)   // this triggers the streaming
  }

  // Allow Enter to send (Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          }}>🤖</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px', color: '#111' }}>AI Assistant</div>
            <div style={{ fontSize: '12px', color: '#22c55e' }}>● Online</div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            style={{
              background: 'none', border: '1px solid #e5e7eb',
              borderRadius: '8px', padding: '6px 12px',
              fontSize: '13px', color: '#666', cursor: 'pointer',
            }}
          >
            Clear chat
          </button>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          background: '#fef2f2', borderBottom: '1px solid #fecaca',
          padding: '10px 20px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '14px', color: '#dc2626' }}>⚠️ {error}</span>
          <button
            onClick={clearError}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '18px' }}
          >×</button>
        </div>
      )}

      {/* ── Messages Area ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: '#fafafa',
      }}>
        {/* Empty state */}
        {isEmpty && (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '12px',
            color: '#9ca3af',
          }}>
            <div style={{ fontSize: '48px' }}>💬</div>
            <div style={{ fontSize: '18px', fontWeight: 500, color: '#6b7280' }}>
              Start a conversation
            </div>
            <div style={{ fontSize: '14px', textAlign: 'center', maxWidth: '300px' }}>
              Type a message below and the AI will respond in real time.
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            role={msg.role}
            content={msg.content}
          />
        ))}

        {/* Typing indicator — only shown when loading but last message is already showing */}
        {isLoading && messages[messages.length - 1]?.content === '' && (
          <TypingIndicator />
        )}

        {/* Invisible div at the bottom — we scroll here */}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        background: '#fff',
        padding: '16px 20px',
      }}>
        <p style={{ color: inputText.length > WARN_THRESHOLD ? "red" : "gray" }}>
        {inputText.length} / {MAX_CHARS}
        </p>
        <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
      }}>
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value)
              // Reset to auto first so it can SHRINK when text is deleted
              e.target.style.height = 'auto'
              // Then set to content height, capped at 6 rows (6 × 24px line-height = 144px)
              e.target.style.height = Math.min(e.target.scrollHeight, 144) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            disabled={isLoading}
            //rows={1}
            style={{
              flex: 1,
              resize: 'none',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '15px',
              fontFamily: 'inherit',
              outline: 'none',
              lineHeight: '1.5',
              maxHeight: '120px',
              overflowY: 'auto',
              background: isLoading ? '#f9fafb' : '#fff',
              color: '#111',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />

          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              border: 'none',
              background: isLoading || !inputText.trim()
                ? '#e5e7eb'
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff',
              fontSize: '18px',
              cursor: isLoading || !inputText.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            {isLoading ? '⏳' : '➤'}
          </button>
          </div>
      </div>
    </div>
  )
}
