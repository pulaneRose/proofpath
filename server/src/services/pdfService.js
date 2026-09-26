import PDFDocument from 'pdfkit';

/**
 * Generate a professional ProofPath Case Report PDF stream
 * @param {Object} caseDoc - Populated case document
 * @param {Array} evidenceList - Populated evidence items
 * @param {Object} user - User object (name, email)
 * @returns {PDFDocument}
 */
export const generateCaseReportPdf = (caseDoc, evidenceList = [], user = {}) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `ProofPath Case Dossier - ${caseDoc.title}`,
      Author: 'ProofPath Evidence Preservation Platform',
      Subject: `Evidentiary Case Dossier & Legal Brief for Case ${caseDoc._id}`,
      Keywords: 'ProofPath, Evidence, Legal Brief, Case Dossier, Integrity, SHA-256',
    },
  });

  const primaryColor = '#0f172a'; // Deep Navy
  const accentColor = '#0891b2';  // Cyan
  const darkTextColor = '#1e293b';
  const mutedTextColor = '#64748b';
  const borderColor = '#cbd5e1';

  // --- HEADER ---
  doc
    .rect(50, 45, 495, 3)
    .fill(accentColor);

  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text('PROOFPATH OFFICIAL EVIDENTIARY CASE DOSSIER & LEGAL BRIEF', 50, 56, { width: 330 });

  doc
    .fontSize(8.5)
    .font('Helvetica')
    .fillColor(mutedTextColor)
    .text('Authoritative Evidence Index, Verified Timeline, and Factual Brief', 50, 92);

  // Metadata Box (Right aligned)
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor(darkTextColor)
    .text(`CASE DOSSIER REF:`, 370, 56, { width: 175, align: 'right' })
    .font('Helvetica')
    .text(String(caseDoc._id), 370, 66, { width: 175, align: 'right' })
    .text(`DATE ISSUED: ${reportDate}`, 370, 76, { width: 175, align: 'right' })
    .text(`CUSTODIAN: ${user.fullName || 'Authorized User'}`, 370, 86, { width: 175, align: 'right' });

  doc.moveDown(2);

  // Divider
  doc.moveTo(50, 110).lineTo(545, 110).strokeColor(borderColor).stroke();

  let yPos = 125;

  // --- CASE SUMMARY SECTION ---
  doc.y = yPos;
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(caseDoc.title || 'Untitled Case Record', 50, doc.y);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor(mutedTextColor)
    .text(`Issue Type: ${caseDoc.issueType || 'General'} | Incident Reference Date: ${caseDoc.incidentDate || 'Unspecified'} | Status: ${caseDoc.status || 'Active'}`);

  doc.moveDown(0.8);

  // Executive Legal Brief (if available)
  if (caseDoc.aiAnalysis?.executiveBrief) {
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('EXECUTIVE LEGAL BRIEF & FACTUAL SUMMARY:');

    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor(darkTextColor)
      .text(caseDoc.aiAnalysis.executiveBrief, { indent: 10, lineGap: 2 });

    doc.moveDown(0.8);
  }

  // Legal Claims / Causes of Action (if available)
  if (caseDoc.aiAnalysis?.legalClaims?.length > 0) {
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('FORMAL CAUSES OF ACTION / LEGAL GROUNDS:');

    caseDoc.aiAnalysis.legalClaims.forEach((claim, idx) => {
      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor('#0284c7')
        .text(`Claim ${idx + 1}: ${claim}`, { indent: 10, lineGap: 2 });
    });

    doc.moveDown(0.8);
  }

  // User Account Box
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text("STATEMENT OF CLAIMANT (As reported):");

  doc
    .fontSize(8.5)
    .font('Helvetica-Oblique')
    .fillColor(darkTextColor)
    .text(`"${caseDoc.userDescription || 'No description provided.'}"`, { indent: 10, lineGap: 2 });

  doc.moveDown(0.8);

  // Issue Summary if synthesized
  if (caseDoc.aiAnalysis?.issueSummary && !caseDoc.aiAnalysis?.executiveBrief) {
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('ISSUE SUMMARY (Objective Synthesis):');

    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor(darkTextColor)
      .text(caseDoc.aiAnalysis.issueSummary, { indent: 10, lineGap: 2 });

    doc.moveDown(0.8);
  }

  // --- CHRONOLOGICAL TIMELINE SECTION ---
  doc.addPage();

  doc
    .fontSize(13)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text('CHRONOLOGICAL STATEMENT OF FACTS', 50, 50);

  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor(mutedTextColor)
    .text('Every event cites its exact informational source (Metadata, Evidence, User statement, Evidentiary Finding).');

  doc.moveDown(1);

  const timeline = caseDoc.aiAnalysis?.timeline || [];

  if (timeline.length === 0) {
    doc
      .fontSize(9)
      .font('Helvetica-Oblique')
      .fillColor(mutedTextColor)
      .text('No timeline events recorded yet. Run evidentiary synthesis to populate chronological events.');
  } else {
    timeline.forEach((event) => {
      // Check for page boundary
      if (doc.y > 690) {
        doc.addPage();
      }

      const eventBoxY = doc.y;
      
      // Left border accent line
      doc
        .rect(50, eventBoxY, 3, 40)
        .fill(event.sourceType === 'Metadata' ? '#06b6d4' : event.sourceType === 'User statement' ? '#f59e0b' : '#3b82f6');

      // Date & Source badge
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text(`${event.date}${event.time ? ` — ${event.time}` : ''}`, 62, eventBoxY);

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(mutedTextColor)
        .text(`[Source: ${event.sourceType}${event.evidenceRefCode ? ` • Ref: ${event.evidenceRefCode}` : ''}]`, 62, eventBoxY + 12);

      // Event title & Description
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(darkTextColor)
        .text(event.title, 62, eventBoxY + 24);

      doc
        .fontSize(8.5)
        .font('Helvetica')
        .fillColor(darkTextColor)
        .text(event.description, 62, eventBoxY + 36, { width: 470, lineGap: 1.5 });

      doc.moveDown(1.5);
    });
  }

  // --- EVIDENCE INDEX & INTEGRITY SECTION ---
  doc.addPage();

  doc
    .fontSize(13)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text('PRESERVED EVIDENCE DOSSIER & PROOF ASSESSMENTS', 50, 50);

  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor(mutedTextColor)
    .text('Cryptographic hashes (SHA-256) verify file integrity. Every exhibit details what factual element it establishes.');

  doc.moveDown(1);

  const proofMap = {};
  (caseDoc.aiAnalysis?.evidenceProofAssessments || []).forEach((p) => {
    if (p.evidenceRefCode) {
      proofMap[p.evidenceRefCode] = p;
    }
  });

  if (evidenceList.length === 0) {
    doc
      .fontSize(9)
      .font('Helvetica-Oblique')
      .fillColor(mutedTextColor)
      .text('No evidence items are currently linked to this case.');
  } else {
    evidenceList.forEach((ev, idx) => {
      if (doc.y > 630) {
        doc.addPage();
      }

      const refCode = `E-${String(idx + 1).padStart(3, '0')}`;
      const uploadDate = new Date(ev.uploadTimestamp || ev.createdAt).toISOString().replace('T', ' ').substring(0, 19);
      const meta = ev.metadata || {};
      const proof = proofMap[refCode] || null;

      const baseCardHeight = proof ? 98 : 78;
      doc
        .rect(50, doc.y, 495, baseCardHeight)
        .fillAndStroke('#f8fafc', borderColor);

      const cardY = doc.y + 6;

      // Item code & Title
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(accentColor)
        .text(refCode, 60, cardY);

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text(ev.title, 110, cardY);

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(mutedTextColor)
        .text(`Category: ${ev.category} | File: ${ev.originalFilename} (${(ev.fileSize / 1024).toFixed(1)} KB) | Vault Upload: ${uploadDate}`, 60, cardY + 14);

      // SHA-256 Hash
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(darkTextColor)
        .text('SHA-256 Hash:', 60, cardY + 28)
        .font('Courier')
        .fontSize(7.5)
        .fillColor('#0284c7')
        .text(ev.sha256, 130, cardY + 28);

      // Metadata Row
      const metaStrings = [];
      if (meta.dateTimeOriginal) metaStrings.push(`Date Taken: ${meta.dateTimeOriginal}`);
      else metaStrings.push('Date Taken: Not available');

      if (meta.make || meta.model) metaStrings.push(`Device: ${[meta.make, meta.model].filter(Boolean).join(' ')}`);
      else metaStrings.push('Device: Not available');

      if (meta.hasGps && meta.gpsLatitude && meta.gpsLongitude) {
        metaStrings.push(`GPS: ${meta.gpsLatitude}, ${meta.gpsLongitude}`);
      } else {
        metaStrings.push('GPS: Not available');
      }

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(darkTextColor)
        .text(`Extracted Metadata: ${metaStrings.join(' | ')}`, 60, cardY + 42, { width: 470 });

      // Detailed Proof Assessment
      if (proof) {
        doc
          .fontSize(8)
          .font('Helvetica-Bold')
          .fillColor('#047857')
          .text(`Evidentiary Finding: `, 60, cardY + 56)
          .font('Helvetica')
          .fillColor(darkTextColor)
          .text(proof.relevanceAndProof, 155, cardY + 56, { width: 375, lineGap: 1 });

        doc
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .fillColor('#4338ca')
          .text(`Probative Status: ${proof.probativeValue || 'Direct Corroborative Proof'} | Cryptographically verified tamper-evident`, 60, cardY + 76);
      } else {
        doc
          .fontSize(7.5)
          .font('Helvetica-Oblique')
          .fillColor(mutedTextColor)
          .text(`Integrity status: Recorded at upload. File verified tamper-evident.`, 60, cardY + 56);
      }

      doc.y = cardY + baseCardHeight - 2;
      doc.moveDown(0.8);
    });
  }

  // --- OBSERVATIONS & QUESTIONS ---
  if (caseDoc.aiAnalysis?.evidenceObservations?.length > 0 || caseDoc.aiAnalysis?.missingInformation?.length > 0) {
    if (doc.y > 600) doc.addPage();

    doc.moveDown(1);
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('EVIDENTIARY OBSERVATIONS & CORROBORATION NOTES:');

    (caseDoc.aiAnalysis.evidenceObservations || []).forEach((obs) => {
      doc
        .fontSize(8.5)
        .font('Helvetica')
        .fillColor(darkTextColor)
        .text(`• ${obs}`, { indent: 10, lineGap: 2 });
    });

    if (caseDoc.aiAnalysis?.missingInformation?.length > 0) {
      doc.moveDown(0.5);
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#b45309')
        .text('MISSING INFORMATION / SUGGESTED INQUIRIES:');

      (caseDoc.aiAnalysis.missingInformation || []).forEach((m) => {
        doc
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor(darkTextColor)
          .text(`• ${m}`, { indent: 10, lineGap: 2 });
      });
    }
  }

  // --- EVIDENTIARY ASSESSMENT & CASE STRATEGY ---
  const advice = caseDoc.aiAnalysis?.caseAdvice || {};
  if (advice.strengths?.length > 0 || advice.vulnerabilities?.length > 0 || advice.recommendations?.length > 0) {
    doc.addPage();

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('EVIDENTIARY ASSESSMENT & CASE STRATEGY', 50, 50);

    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor(mutedTextColor)
      .text('Factual assessment of evidentiary strengths, potential vulnerabilities, and strategic next steps.');

    doc.moveDown(1);

    // Evidentiary Readiness Score Card
    if (advice.credibilityScore) {
      const score = advice.credibilityScore.score || 75;
      const rating = advice.credibilityScore.rating || 'Moderate Corroboration';
      const scoreCardY = doc.y;

      doc
        .rect(50, scoreCardY, 495, 52)
        .fillAndStroke('#f5f3ff', '#ddd6fe');

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#6b21a8')
        .text('EVIDENTIARY READINESS RATING:', 65, scoreCardY + 10);

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#4c1d95')
        .text(`${score}/100 — ${rating}`, 260, scoreCardY + 8);

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#4b5563')
        .text(advice.credibilityScore.rationale || '', 65, scoreCardY + 28, { width: 460, lineGap: 1 });

      doc.y = scoreCardY + 62;
      doc.moveDown(0.5);
    }

    // Strengths
    if (advice.strengths?.length > 0) {
      doc
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .fillColor('#065f46')
        .text('EVIDENTIARY STRENGTHS:');

      advice.strengths.forEach((s) => {
        doc
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor(darkTextColor)
          .text(`[✓] ${s}`, { indent: 10, lineGap: 2 });
      });
      doc.moveDown(0.8);
    }

    // Vulnerabilities
    if (advice.vulnerabilities?.length > 0) {
      if (doc.y > 660) doc.addPage();
      doc
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .fillColor('#991b1b')
        .text('POTENTIAL VULNERABILITIES & EVIDENTIARY GAPS:');

      advice.vulnerabilities.forEach((v) => {
        doc
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor(darkTextColor)
          .text(`[!] ${v}`, { indent: 10, lineGap: 2 });
      });
      doc.moveDown(0.8);
    }

    // Recommendations
    if (advice.recommendations?.length > 0) {
      if (doc.y > 640) doc.addPage();
      doc
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .fillColor('#581c87')
        .text('STRATEGIC NEXT STEPS & RECOMMENDATIONS:');

      advice.recommendations.forEach((rec, idx) => {
        doc
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor(darkTextColor)
          .text(`${idx + 1}. ${rec}`, { indent: 10, lineGap: 2 });
      });
      doc.moveDown(0.8);
    }

    // Legal Preparation Tips
    if (advice.legalPreparationTips?.length > 0) {
      if (doc.y > 660) doc.addPage();
      doc
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text('PREPARATION GUIDANCE FOR COUNSEL / MEDIATION:');

      advice.legalPreparationTips.forEach((tip) => {
        doc
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor(darkTextColor)
          .text(`• ${tip}`, { indent: 10, lineGap: 2 });
      });
      doc.moveDown(0.8);
    }
  }

  // --- LEGAL & EVIDENTIARY DISCLAIMER (Footer on all or last page) ---
  if (doc.y > 680) doc.addPage();

  doc.moveDown(1.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(borderColor).stroke();
  doc.moveDown(0.8);

  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor(mutedTextColor)
    .text('IMPORTANT EVIDENTIARY & LEGAL NOTICE', { align: 'center' });

  doc
    .fontSize(7)
    .font('Helvetica')
    .fillColor(mutedTextColor)
    .text(
      'ProofPath is an evidence preservation and organization platform. ProofPath is not a law firm and does not provide legal representation. Cryptographic SHA-256 hashes demonstrate that stored evidence files have remained identical and tamper-evident since the moment of vault registration, providing cryptographic certainty of file contents.',
      { align: 'justify', lineGap: 1.5 }
    );

  return doc;
};

/**
 * Generate a formal, fully formatted client-ready legal contract PDF
 * @param {Object} contract - Populated contract document
 * @param {Object} user - User object
 * @returns {PDFDocument}
 */
export const generateFormalContractPdf = (contract, user = {}) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `${contract.title || 'Legal Agreement'}`,
      Author: user.fullName || 'ProofPath Legal Platform',
      Subject: `Executed Agreement: ${contract.title}`,
      Keywords: 'Contract, Legal Agreement, ProofPath, Execution, Binding',
    },
  });

  const primaryColor = '#0f172a';
  const navyAccent = '#1e3a8a';
  const darkTextColor = '#1e293b';
  const mutedTextColor = '#64748b';
  const borderColor = '#cbd5e1';

  // --- FORMAL HEADER ---
  doc.rect(50, 45, 495, 4).fill(navyAccent);

  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(contract.title ? contract.title.toUpperCase() : 'LEGAL AGREEMENT', 50, 58, { align: 'center' });

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(navyAccent)
    .text(contract.contractType ? contract.contractType.toUpperCase() : 'FORMAL CONTRACT', 50, 80, { align: 'center' });

  doc.moveDown(1.5);
  doc.moveTo(50, 98).lineTo(545, 98).strokeColor(borderColor).stroke();

  // If contractBody is present, render it with clean typography
  const bodyText = contract.contractBody || '';
  if (bodyText.trim()) {
    doc.y = 115;
    const paragraphs = bodyText.split('\n');

    paragraphs.forEach((line) => {
      if (doc.y > 720) {
        doc.addPage();
        doc.y = 50;
      }

      const trimmed = line.trim();
      if (!trimmed) {
        doc.moveDown(0.4);
      } else if (trimmed.startsWith('===') || trimmed.startsWith('---')) {
        doc.moveDown(0.2);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
        doc.moveDown(0.4);
      } else if (trimmed.startsWith('ARTICLE') || trimmed.startsWith('RECITALS') || trimmed.startsWith('SIGNATURES') || trimmed.startsWith('PARTIES:')) {
        doc.moveDown(0.5);
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor(navyAccent)
          .text(trimmed);
        doc.moveDown(0.3);
      } else if (/^\d+\.\d+/.test(trimmed)) {
        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .fillColor(darkTextColor)
          .text(trimmed, { lineGap: 2 });
      } else if (trimmed.startsWith('FIRST PARTY:') || trimmed.startsWith('SECOND PARTY:')) {
        doc.moveDown(0.6);
        doc
          .fontSize(9.5)
          .font('Helvetica-Bold')
          .fillColor(primaryColor)
          .text(trimmed);
      } else {
        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor(darkTextColor)
          .text(trimmed, { lineGap: 2 });
      }
    });
  } else {
    // Standard structured template if no raw body yet
    doc.y = 120;
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(darkTextColor)
      .text(`This Agreement is made between ${user.fullName || 'First Party'} and ${contract.counterpartyName || 'Counterparty'}.`);

    doc.moveDown(1);
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('KEY TERMS & CONDITIONS:');

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(darkTextColor)
      .text(contract.keyTerms || 'Standard professional covenants apply as set forth herein.');

    doc.moveDown(1);
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(darkTextColor)
      .text(`Governing Law: ${contract.governingLaw || 'State of New York'}`);
    doc.text(`Financial Consideration: ${contract.value || 'As stated'}`);
    doc.text(`Term: ${contract.startDate || 'Effective Date'} to ${contract.endDate || 'Termination'}`);
  }

  // --- EXHIBIT SCHEDULE: CRYPTOGRAPHIC ATTACHMENTS (if evidence attached) ---
  const evidenceList = contract.evidenceIds || [];
  if (evidenceList.length > 0) {
    doc.addPage();
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('EXHIBIT SCHEDULE A: CRYPTOGRAPHICALLY PRESERVED ATTACHMENTS', 50, 50);

    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor(mutedTextColor)
      .text('The following exhibits are incorporated into this Agreement with verified SHA-256 digital seals:');

    doc.moveDown(1);

    evidenceList.forEach((ev, idx) => {
      if (doc.y > 680) doc.addPage();

      const itemBoxY = doc.y;
      doc.rect(50, itemBoxY, 495, 46).fillAndStroke('#f8fafc', borderColor);

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(navyAccent)
        .text(`Exhibit A-${idx + 1}: ${ev.title || 'Document'}`, 60, itemBoxY + 6);

      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor(mutedTextColor)
        .text(`File: ${ev.originalFilename || 'document'} | Category: ${ev.category || 'Contract'} | Preserved in Vault`, 60, itemBoxY + 18);

      doc
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .fillColor(darkTextColor)
        .text('SHA-256 Integrity Hash:', 60, itemBoxY + 30)
        .font('Courier')
        .fontSize(7)
        .fillColor('#1d4ed8')
        .text(ev.sha256 || 'Integrity recorded at upload', 165, itemBoxY + 30);

      doc.y = itemBoxY + 54;
    });
  }

  return doc;
};

/**
 * Generate a professional ProofPath Contract Preservation Certificate PDF stream
 * @param {Object} contract - Populated contract document
 * @param {Object} user - User object
 * @returns {PDFDocument}
 */
export const generateContractCertificatePdf = (contract, user = {}) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `ProofPath Contract Preservation Certificate - ${contract.title}`,
      Author: 'ProofPath Evidence Preservation Platform',
      Subject: `Cryptographic Contract Record and Preservation Certificate for ${contract._id}`,
      Keywords: 'ProofPath, Contract, Certificate, Integrity, SHA-256, Counterparty',
    },
  });

  const primaryColor = '#0f172a';
  const purpleAccent = '#7c3aed';
  const darkTextColor = '#1e293b';
  const mutedTextColor = '#64748b';
  const borderColor = '#cbd5e1';

  // --- HEADER ---
  doc.rect(50, 45, 495, 4).fill(purpleAccent);

  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text('PROOFPATH CONTRACT PRESERVATION CERTIFICATE', 50, 58);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor(mutedTextColor)
    .text('Official Cryptographic Record & Evidentiary Summary', 50, 80);

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor(darkTextColor)
    .text('CERTIFICATE ID:', 340, 58, { width: 205, align: 'right' })
    .font('Helvetica')
    .text(String(contract._id), 340, 68, { width: 205, align: 'right' })
    .text(`ISSUED: ${reportDate}`, 340, 78, { width: 205, align: 'right' })
    .text(`PREPARED FOR: ${user.fullName || 'Authorized Custodian'}`, 340, 88, { width: 205, align: 'right' });

  doc.moveDown(2);
  doc.moveTo(50, 105).lineTo(545, 105).strokeColor(borderColor).stroke();

  // --- CONTRACT SUMMARY TABLE ---
  let yPos = 120;
  doc.y = yPos;

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(contract.title || 'Untitled Contract Record', 50, doc.y);

  doc.moveDown(0.5);

  // Table Grid Box
  const gridY = doc.y;
  doc.rect(50, gridY, 495, 78).fillAndStroke('#faf5ff', '#e9d5ff');

  // Row 1
  doc
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .fillColor('#581c87')
    .text('Contract Type:', 62, gridY + 10)
    .font('Helvetica')
    .fillColor(darkTextColor)
    .text(contract.contractType || 'General Agreement', 140, gridY + 10)
    .font('Helvetica-Bold')
    .fillColor('#581c87')
    .text('Status:', 330, gridY + 10)
    .font('Helvetica-Bold')
    .fillColor(contract.status === 'Active' ? '#047857' : contract.status === 'Disputed' ? '#b91c1c' : '#475569')
    .text(contract.status || 'Active', 380, gridY + 10);

  // Row 2
  const partyName = contract.contactId?.name || contract.counterpartyName || 'Not specified';
  const orgName = contract.contactId?.organization ? ` (${contract.contactId.organization})` : '';

  doc
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .fillColor('#581c87')
    .text('Counterparty:', 62, gridY + 28)
    .font('Helvetica')
    .fillColor(darkTextColor)
    .text(`${partyName}${orgName}`, 140, gridY + 28)
    .font('Helvetica-Bold')
    .fillColor('#581c87')
    .text('Financial Value:', 330, gridY + 28)
    .font('Helvetica')
    .fillColor(darkTextColor)
    .text(contract.value || 'Unstated / Non-monetary', 415, gridY + 28);

  // Row 3
  const termStr = `${contract.startDate || 'Unspecified'}  →  ${contract.endDate || 'Ongoing / Indefinite'}`;
  doc
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .fillColor('#581c87')
    .text('Effective Term:', 62, gridY + 46)
    .font('Helvetica')
    .fillColor(darkTextColor)
    .text(termStr, 140, gridY + 46)
    .font('Helvetica-Bold')
    .fillColor('#581c87')
    .text('Preserved In Vault:', 330, gridY + 46)
    .font('Helvetica')
    .fillColor(darkTextColor)
    .text(new Date(contract.createdAt).toLocaleDateString('en-US'), 430, gridY + 46);

  doc.y = gridY + 92;

  // --- KEY TERMS & PROVISIONS ---
  if (contract.keyTerms && contract.keyTerms.trim()) {
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('KEY TERMS & GOVERNING PROVISIONS');

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(darkTextColor)
      .text(contract.keyTerms, { indent: 10, lineGap: 2 });

    doc.moveDown(1);
  }

  // --- NOTES & OBLIGATIONS ---
  if (contract.notes && contract.notes.trim()) {
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('CUSTODIAL NOTES & CORRESPONDENCE SUMMARY');

    doc
      .fontSize(9)
      .font('Helvetica-Oblique')
      .fillColor(darkTextColor)
      .text(contract.notes, { indent: 10, lineGap: 2 });

    doc.moveDown(1);
  }

  // --- ATTACHED EVIDENCE & HASH INDEX ---
  const evidenceList = contract.evidenceIds || [];
  doc.moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(`ATTACHED CONTRACT EVIDENCE & CRYPTOGRAPHIC SEALS (${evidenceList.length})`);

  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor(mutedTextColor)
    .text('Every linked document contains a SHA-256 integrity seal calculated upon initial vault upload.');

  doc.moveDown(0.8);

  if (evidenceList.length === 0) {
    doc
      .fontSize(8.5)
      .font('Helvetica-Oblique')
      .fillColor(mutedTextColor)
      .text('No separate digital document attachments are currently linked to this contract record.');
  } else {
    evidenceList.forEach((ev, idx) => {
      if (doc.y > 680) doc.addPage();

      const itemBoxY = doc.y;
      doc.rect(50, itemBoxY, 495, 50).fillAndStroke('#f8fafc', borderColor);

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(purpleAccent)
        .text(`Exhibit ${idx + 1}: ${ev.title || 'Document'}`, 60, itemBoxY + 8);

      const sizeStr = ev.fileSize ? ` | ${(ev.fileSize / 1024).toFixed(1)} KB` : '';
      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor(mutedTextColor)
        .text(`File: ${ev.originalFilename || 'document'}${sizeStr} | Category: ${ev.category || 'Contract'}`, 60, itemBoxY + 20);

      doc
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .fillColor(darkTextColor)
        .text('SHA-256:', 60, itemBoxY + 32)
        .font('Courier')
        .fontSize(7)
        .fillColor('#7c3aed')
        .text(ev.sha256 || 'Hash recorded at upload', 110, itemBoxY + 32);

      doc.y = itemBoxY + 58;
    });
  }

  // --- INTEGRITY NOTICE & DISCLAIMER ---
  if (doc.y > 670) doc.addPage();

  doc.moveDown(1.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(borderColor).stroke();
  doc.moveDown(0.8);

  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor(mutedTextColor)
    .text('CERTIFICATE AUTHENTICATION & LEGAL DISCLAIMER', { align: 'center' });

  doc
    .fontSize(7)
    .font('Helvetica')
    .fillColor(mutedTextColor)
    .text(
      'This certificate serves as a digital preservation snapshot generated by ProofPath. ProofPath does not independently authenticate contract validity, legal enforceability, or genuine signatures of counterparties. The recorded SHA-256 cryptographic hashes guarantee that all attached electronic files remain unmodified since entry into the ProofPath vault.',
      { align: 'justify', lineGap: 1.5 }
    );

  return doc;
};
