const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createDocument,
  getMyDocuments,
  getDocumentById,
  shareDocument
} = require('../controllers/documentController');

router.post('/', protect, createDocument);
router.get('/', protect, getMyDocuments);
router.get('/:id', protect, getDocumentById);
router.post('/:id/share', protect, shareDocument);

module.exports = router;