import path from 'path';
import { ZipArchive } from 'archiver';
import Case from '../models/Case.js';
import Evidence from '../models/Evidence.js';
import { buildCaseAnalysis } from '../services/aiService.js';
import { generateCaseReportPdf } from '../services/pdfService.js';
import { getFilePath, fileExists } from '../services/storageService.js';

export const createCase = async (req, res, next) => {
  try {
    const { title, issueType, userDescription, incidentDate, evidenceIds } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Case title is required.' });
    }

    if (!userDescription || !userDescription.trim()) {
      return res.status(400).json({ error: 'Please describe the dispute or situation.' });
    }

    // Verify all selected evidence belongs to the authenticated user
    let verifiedEvidenceIds = [];
    if (Array.isArray(evidenceIds) && evidenceIds.length > 0) {
      const ownedEvidence = await Evidence.find({
        _id: { $in: evidenceIds },
        userId: req.user._id,
      }).select('_id');
      verifiedEvidenceIds = ownedEvidence.map((e) => e._id);
    }

    const newCase = await Case.create({
      userId: req.user._id,
      title: title.trim(),
      issueType: issueType || 'Employment',
      userDescription: userDescription.trim(),
      incidentDate: incidentDate || '',
      evidenceIds: verifiedEvidenceIds,
      status: 'draft',
      aiAnalysis: {
        status: 'none',
      },
    });

    const populatedCase = await Case.findById(newCase._id).populate('evidenceIds');

    return res.status(201).json({
      message: 'Case successfully initialized.',
      case: populatedCase,
    });
  } catch (err) {
    next(err);
  }
};

export const getCases = async (req, res, next) => {
  try {
    const cases = await Case.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('evidenceIds', 'title category mimeType sha256 uploadTimestamp');

    return res.status(200).json({
      count: cases.length,
      cases,
    });
  } catch (err) {
    next(err);
  }
};

export const getCaseById = async (req, res, next) => {
  try {
    const caseDoc = await Case.findOne({
      _id: req.params.id,
      userId: req.user._id, // Strict ownership check
    }).populate('evidenceIds');

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found or access denied.' });
    }

    return res.status(200).json({
      case: caseDoc,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCase = async (req, res, next) => {
  try {
    const caseDoc = await Case.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found or access denied.' });
    }

    const { title, issueType, userDescription, incidentDate, evidenceIds, status, aiAnalysis } = req.body;

    if (title) caseDoc.title = title.trim();
    if (issueType) caseDoc.issueType = issueType;
    if (userDescription) caseDoc.userDescription = userDescription.trim();
    if (incidentDate !== undefined) caseDoc.incidentDate = incidentDate;
    if (status) caseDoc.status = status;

    if (Array.isArray(evidenceIds)) {
      // Verify ownership of all new evidence IDs
      const owned = await Evidence.find({
        _id: { $in: evidenceIds },
        userId: req.user._id,
      }).select('_id');
      caseDoc.evidenceIds = owned.map((e) => e._id);
    }

    // Allow user edits to narrative/analysis
    if (aiAnalysis && typeof aiAnalysis === 'object') {
      caseDoc.aiAnalysis = {
        ...caseDoc.aiAnalysis.toObject(),
        ...aiAnalysis,
      };
    }

    await caseDoc.save();

    const updated = await Case.findById(caseDoc._id).populate('evidenceIds');

    return res.status(200).json({
      message: 'Case updated successfully.',
      case: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const analyzeCase = async (req, res, next) => {
  try {
    const caseDoc = await Case.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('evidenceIds');

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found or access denied.' });
    }

    caseDoc.aiAnalysis.status = 'generating';
    await caseDoc.save();

    const { provider, analysis } = await buildCaseAnalysis(caseDoc, caseDoc.evidenceIds || []);

    caseDoc.aiAnalysis = {
      ...analysis,
      generatedAt: new Date(),
      provider,
      status: 'completed',
      errorMessage: null,
    };

    await caseDoc.save();

    return res.status(200).json({
      message: 'AI case analysis completed.',
      case: caseDoc,
    });
  } catch (err) {
    // If AI fails, update status gracefully without breaking the case record
    await Case.updateOne(
      { _id: req.params.id, userId: req.user._id },
      {
        $set: {
          'aiAnalysis.status': 'failed',
          'aiAnalysis.errorMessage': 'Case analysis is temporarily unavailable. Your evidence remains safely stored.',
        },
      }
    ).catch(() => {});

    return res.status(500).json({
      error: 'Case analysis is temporarily unavailable. Your evidence remains safely stored.',
      details: err.message,
    });
  }
};

export const exportCasePdf = async (req, res, next) => {
  try {
    const caseDoc = await Case.findOne({
      _id: req.params.id,
      userId: req.user._id, // Strict ownership check
    }).populate('evidenceIds');

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found or access denied.' });
    }

    const safeTitle = (caseDoc.title || 'Case').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const filename = `ProofPath_Report_${safeTitle}_${caseDoc._id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const pdfDoc = generateCaseReportPdf(caseDoc, caseDoc.evidenceIds || [], req.user);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    next(err);
  }
};

export const downloadCaseZip = async (req, res, next) => {
  try {
    const caseDoc = await Case.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('evidenceIds');

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found or access denied.' });
    }

    const safeTitle = (caseDoc.title || 'Case').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const zipFilename = `ProofPath_Case_Bundle_${safeTitle}_${caseDoc._id}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      if (!res.headersSent) res.status(500).json({ error: err.message });
    });

    archive.pipe(res);

    // 1. Generate and attach the Case Dossier PDF buffer
    const pdfDoc = generateCaseReportPdf(caseDoc, caseDoc.evidenceIds || [], req.user);
    const pdfChunks = [];
    pdfDoc.on('data', (chunk) => pdfChunks.push(chunk));
    await new Promise((resolve) => {
      pdfDoc.on('end', resolve);
      pdfDoc.end();
    });
    const pdfBuffer = Buffer.concat(pdfChunks);
    archive.append(pdfBuffer, { name: `ProofPath_Official_Case_Dossier_${safeTitle}.pdf` });

    // 2. Generate and attach INTEGRITY_MANIFEST.txt
    let manifest = `========================================================================\r\n`;
    manifest += `PROOFPATH OFFICIAL EVIDENTIARY CASE DOSSIER & INTEGRITY MANIFEST\r\n`;
    manifest += `========================================================================\r\n`;
    manifest += `Case Reference: ${caseDoc._id}\r\n`;
    manifest += `Case Title:     ${caseDoc.title}\r\n`;
    manifest += `Category:       ${caseDoc.issueType}\r\n`;
    manifest += `Generated On:   ${new Date().toISOString()}\r\n`;
    manifest += `Custodian:      ${req.user.fullName || 'Authorized User'} (${req.user.email || ''})\r\n\r\n`;

    if (caseDoc.aiAnalysis?.executiveBrief) {
      manifest += `EXECUTIVE LEGAL BRIEF & SUMMARY OF FACTS:\r\n`;
      manifest += `------------------------------------------------------------------------\r\n`;
      manifest += `${caseDoc.aiAnalysis.executiveBrief}\r\n\r\n`;
    }

    if (caseDoc.aiAnalysis?.legalClaims?.length > 0) {
      manifest += `FORMAL CAUSES OF ACTION / LEGAL CLAIMS:\r\n`;
      manifest += `------------------------------------------------------------------------\r\n`;
      caseDoc.aiAnalysis.legalClaims.forEach((claim, idx) => {
        manifest += `  Claim ${idx + 1}: ${claim}\r\n`;
      });
      manifest += `\r\n`;
    }

    manifest += `EXHIBIT LIST & SHA-256 INTEGRITY DIGESTS:\r\n`;
    manifest += `------------------------------------------------------------------------\r\n`;

    const evidenceList = caseDoc.evidenceIds || [];
    const proofAssessments = caseDoc.aiAnalysis?.evidenceProofAssessments || [];

    evidenceList.forEach((ev, idx) => {
      const refCode = `E-${String(idx + 1).padStart(3, '0')}`;
      const proof = proofAssessments.find((p) => p.evidenceRefCode === refCode);

      manifest += `[${refCode}] ${ev.title}\r\n`;
      manifest += `  Original File: ${ev.originalFilename} (${(ev.fileSize / 1024).toFixed(1)} KB)\r\n`;
      manifest += `  SHA-256 Seal:  ${ev.sha256}\r\n`;
      manifest += `  Vault Upload:  ${ev.uploadTimestamp || ev.createdAt}\r\n`;
      if (ev.metadata?.dateTimeOriginal) {
        manifest += `  EXIF Date:     ${ev.metadata.dateTimeOriginal}\r\n`;
      }
      if (ev.metadata?.hasGps && ev.metadata.gpsLatitude) {
        manifest += `  GPS Location:  ${ev.metadata.gpsLatitude}, ${ev.metadata.gpsLongitude}\r\n`;
      }
      if (proof) {
        manifest += `  Evidentiary Finding: ${proof.relevanceAndProof}\r\n`;
        manifest += `  Probative Value:    ${proof.probativeValue}\r\n`;
      }
      manifest += `------------------------------------------------------------------------\r\n`;

      // 3. Attach file if it exists in storage
      if (ev.storageKey && fileExists(ev.storageKey)) {
        const filePath = getFilePath(ev.storageKey);
        const ext = ev.originalFilename ? path.extname(ev.originalFilename) : '';
        const safeBase = (ev.title || 'evidence').replace(/[^a-zA-Z0-9_-]/g, '_');
        const entryName = `Exhibits/${refCode}_${safeBase}${ext}`;
        archive.file(filePath, { name: entryName });
      }
    });

    manifest += `\r\nTAMPER-EVIDENT NOTICE:\r\n`;
    manifest += `Each SHA-256 hash was calculated at the exact moment of initial vault upload.\r\n`;
    manifest += `Any alteration to file bytes will invalidate the corresponding SHA-256 seal.\r\n`;

    archive.append(manifest, { name: 'INTEGRITY_MANIFEST.txt' });

    await archive.finalize();
  } catch (err) {
    next(err);
  }
};

export const deleteCase = async (req, res, next) => {
  try {
    const deleted = await Case.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Case not found or access denied.' });
    }

    return res.status(200).json({
      message: 'Case record deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
