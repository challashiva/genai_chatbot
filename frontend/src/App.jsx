import { ChatWindow } from './components/ChatWindow'

/**
 * App — the root React component.
 *
 * Phase 1: Just the chat window, no routing, no auth.
 * Phase 2: We'll wrap this with React Router and a login page.
 */
function App() {
  return (
    <>
      {/* Global styles injected into the page */}
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: #f9fafb;
          color: #111;
        }

        /* Smooth fade-in for new messages */
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Bounce animation for typing dots */
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-6px); }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>

      <ChatWindow />
    </>
  )
}

export default App
