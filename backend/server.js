require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { YSocketIO } = require('y-socket.io/dist/server');
const Y = require('yjs');

const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const Document = require('./models/Document');

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' },
});

const ysocketio = new YSocketIO(io);

ysocketio.on('document-loaded', async (doc) => {
  const docId = doc.name.replace('syncspace-doc-', '');

  try {
    const savedDoc = await Document.findById(docId);

    if (savedDoc && savedDoc.content && savedDoc.content.length > 0) {
      Y.applyUpdate(doc, savedDoc.content);
    }
  } catch (err) {
    console.error('Error loading document:', err);
  }

  doc.on('update', async (update) => {
    try {
      await Document.findByIdAndUpdate(docId, {
        content: Buffer.from(update),
      });
    } catch (err) {
      console.error('Error saving document update:', err);
    }
  });
});

ysocketio.initialize();

app.get('/', (req, res) => {
  res.send('SyncSpace backend is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});