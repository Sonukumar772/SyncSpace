const Document = require('../models/Document');
const User = require('../models/User');

// Create a new document
const createDocument = async (req, res) => {
  try {
    const newDoc = new Document({
      title: req.body.title || 'Untitled Document',
      owner: req.userId,
    });
    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all documents belonging to the logged-in user
const getMyDocuments = async (req, res) => {
  try {
    const docs = await Document.find({
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId },
      ],
    }).sort({ updatedAt: -1 });
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single document by ID
const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Share a document with another user
const shareDocument = async (req, res) => {
  try {
    const { email, role } = req.body;

    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }

    if (doc.owner.toString() !== req.userId) {
      return res.status(403).json({
        message: 'Only the owner can share this document'
      });
    }

    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({
        message: 'User with that email not found'
      });
    }

    const alreadyShared = doc.collaborators.find(
      (c) => c.user.toString() === userToAdd._id.toString()
    );

    if (alreadyShared) {
      alreadyShared.role = role;
    } else {
      doc.collaborators.push({
        user: userToAdd._id,
        role
      });
    }

    await doc.save();

    res.status(200).json(doc);

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};
module.exports = { createDocument, getMyDocuments, getDocumentById, shareDocument };