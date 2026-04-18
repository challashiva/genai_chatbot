import { useCallback } from 'react'
import useChatStore from '../store/chatStore'
import { streamChat } from '../api/chat'

/**
 * useChat — custom hook that combines the store + API into one clean interface.
 *
 * Components call this hook to:
 *   - Read messages
 *   - Send a new message (triggers streaming)
 *   - Clear the chat
 *
 * Why a custom hook?
 * It keeps components clean — they just call sendMessage() without knowing
 * anything about fetch, SSE, or Zustand internals.
 */
export function useChat() {
  const {
    messages,
    isLoading,
    error,
    addMessage,
    startAssistantMessage,
    appendToLastMessage,
    finishStreaming,
    setError,
    clearError,
    clearChat,
    getMessages,
  } = useChatStore()

  /**
   * sendMessage — the main action.
   * 1. Adds the user message to the store
   * 2. Creates an empty assistant bubble
   * 3. Starts streaming — each chunk fills in that bubble
   */
  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || isLoading) return

    // Step 1: Add user message to store (UI shows it immediately)
    addMessage('user', userText)

    // Step 2: Create the empty assistant bubble
    startAssistantMessage()

    // Step 3: Get the current messages AFTER adding the user message
    // We call getMessages() here because state updates are async
    const currentMessages = getMessages()

    // Step 4: Start streaming from the backend
    await streamChat({
      messages: currentMessages,
      onChunk: appendToLastMessage,
      onDone: finishStreaming,
      onError: setError,
    })
  }, [isLoading, addMessage, startAssistantMessage, appendToLastMessage, finishStreaming, setError, getMessages])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    clearError,
  }
}
