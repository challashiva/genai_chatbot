# GenAI Chatbot — Phase 1

A streaming AI chatbot with a React frontend and Python FastAPI backend.

## Project Structure

```
chatbot-phase1/
├── frontend/          # React + Vite
└── backend/           # Python FastAPI
```

---

## 🚀 Setup & Run

### Step 1 — Backend

```bash
cd backend

# Create a virtual environment (keeps packages isolated)
python -m venv venv

# Activate it:
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# Now open .env and paste your Groq API key
```

Get your API key from: https://console.groq.com/

```bash
# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

✅ Backend running at: http://localhost:8000
📖 Auto-generated API docs at: http://localhost:8000/docs

---

### Step 2 — Frontend

Open a **new terminal tab**:

```bash
cd frontend

# Install Node packages
npm install

# Start the dev server
npm run dev
```

✅ Frontend running at: http://localhost:5173

---

## How It Works

```
User types message
       ↓
React adds it to Zustand store (UI shows immediately)
       ↓
useChat hook calls streamChat() in api/chat.js
       ↓
fetch() POST to /api/chat/stream  (proxied to FastAPI by Vite)
       ↓
FastAPI receives messages, calls Groq SDK with streaming
       ↓
Tokens stream back as Server-Sent Events: "data: Hello\n\n"
       ↓
React reads each SSE chunk, calls appendToLastMessage()
       ↓
Zustand store updates → React re-renders → user sees words appear
       ↓
[DONE] event received → isLoading = false
```

---

## Key Files to Study

| File | What to learn |
|------|---------------|
| `backend/app/services/ai_service.py` | How the Groq SDK streaming works |
| `backend/app/api/chat.py` | How FastAPI StreamingResponse + SSE works |
| `frontend/src/api/chat.js` | How to read SSE with fetch() in the browser |
| `frontend/src/store/chatStore.js` | How Zustand manages state |
| `frontend/src/hooks/useChat.js` | How a custom hook ties store + API together |

---

## Phase 2 Preview

Next you'll add:
- Login / Register pages
- JWT token auth
- User model with roles (admin / user / customer)
- ProtectedRoute component in React
- Role-based feature visibility

---

## Common Issues

**"Connection failed. Is the backend running?"**
→ Make sure `uvicorn` is running on port 8000

**"401 Unauthorized" from Groq**
→ Check your `.env` file has a valid `Groq_API_KEY`

**CORS errors in browser console**
→ Make sure you're accessing the frontend via `http://localhost:5173` (not opening the HTML file directly)
