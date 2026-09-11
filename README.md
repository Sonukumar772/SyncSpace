# SyncSpace

A real-time collaborative document editor supporting simultaneous multi-user editing with live cursors and conflict-free merging — built with CRDTs (Yjs) instead of naive last-write-wins.

🔗 **Live demo**: https://syncspace-frontend-zzw3.onrender.com
> Note: the backend is on Render's free tier and may take 30-50 seconds to wake up on first load.

## Features
- Real-time collaborative editing with zero merge conflicts (Yjs CRDT)
- Live cursors with collaborator names and colors
- Live presence indicator ("X people editing")
- JWT-based authentication (signup/login)
- Role-based document access — owner, editor, viewer
- Document sharing by email with role assignment
- Persistent storage of documents and their edit history (MongoDB)

## Tech Stack
**Frontend:** React, TypeScript, Tiptap, Yjs, Socket.io-client
**Backend:** Node.js, Express, Socket.io, y-socket.io
**Database:** MongoDB (Mongoose)
**Deployment:** Render

## Architecture
- Each document is a Yjs CRDT document. Edits are captured as Yjs updates and broadcast to all connected clients in that document's room via Socket.io.
- On first load of a document, previously saved Yjs state is loaded from MongoDB and applied to the in-memory Yjs doc; every subsequent update is persisted back to MongoDB.
- Presence and cursor data use Yjs Awareness, synced over the same Socket.io connection.

## Running Locally

### Backend
\`\`\`bash
cd backend
npm install
# create a .env file with MONGO_URI, JWT_SECRET, PORT
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
# create a .env file with VITE_API_URL=http://localhost:5000
npm run dev
\`\`\`

## Screenshots
*(add 2-3 screenshots or a short GIF of the live cursors / two-tab sync here — this makes a huge difference for recruiters skimming your repo)*