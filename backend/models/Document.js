const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled Document',
  },
  content: {
    type: Buffer,
    default: null,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collaborators: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['editor', 'viewer'], default: 'editor' },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);