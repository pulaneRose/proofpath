import express from 'express';
import {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  analyzeCase,
  exportCasePdf,
  downloadCaseZip,
  deleteCase,
} from '../controllers/caseController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All case endpoints require authentication
router.use(authenticateToken);

router.post('/', createCase);
router.get('/', getCases);
router.get('/:id', getCaseById);
router.put('/:id', updateCase);
router.post('/:id/analyze', analyzeCase);
router.get('/:id/export', exportCasePdf);
router.get('/:id/download-zip', downloadCaseZip);
router.delete('/:id', deleteCase);

export default router;
