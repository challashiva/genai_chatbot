/**
 * MessageBubble — renders one chat message (user or assistant)
 *
 * Props:
 *   role    — "user" | "assistant"
 *   content — the message text
 */
export function MessageBubble({ role, content }) {
  const isUser = role === 'user'

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
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            marginRight: '8px',
            flexShrink: 0,
            marginTop: '4px',
          }}
        >
          🤖
        </div>
      )}

      <div
        style={{
          maxWidth: '75%',
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser
            ? 'linear-gradient(135deg, #667eea, #764ba2)'
            : '#f0f0f0',
          color: isUser ? '#fff' : '#1a1a1a',
          fontSize: '15px',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',     // preserves line breaks from AI
          wordBreak: 'break-word',
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        }}
      >
        {content}
      </div>
    </div>
  )
}
