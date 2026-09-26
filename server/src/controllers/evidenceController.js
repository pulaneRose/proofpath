import path from 'path';
import fs from 'fs';
import Evidence from '../models/Evidence.js';
import Case from '../models/Case.js';
import { calculateFileSha256, verifyFileIntegrity } from '../services/hashService.js';
import { extractEvidenceMetadata } from '../services/metadataService.js';
import { getFilePath, deleteFile } from '../services/storageService.js';

export const uploadEvidence = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No evidence file uploaded.' });
    }

    const { title, description, category, tags } = req.body;

    if (!title || !title.trim()) {
      // Remove uploaded file if validation fails
      await deleteFile(req.file.filename);
      return res.status(400).json({ error: 'Evidence title is required.' });
    }

    const filePath = req.file.path;

    // 1. Calculate SHA-256 cryptographic hash of stored file
    const sha256 = await calculateFileSha256(filePath);

    // 2. Extract available EXIF/GPS/TIFF metadata
    const metadata = await extractEvidenceMetadata(filePath, req.file.mimetype);

    // 3. Process tags
    let processedTags = [];
    if (typeof tags === 'string') {
      processedTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
    } else if (Array.isArray(tags)) {
      processedTags = tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
    }

    // 4. Save evidence document with authenticated user ID
    const evidence = await Evidence.create({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category || 'Other',
      tags: processedTags,
      originalFilename: req.file.originalname,
      storageKey: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      sha256,
      uploadTimestamp: new Date(),
      metadata,
    });

    return res.status(201).json({
      message: 'Evidence successfully preserved in private vault.',
      evidence,
    });
  } catch (err) {
    if (req.file) {
      await deleteFile(req.file.filename).catch(() => {});
    }
    next(err);
  }
};

export const getEvidenceList = async (req, res, next) => {
  try {
    const { category, type, search, tag } = req.query;
    const query = { userId: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (tag) {
      query.tags = tag.toLowerCase().trim();
    }

    if (type && type !== 'All') {
      if (type.toLowerCase() === 'images') {
        query.mimeType = { $regex: '^image/', $options: 'i' };
      } else if (type.toLowerCase() === 'documents') {
        query.mimeType = { $regex: 'pdf|document', $options: 'i' };
      }
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { originalFilename: { $regex: s, $options: 'i' } },
        { tags: { $in: [new RegExp(s, 'i')] } },
      ];
    }

    const items = await Evidence.find(query).sort({ uploadTimestamp: -1 });

    return res.status(200).json({
      count: items.length,
      evidence: items,
    });
  } catch (err) {
    next(err);
  }
};

export const getEvidenceById = async (req, res, next) => {
  try {
    const evidence = await Evidence.findOne({
      _id: req.params.id,
      userId: req.user._id, // Strict ownership check
    });

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence record not found or access denied.' });
    }

    // Find cases that reference this evidence
    const linkedCases = await Case.find({
      userId: req.user._id,
      evidenceIds: evidence._id,
    }).select('_id title issueType status createdAt');

    return res.status(200).json({
      evidence,
      linkedCases,
    });
  } catch (err) {
    next(err);
  }
};

export const getEvidenceFile = async (req, res, next) => {
  try {
    const evidence = await Evidence.findOne({
      _id: req.params.id,
      userId: req.user._id, // Strict ownership check
    });

    if (!evidence) {
      return res.status(403).json({ error: 'You do not have permission to access this evidence file.' });
    }

    const filePath = getFilePath(evidence.storageKey);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Stored evidence file could not be located in vault storage.' });
    }

    const isDownload = req.query.download === 'true';

    res.setHeader('Content-Type', evidence.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(evidence.originalFilename)}"`
    );
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};

export const verifyEvidence = async (req, res, next) => {
  try {
    const evidence = await Evidence.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence record not found or access denied.' });
    }

    const filePath = getFilePath(evidence.storageKey);
    const result = await verifyFileIntegrity(filePath, evidence.sha256);

    return res.status(200).json({
      valid: result.valid,
      status: result.valid ? 'Integrity check passed' : 'Integrity mismatch detected',
      message: result.valid
        ? 'The current cryptographic hash matches the original SHA-256 hash recorded upon upload. File contents are verified unaltered.'
        : 'Warning: Current file hash differs from the hash recorded at upload. Potential modification detected.',
      recordedHash: result.recordedHash,
      calculatedHash: result.calculatedHash,
      checkedAt: result.checkedAt,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteEvidence = async (req, res, next) => {
  try {
    const evidence = await Evidence.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence record not found or access denied.' });
    }

    // Check if linked to existing cases
    const linkedCases = await Case.find({
      userId: req.user._id,
      evidenceIds: evidence._id,
    });

    const force = req.query.force === 'true';
    if (linkedCases.length > 0 && !force) {
      return res.status(409).json({
        error: `This evidence is linked to ${linkedCases.length} case(s). Confirm deletion to remove it from all cases.`,
        linkedCasesCount: linkedCases.length,
      });
    }

    // Remove file from disk
    await deleteFile(evidence.storageKey);

    // Remove evidence reference from any cases
    await Case.updateMany(
      { userId: req.user._id, evidenceIds: evidence._id },
      { $pull: { evidenceIds: evidence._id } }
    );

    // Remove record from database
    await Evidence.findByIdAndDelete(evidence._id);

    return res.status(200).json({
      message: 'Evidence successfully deleted from your vault.',
    });
  } catch (err) {
    next(err);
  }
};
