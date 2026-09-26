import path from 'path';
import express from 'express';
import { ZipArchive } from 'archiver';
import { Contact } from '../models/Contact.js';
import { Contract } from '../models/Contract.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateContractCertificatePdf, generateFormalContractPdf } from '../services/pdfService.js';
import { generateContractDraft } from '../services/aiService.js';
import { getFilePath, fileExists } from '../services/storageService.js';

const router = express.Router();

router.use(authenticateToken);

const getUserId = (req) => req.user?._id || req.user?.id || req.user?.userId;

// ================= CONTACTS ENDPOINTS =================

// GET /api/contacts - list user contacts
router.get('/', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const contacts = await Contact.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: contacts.length, contacts });
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts - create new contact
router.post('/', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { name, organization, role, email, phone, address, relationship, notes } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Contact name is required' });
    }

    const contact = new Contact({
      userId,
      name: name.trim(),
      organization: organization ? organization.trim() : '',
      role: role || 'Counterparty',
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      relationship: relationship || 'Dispute Party',
      notes: notes ? notes.trim() : '',
    });

    await contact.save();
    res.status(201).json({ success: true, message: 'Contact created successfully', contact });
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/:id - get single contact
router.get('/:id', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const contact = await Contact.findOne({ _id: req.params.id, userId });
    if (!contact) {
      return res.status(404).json({ error: 'Contact record not found' });
    }
    res.status(200).json({ success: true, contact });
  } catch (err) {
    next(err);
  }
});

// PUT /api/contacts/:id - update contact
router.put('/:id', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { name, organization, role, email, phone, address, relationship, notes } = req.body;
    const contact = await Contact.findOne({ _id: req.params.id, userId });
    if (!contact) {
      return res.status(404).json({ error: 'Contact record not found' });
    }

    if (name) contact.name = name.trim();
    if (organization !== undefined) contact.organization = organization.trim();
    if (role !== undefined) contact.role = role;
    if (email !== undefined) contact.email = email.trim();
    if (phone !== undefined) contact.phone = phone.trim();
    if (address !== undefined) contact.address = address.trim();
    if (relationship !== undefined) contact.relationship = relationship;
    if (notes !== undefined) contact.notes = notes.trim();

    await contact.save();
    res.status(200).json({ success: true, message: 'Contact updated', contact });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/contacts/:id - delete contact
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, userId });
    if (!contact) {
      return res.status(404).json({ error: 'Contact record not found' });
    }
    res.status(200).json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ================= CONTRACTS ENDPOINTS =================

// POST /api/contacts/contracts/generate - AI generate contract draft
router.post('/contracts/generate', async (req, res, next) => {
  try {
    const userFullName = req.user?.fullName || 'First Party';
    const draft = await generateContractDraft(req.body, userFullName);
    return res.status(200).json(draft);
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/contracts/all - list user contracts
router.get('/contracts/all', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const contracts = await Contract.find({ userId })
      .populate('contactId', 'name organization role email phone')
      .populate('evidenceIds', 'title category originalFilename sha256 mimeType fileSize')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: contracts.length, contracts });
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts/contracts/new - create new contract
router.post('/contracts/new', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const {
      title,
      contractType,
      counterpartyName,
      contactId,
      status,
      startDate,
      endDate,
      value,
      keyTerms,
      governingLaw,
      contractBody,
      specialClauses,
      notes,
      evidenceIds,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Contract title is required' });
    }

    const contract = new Contract({
      userId,
      title: title.trim(),
      contractType: contractType || 'Employment Agreement',
      counterpartyName: counterpartyName ? counterpartyName.trim() : '',
      contactId: contactId || null,
      status: status || 'Active',
      startDate: startDate || '',
      endDate: endDate || '',
      value: value ? value.trim() : '',
      keyTerms: keyTerms ? keyTerms.trim() : '',
      governingLaw: governingLaw || 'State of New York',
      contractBody: contractBody || '',
      specialClauses: Array.isArray(specialClauses) ? specialClauses : [],
      notes: notes ? notes.trim() : '',
      evidenceIds: Array.isArray(evidenceIds) ? evidenceIds : [],
    });

    await contract.save();
    const populated = await Contract.findById(contract._id)
      .populate('contactId', 'name organization role email phone')
      .populate('evidenceIds', 'title category originalFilename sha256');

    res.status(201).json({ success: true, message: 'Contract record created successfully', contract: populated });
  } catch (err) {
    next(err);
  }
});

// PUT /api/contacts/contracts/:id - update existing contract
router.put('/contracts/:id', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const contract = await Contract.findOne({ _id: req.params.id, userId });
    if (!contract) {
      return res.status(404).json({ error: 'Contract record not found or access denied.' });
    }

    const {
      title,
      contractType,
      counterpartyName,
      contactId,
      status,
      startDate,
      endDate,
      value,
      keyTerms,
      governingLaw,
      contractBody,
      specialClauses,
      notes,
      evidenceIds,
    } = req.body;

    if (title) contract.title = title.trim();
    if (contractType !== undefined) contract.contractType = contractType;
    if (counterpartyName !== undefined) contract.counterpartyName = counterpartyName.trim();
    if (contactId !== undefined) contract.contactId = contactId || null;
    if (status !== undefined) contract.status = status;
    if (startDate !== undefined) contract.startDate = startDate;
    if (endDate !== undefined) contract.endDate = endDate;
    if (value !== undefined) contract.value = value.trim();
    if (keyTerms !== undefined) contract.keyTerms = keyTerms.trim();
    if (governingLaw !== undefined) contract.governingLaw = governingLaw;
    if (contractBody !== undefined) contract.contractBody = contractBody;
    if (specialClauses !== undefined) contract.specialClauses = Array.isArray(specialClauses) ? specialClauses : [];
    if (notes !== undefined) contract.notes = notes.trim();
    if (evidenceIds !== undefined) contract.evidenceIds = Array.isArray(evidenceIds) ? evidenceIds : [];

    await contract.save();
    const populated = await Contract.findById(contract._id)
      .populate('contactId', 'name organization role email phone')
      .populate('evidenceIds', 'title category originalFilename sha256');

    res.status(200).json({ success: true, message: 'Contract record updated successfully', contract: populated });
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/contracts/:id/export - export contract preservation certificate PDF
router.get('/contracts/:id/export', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const contract = await Contract.findOne({ _id: req.params.id, userId })
      .populate('contactId', 'name organization role email phone')
      .populate('evidenceIds', 'title category originalFilename sha256 mimeType fileSize');

    if (!contract) {
      return res.status(404).json({ error: 'Contract record not found or access denied.' });
    }

    const safeTitle = (contract.title || 'Contract').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const filename = `ProofPath_Contract_Certificate_${safeTitle}_${contract._id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const pdfDoc = generateContractCertificatePdf(contract, req.user);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/contracts/:id/export-contract-doc - export formal legal contract PDF
router.get('/contracts/:id/export-contract-doc', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const contract = await Contract.findOne({ _id: req.params.id, userId })
      .populate('contactId', 'name organization role email phone')
      .populate('evidenceIds', 'title category originalFilename sha256 mimeType fileSize');

    if (!contract) {
      return res.status(404).json({ error: 'Contract record not found or access denied.' });
    }

    const safeTitle = (contract.title || 'Contract').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const filename = `ProofPath_Legal_Agreement_${safeTitle}_${contract._id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const pdfDoc = generateFormalContractPdf(contract, req.user);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/contracts/:id/download-zip - download contract bundle (Certificate PDF + Formal Agreement PDF + evidence files + manifest)
router.get('/contracts/:id/download-zip', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const contract = await Contract.findOne({ _id: req.params.id, userId })
      .populate('contactId', 'name organization role email phone')
      .populate('evidenceIds');

    if (!contract) {
      return res.status(404).json({ error: 'Contract record not found or access denied.' });
    }

    const safeTitle = (contract.title || 'Contract').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const zipFilename = `ProofPath_Contract_Bundle_${safeTitle}_${contract._id}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      if (!res.headersSent) res.status(500).json({ error: err.message });
    });

    archive.pipe(res);

    // 1. Generate Formal Legal Agreement PDF and append buffer
    const legalDoc = generateFormalContractPdf(contract, req.user);
    const legalChunks = [];
    legalDoc.on('data', (chunk) => legalChunks.push(chunk));
    await new Promise((resolve) => {
      legalDoc.on('end', resolve);
      legalDoc.end();
    });
    const legalBuffer = Buffer.concat(legalChunks);
    archive.append(legalBuffer, { name: `ProofPath_Legal_Agreement_${safeTitle}.pdf` });

    // 2. Generate Contract Preservation Certificate PDF and append buffer
    const certDoc = generateContractCertificatePdf(contract, req.user);
    const certChunks = [];
    certDoc.on('data', (chunk) => certChunks.push(chunk));
    await new Promise((resolve) => {
      certDoc.on('end', resolve);
      certDoc.end();
    });
    const certBuffer = Buffer.concat(certChunks);
    archive.append(certBuffer, { name: `ProofPath_Contract_Preservation_Certificate_${safeTitle}.pdf` });

    // 2. Generate Manifest
    let manifest = `========================================================================\r\n`;
    manifest += `PROOFPATH CONTRACT PRESERVATION & INTEGRITY MANIFEST\r\n`;
    manifest += `========================================================================\r\n`;
    manifest += `Contract ID:    ${contract._id}\r\n`;
    manifest += `Title:          ${contract.title}\r\n`;
    manifest += `Type:           ${contract.contractType}\r\n`;
    manifest += `Status:         ${contract.status}\r\n`;
    manifest += `Counterparty:   ${contract.contactId?.name || contract.counterpartyName || 'N/A'}\r\n`;
    manifest += `Term:           ${contract.startDate || 'Unspecified'} -> ${contract.endDate || 'Ongoing'}\r\n`;
    manifest += `Financial Val:  ${contract.value || 'Unstated'}\r\n`;
    manifest += `Preserved On:   ${new Date().toISOString()}\r\n`;
    manifest += `Custodian:      ${req.user.fullName || 'Authorized Custodian'} (${req.user.email || ''})\r\n\r\n`;
    manifest += `ATTACHED EXHIBITS & SHA-256 INTEGRITY SEALS:\r\n`;
    manifest += `------------------------------------------------------------------------\r\n`;

    const evidenceList = contract.evidenceIds || [];
    evidenceList.forEach((ev, idx) => {
      const exhibitTag = `Exhibit_${idx + 1}`;
      manifest += `[${exhibitTag}] ${ev.title}\r\n`;
      manifest += `  File Name:    ${ev.originalFilename} (${(ev.fileSize / 1024).toFixed(1)} KB)\r\n`;
      manifest += `  SHA-256 Seal: ${ev.sha256}\r\n`;
      manifest += `  Upload Time:  ${ev.uploadTimestamp || ev.createdAt}\r\n`;
      manifest += `------------------------------------------------------------------------\r\n`;

      if (ev.storageKey && fileExists(ev.storageKey)) {
        const filePath = getFilePath(ev.storageKey);
        const ext = ev.originalFilename ? path.extname(ev.originalFilename) : '';
        const safeBase = (ev.title || 'contract_doc').replace(/[^a-zA-Z0-9_-]/g, '_');
        const entryName = `Attached_Documents/${exhibitTag}_${safeBase}${ext}`;
        archive.file(filePath, { name: entryName });
      }
    });

    manifest += `\r\nTAMPER EVIDENCE NOTICE:\r\n`;
    manifest += `SHA-256 hashes are immutable records of file state at time of preservation.\r\n`;

    archive.append(manifest, { name: 'CONTRACT_INTEGRITY_MANIFEST.txt' });

    await archive.finalize();
  } catch (err) {
    next(err);
  }
});

// DELETE /api/contracts/:id - delete contract
router.delete('/contracts/:id', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const contract = await Contract.findOneAndDelete({ _id: req.params.id, userId });
    if (!contract) {
      return res.status(404).json({ error: 'Contract record not found' });
    }
    res.status(200).json({ success: true, message: 'Contract deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
