import express from 'express';
import {
  uploadEvidence,
  getEvidenceList,
  getEvidenceById,
  getEvidenceFile,
  verifyEvidence,
  deleteEvidence,
} from '../controllers/evidenceController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadEvidenceMiddleware } from '../middleware/upload.js';

const router = express.Router();

// All evidence endpoints require authentication
router.use(authenticateToken);

router.post('/', uploadEvidenceMiddleware.single('file'), uploadEvidence);
router.get('/', getEvidenceList);
router.get('/:id', getEvidenceById);
router.get('/:id/file', getEvidenceFile);
router.post('/:id/verify', verifyEvidence);
router.delete('/:id', deleteEvidence);

export default router;
