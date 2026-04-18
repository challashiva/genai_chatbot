import { create } from 'zustand'

/**
 * CHAT STORE — Global state for the conversation
 *
 * Zustand is like a simple box that any component can read from or write to.
 * No prop drilling, no Context boilerplate.
 *
 * State shape:
 *   messages  — array of { role, content } objects (the full conversation)
 *   isLoading — true while AI is streaming a response
 *   error     — error message string, or null
 */
const useChatStore = create((set, get) => ({
  // --- STATE ---
  messages: [],       // [{ role: "user", content: "..." }, { role: "assistant", content: "..." }]
  isLoading: false,   // shows the typing indicator
  error: null,        // shows error banner if set

  // --- ACTIONS ---

  /**
   * addMessage — append a new message to the conversation
   * Called when the user submits their message.
   */
  addMessage: (role, content) => {
    set((state) => ({
      messages: [...state.messages, { role, content }],
    }))
  },

  /**
   * startAssistantMessage — add an empty assistant message that we'll fill in
   * Called right before streaming starts. Creates the bubble that gets filled.
   */
  startAssistantMessage: () => {
    set((state) => ({
      messages: [...state.messages, { role: 'assistant', content: '' }],
      isLoading: true,
      error: null,
    }))
  },

  /**
   * appendToLastMessage — adds a text chunk to the last message
   * Called on every SSE token as it streams in from the backend.
   */
  appendToLastMessage: (chunk) => {
    set((state) => {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      // Replace \n escape sequences back to real newlines
      const text = chunk.replace(/\\n/g, '\n')
      messages[messages.length - 1] = {
        ...last,
        content: last.content + text,
      }
      return { messages }
    })
  },

  /**
   * finishStreaming — called when [DONE] arrives from the backend
   */
  finishStreaming: () => {
    set({ isLoading: false })
  },

  /**
   * setError — show an error message and stop loading
   */
  setError: (message) => {
    set({ error: message, isLoading: false })
  },

  /**
   * clearError — dismiss the error banner
   */
  clearError: () => {
    set({ error: null })
  },

  /**
   * clearChat — reset to empty conversation
   */
  clearChat: () => {
    set({ messages: [], isLoading: false, error: null })
  },

  /**
   * getMessages — helper to read current messages (used in hooks)
   */
  getMessages: () => get().messages,
}))

export default useChatStore
