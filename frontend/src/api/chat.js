/**
 * CHAT API — handles communication with the FastAPI backend
 *
 * We use the native fetch() API with a ReadableStream for SSE streaming.
 * Axios doesn't support SSE natively, so we use fetch here.
 */

const API_BASE = '/api'  // Proxied to http://localhost:8000 by Vite

/**
 * streamChat — sends messages to the backend and streams the response.
 *
 * @param {Array}    messages       - Full conversation history [{role, content}]
 * @param {Function} onChunk        - Called with each text token as it arrives
 * @param {Function} onDone         - Called when streaming finishes
 * @param {Function} onError        - Called if an error occurs
 * @param {string}   systemPrompt   - System instruction for the AI
 */
export async function streamChat({
  messages,
  onChunk,
  onDone,
  onError,
  systemPrompt = 'You are a helpful AI assistant.',
}) {
  try {
    // Open a fetch connection — this starts the HTTP request
    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, system_prompt: systemPrompt }),
    })
    // debugger;
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`)
    }

    // Get a reader for the response body stream
    const reader = response.body.getReader()
    const decoder = new TextDecoder()  // converts bytes → string

    // Read chunks in a loop until the stream closes
    while (true) {
      const { done, value } = await reader.read()
      if (done) break  // stream closed by server

      // Decode the bytes to text
      const text = decoder.decode(value, { stream: true })

      // SSE lines look like: "data: hello\n\n"
      // Split on double newline to get individual events
      const lines = text.split('\n\n')

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue  // skip empty lines

        const data = line.replace('data: ', '').trim()

        if (data === '[DONE]') {
          onDone()
          return
        }

        if (data.startsWith('[ERROR]')) {
          onError(data.replace('[ERROR] ', ''))
          return
        }

        // Regular text chunk — send to the store
        if (data) {
          // console.log('chunk:', data)
          onChunk(data)
        }
      }
    }
  } catch (err) {
    onError(err.message || 'Connection failed. Is the backend running?')
  }
}
