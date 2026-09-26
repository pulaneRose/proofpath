process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_12345';
process.env.AI_PROVIDER = 'local';

import assert from 'assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { app } from '../src/index.js';
import User from '../src/models/User.js';
import Evidence from '../src/models/Evidence.js';
import Case from '../src/models/Case.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for making HTTP requests to the test server
function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const reqOptions = {
      hostname: '127.0.0.1',
      port: addr.port,
      path: options.path,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const text = buffer.toString('utf8');
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: text,
          json,
          buffer,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      if (Buffer.isBuffer(body)) {
        req.write(body);
      } else if (typeof body === 'string') {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

// Multipart form builder helper for file uploads
function buildMultipartBody(fields, fileField) {
  const boundary = '----ProofPathFormBoundary' + Math.random().toString(36).substring(2);
  const crlf = '\r\n';
  const parts = [];

  for (const [key, value] of Object.entries(fields)) {
    parts.push(
      Buffer.from(
        `--${boundary}${crlf}Content-Disposition: form-data; name="${key}"${crlf}${crlf}${value}${crlf}`
      )
    );
  }

  if (fileField) {
    const { name, filename, mimeType, data } = fileField;
    parts.push(
      Buffer.from(
        `--${boundary}${crlf}Content-Disposition: form-data; name="${name}"; filename="${filename}"${crlf}Content-Type: ${mimeType}${crlf}${crlf}`
      )
    );
    parts.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
    parts.push(Buffer.from(crlf));
  }

  parts.push(Buffer.from(`--${boundary}--${crlf}`));
  const body = Buffer.concat(parts);

  return {
    boundary,
    body,
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length,
    },
  };
}

// Sample JPEG binary with EXIF header metadata
function createSampleExifJpeg() {
  const header = Buffer.from([
    0xff, 0xd8, // SOI
    0xff, 0xe1, // APP1 marker
    0x00, 0x5a, // APP1 length (90 bytes)
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    0x49, 0x49, 0x2a, 0x00, // II (Intel little-endian) TIFF header
    0x08, 0x00, 0x00, 0x00, // Offset to 1st IFD (8)
    0x02, 0x00, // 2 directory entries
    // Tag 1: Make (0x010f), Type: ASCII (2), Count: 6, Offset: 38
    0x0f, 0x01, 0x02, 0x00, 0x06, 0x00, 0x00, 0x00, 0x26, 0x00, 0x00, 0x00,
    // Tag 2: Model (0x0110), Type: ASCII (2), Count: 9, Offset: 44
    0x10, 0x01, 0x02, 0x00, 0x09, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, // Next IFD offset (0)
    // Offset 38: "Apple\0"
    0x41, 0x70, 0x70, 0x6c, 0x65, 0x00,
    // Offset 44: "iPhone15\0"
    0x69, 0x50, 0x68, 0x6f, 0x6e, 0x65, 0x31, 0x35, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0xff, 0xd9 // EOI
  ]);
  return header;
}

// Plain image without GPS or EXIF
function createPlainJpeg() {
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
    0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xd9
  ]);
}

async function runEndToEndTests() {
  console.log('----------------------------------------------------');
  console.log('ProofPath End-to-End Verification Test Suite');
  console.log('----------------------------------------------------');

  let server;

  try {
    await connectDB();

    // Start HTTP server on random free port
    server = app.listen(0);
    await new Promise((res) => server.once('listening', res));
    const port = server.address().port;
    console.log(`Test API Server running on port ${port}\n`);

    let user1Token;
    let user1Id;
    let user2Token;
    let user2Id;
    let photo1Id;
    let photo2Id;
    let case1Id;

    // ----------------------------------------------------
    // Test 1: Create a new user (Register)
    // ----------------------------------------------------
    console.log('Test 1: Create a new user (Register)');
    const regRes = await makeRequest(
      server,
      {
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        fullName: 'Jane Doe',
        email: 'jane.doe@proofpath.test',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }
    );

    assert.strictEqual(regRes.statusCode, 201, `Expected 201 Created, got ${regRes.statusCode}: ${regRes.body}`);
    assert.ok(regRes.json.token, 'Response should contain authentication token');
    assert.strictEqual(regRes.json.user.email, 'jane.doe@proofpath.test');
    user1Id = regRes.json.user.id;
    console.log('✓ PASS: Registration succeeded for User 1.\n');

    // ----------------------------------------------------
    // Test 2: Log in
    // ----------------------------------------------------
    console.log('Test 2: Log in');
    const loginRes = await makeRequest(
      server,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'jane.doe@proofpath.test',
        password: 'Password123!',
      }
    );

    assert.strictEqual(loginRes.statusCode, 200, 'Expected 200 OK on login');
    assert.ok(loginRes.json.token, 'Token should be returned on login');
    user1Token = loginRes.json.token;

    // Verify /api/auth/me
    const meRes = await makeRequest(server, {
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    assert.strictEqual(meRes.statusCode, 200);
    assert.strictEqual(meRes.json.user.fullName, 'Jane Doe');
    console.log('✓ PASS: Login succeeded and session is authenticated.\n');

    // ----------------------------------------------------
    // Test 3: Upload photograph containing EXIF metadata
    // ----------------------------------------------------
    console.log('Test 3: Upload photograph containing EXIF metadata');
    const exifImageBuffer = createSampleExifJpeg();
    const multipart1 = buildMultipartBody(
      {
        title: 'Workplace Arrival Photo — September 23',
        description: 'Captured desk setup upon arriving at work.',
        category: 'Attendance',
        tags: 'work, attendance, september23',
      },
      {
        name: 'file',
        filename: 'workplace-arrival.jpg',
        mimeType: 'image/jpeg',
        data: exifImageBuffer,
      }
    );

    const upload1Res = await makeRequest(
      server,
      {
        path: '/api/evidence',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user1Token}`,
          ...multipart1.headers,
        },
      },
      multipart1.body
    );

    assert.strictEqual(upload1Res.statusCode, 201, `Upload 1 failed: ${upload1Res.body}`);
    const evidence1 = upload1Res.json.evidence;
    assert.ok(evidence1._id, 'Evidence record must have an ID');
    assert.ok(evidence1.sha256, 'SHA-256 hash must be recorded');
    assert.strictEqual(evidence1.sha256.length, 64, 'SHA-256 hash must be a 64-character hex string');
    assert.ok(evidence1.metadata, 'Metadata record must exist');
    assert.strictEqual(evidence1.metadata.hasExif, true, 'EXIF must be parsed from header');
    assert.strictEqual(evidence1.metadata.make, 'Apple', 'Make should match EXIF tag');
    assert.strictEqual(evidence1.metadata.model, 'iPhone15', 'Model should match EXIF tag');
    photo1Id = evidence1._id;
    console.log(`✓ PASS: Photograph stored privately, SHA-256 computed (${evidence1.sha256.substring(0, 16)}...), EXIF extracted.\n`);

    // ----------------------------------------------------
    // Test 4: Upload photograph without GPS metadata
    // ----------------------------------------------------
    console.log('Test 4: Upload photograph without GPS metadata');
    const plainImageBuffer = createPlainJpeg();
    const multipart2 = buildMultipartBody(
      {
        title: 'Supervisor Note Scan',
        description: 'Printed notice on communication board.',
        category: 'Communication',
        tags: 'notice, board',
      },
      {
        name: 'file',
        filename: 'supervisor-note.jpg',
        mimeType: 'image/jpeg',
        data: plainImageBuffer,
      }
    );

    const upload2Res = await makeRequest(
      server,
      {
        path: '/api/evidence',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user1Token}`,
          ...multipart2.headers,
        },
      },
      multipart2.body
    );

    assert.strictEqual(upload2Res.statusCode, 201, `Upload 2 failed: ${upload2Res.body}`);
    const evidence2 = upload2Res.json.evidence;
    assert.strictEqual(evidence2.metadata.hasGps, false, 'hasGps must be false');
    assert.strictEqual(evidence2.metadata.gpsLatitude, null, 'Must NOT invent GPS Latitude');
    assert.strictEqual(evidence2.metadata.gpsLongitude, null, 'Must NOT invent GPS Longitude');
    photo2Id = evidence2._id;
    console.log('✓ PASS: File preserved without GPS. ProofPath strictly returned null without fabricating coordinates.\n');

    // ----------------------------------------------------
    // Test 5: Open Evidence Vault (Listing)
    // ----------------------------------------------------
    console.log('Test 5: Open Evidence Vault');
    const vaultRes = await makeRequest(server, {
      path: '/api/evidence',
      method: 'GET',
      headers: { Authorization: `Bearer ${user1Token}` },
    });

    assert.strictEqual(vaultRes.statusCode, 200);
    assert.strictEqual(vaultRes.json.count, 2, 'Vault should contain both uploaded evidence items');
    assert.ok(vaultRes.json.evidence.some((e) => e._id === photo1Id));
    assert.ok(vaultRes.json.evidence.some((e) => e._id === photo2Id));
    console.log(`✓ PASS: Evidence Vault returned ${vaultRes.json.count} preserved items.\n`);

    // ----------------------------------------------------
    // Test 6: Open Evidence Details & Verify Integrity
    // ----------------------------------------------------
    console.log('Test 6: Open Evidence Details & Verify Integrity');
    const detailRes = await makeRequest(server, {
      path: `/api/evidence/${photo1Id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${user1Token}` },
    });

    assert.strictEqual(detailRes.statusCode, 200);
    assert.strictEqual(detailRes.json.evidence.title, 'Workplace Arrival Photo — September 23');
    assert.ok(detailRes.json.evidence.sha256);

    // Call verify endpoint
    const verifyRes = await makeRequest(server, {
      path: `/api/evidence/${photo1Id}/verify`,
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
    });

    assert.strictEqual(verifyRes.statusCode, 200);
    assert.strictEqual(verifyRes.json.valid, true);
    assert.strictEqual(verifyRes.json.status, 'Integrity check passed');
    console.log(`✓ PASS: Stored file hash verified against recorded hash. Status: "${verifyRes.json.status}".\n`);

    // ----------------------------------------------------
    // Test 7: Create a Case
    // ----------------------------------------------------
    console.log('Test 7: Create a Case');
    const createCaseRes = await makeRequest(
      server,
      {
        path: '/api/cases',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
      },
      {
        title: 'Workplace Attendance Dispute — September 23',
        issueType: 'Employment',
        userDescription: 'My employer says I did not report to work on September 23, but I was at work that day.',
        incidentDate: '2026-09-23',
        evidenceIds: [photo1Id, photo2Id],
      }
    );

    assert.strictEqual(createCaseRes.statusCode, 201, `Case creation failed: ${createCaseRes.body}`);
    assert.ok(createCaseRes.json.case._id);
    assert.strictEqual(createCaseRes.json.case.evidenceIds.length, 2);
    case1Id = createCaseRes.json.case._id;
    console.log(`✓ PASS: Case created successfully (ID: ${case1Id}).\n`);

    // ----------------------------------------------------
    // Test 8: Select previously uploaded evidence from vault
    // ----------------------------------------------------
    console.log('Test 8: Select previously uploaded evidence from vault');
    const getCaseRes = await makeRequest(server, {
      path: `/api/cases/${case1Id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${user1Token}` },
    });

    assert.strictEqual(getCaseRes.statusCode, 200);
    const linkedIds = getCaseRes.json.case.evidenceIds.map((e) => e._id);
    assert.ok(linkedIds.includes(photo1Id), 'Photograph 1 must be linked directly from Vault');
    assert.ok(linkedIds.includes(photo2Id), 'Photograph 2 must be linked directly from Vault');
    console.log('✓ PASS: Evidence linked directly from vault without requiring duplicate file upload.\n');

    // ----------------------------------------------------
    // Test 9: Run AI Analysis
    // ----------------------------------------------------
    console.log('Test 9: Run AI Analysis');
    const analyzeRes = await makeRequest(server, {
      path: `/api/cases/${case1Id}/analyze`,
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
    });

    assert.strictEqual(analyzeRes.statusCode, 200, `AI analysis failed: ${analyzeRes.body}`);
    const analysis = analyzeRes.json.case.aiAnalysis;
    assert.strictEqual(analysis.status, 'completed');
    assert.ok(Array.isArray(analysis.timeline), 'Timeline must be an array');
    assert.ok(analysis.timeline.length > 0, 'Timeline must contain events');

    for (const item of analysis.timeline) {
      assert.ok(['Evidence', 'Metadata', 'Document content', 'User statement', 'AI observation'].includes(item.sourceType));
    }

    assert.ok(analysis.userAccount.includes('user states'));
    assert.ok(analysis.caseAdvice, 'caseAdvice must be generated');
    assert.ok(Array.isArray(analysis.caseAdvice.strengths), 'strengths must be an array');
    assert.ok(analysis.caseAdvice.strengths.length > 0, 'strengths must not be empty');
    assert.ok(Array.isArray(analysis.caseAdvice.recommendations), 'recommendations must be an array');
    assert.ok(analysis.caseAdvice.recommendations.length > 0, 'recommendations must not be empty');
    assert.ok(typeof analysis.caseAdvice.credibilityScore?.score === 'number', 'credibility score must be numeric');
    console.log(`✓ PASS: AI generated factual timeline (${analysis.timeline.length} events) & strategic advice (Readiness: ${analysis.caseAdvice.credibilityScore.score}/100).\n`);

    // ----------------------------------------------------
    // Test 10: Export Case as PDF
    // ----------------------------------------------------
    console.log('Test 10: Export Case as PDF');
    const exportRes = await makeRequest(server, {
      path: `/api/cases/${case1Id}/export`,
      method: 'GET',
      headers: { Authorization: `Bearer ${user1Token}` },
    });

    assert.strictEqual(exportRes.statusCode, 200);
    assert.strictEqual(exportRes.headers['content-type'], 'application/pdf');
    assert.ok(exportRes.buffer.length > 500, 'PDF buffer must be non-empty and well-formed');

    const magic = exportRes.buffer.slice(0, 5).toString('ascii');
    assert.strictEqual(magic, '%PDF-', 'Must return valid PDF format');
    console.log(`✓ PASS: Case exported successfully as formatted PDF (${exportRes.buffer.length} bytes).\n`);

    // ----------------------------------------------------
    // Test 11: Cross-user authorization check
    // ----------------------------------------------------
    console.log("Test 11: Cross-user authorization check (User 2 attempts to access User 1's evidence)");

    // Register User 2
    const reg2Res = await makeRequest(
      server,
      {
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        fullName: 'Bob Smith',
        email: 'bob.smith@proofpath.test',
        password: 'Password123!',
      }
    );
    user2Token = reg2Res.json.token;

    // User 2 attempts to view User 1's evidence record
    const breachDetailRes = await makeRequest(server, {
      path: `/api/evidence/${photo1Id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${user2Token}` },
    });
    assert.strictEqual(breachDetailRes.statusCode, 404, 'User 2 must be denied access to User 1 evidence');

    // User 2 attempts to download User 1's evidence file
    const breachFileRes = await makeRequest(server, {
      path: `/api/evidence/${photo1Id}/file`,
      method: 'GET',
      headers: { Authorization: `Bearer ${user2Token}` },
    });
    assert.strictEqual(breachFileRes.statusCode, 403, 'User 2 must be denied file download');

    // User 2 attempts to view User 1's case
    const breachCaseRes = await makeRequest(server, {
      path: `/api/cases/${case1Id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${user2Token}` },
    });
    assert.strictEqual(breachCaseRes.statusCode, 404, 'User 2 must be denied access to User 1 case');

    console.log('✓ PASS: Cross-user authorization strictly enforced. Access is denied (403/404) for unauthorized users.\n');

    // ----------------------------------------------------
    // Test 12: Create and retrieve a contact record
    // ----------------------------------------------------
    console.log('Test 12: Create a contact record');
    const contactRes = await makeRequest(
      server,
      {
        path: '/api/contacts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
      },
      {
        name: 'John Henderson',
        organization: 'Apex Logistics LLC',
        role: 'Employer / Company',
        email: 'j.henderson@apexlogistics.test',
        phone: '+1 555 123 4567',
        relationship: 'Shift Supervisor / Manager',
        notes: 'Direct supervisor during the September 23 shift dispute.',
      }
    );
    assert.strictEqual(contactRes.statusCode, 201, 'Contact creation should return 201');
    assert.ok(contactRes.json?.contact?._id, 'Contact should return generated ID');
    const contactId = contactRes.json.contact._id;
    console.log(`✓ PASS: Contact record created (ID: ${contactId}, Name: John Henderson).`);

    // ----------------------------------------------------
    // Test 13: Create and preserve a contract record linking evidence
    // ----------------------------------------------------
    console.log('\nTest 13: Create a contract record linked to contact and evidence');
    const contractRes = await makeRequest(
      server,
      {
        path: '/api/contacts/contracts/new',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
      },
      {
        title: 'Employment Agreement — Senior Logistics Coordinator',
        contractType: 'Employment Agreement',
        contactId,
        counterpartyName: 'Apex Logistics LLC',
        status: 'Active',
        startDate: '2025-01-15',
        value: '$85,000 / year',
        keyTerms: 'Standard 40 hours per week, on-site reporting required.',
        evidenceIds: [photo1Id],
      }
    );
    assert.strictEqual(contractRes.statusCode, 201, 'Contract creation should return 201');
    assert.ok(contractRes.json?.contract?._id, 'Contract should return generated ID');
    assert.strictEqual(contractRes.json.contract.evidenceIds.length, 1, 'Contract should link 1 evidence item');
    console.log(`✓ PASS: Contract record preserved (Title: ${contractRes.json.contract.title}, Status: Active).\n`);
    const contractId = contractRes.json.contract._id;

    // ----------------------------------------------------
    // Test 14: Download Case Bundle (.ZIP)
    // ----------------------------------------------------
    console.log('Test 14: Download Case Bundle as ZIP archive');
    const caseZipRes = await makeRequest(server, {
      path: `/api/cases/${case1Id}/download-zip`,
      method: 'GET',
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    assert.strictEqual(caseZipRes.statusCode, 200, 'Case zip download should return 200');
    assert.strictEqual(caseZipRes.headers['content-type'], 'application/zip');
    assert.ok(caseZipRes.buffer.length > 500, 'Case zip archive must be non-empty');
    console.log(`✓ PASS: Case bundle ZIP generated and streamed successfully (${caseZipRes.buffer.length} bytes).\n`);

    // ----------------------------------------------------
    // Test 15: Download Contract Certificate (.PDF) and Contract Bundle (.ZIP)
    // ----------------------------------------------------
    console.log('Test 15: Download Contract Preservation Certificate PDF & Bundle ZIP');
    const contractPdfRes = await makeRequest(server, {
      path: `/api/contacts/contracts/${contractId}/export`,
      method: 'GET',
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    assert.strictEqual(contractPdfRes.statusCode, 200, 'Contract certificate PDF export should return 200');
    assert.strictEqual(contractPdfRes.headers['content-type'], 'application/pdf');
    assert.ok(contractPdfRes.buffer.length > 500, 'Contract certificate PDF must be non-empty');

    const contractZipRes = await makeRequest(server, {
      path: `/api/contacts/contracts/${contractId}/download-zip`,
      method: 'GET',
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    assert.strictEqual(contractZipRes.statusCode, 200, 'Contract bundle ZIP download should return 200');
    assert.strictEqual(contractZipRes.headers['content-type'], 'application/zip');
    assert.ok(contractZipRes.buffer.length > 500, 'Contract bundle ZIP must be non-empty');
    console.log(`✓ PASS: Contract Certificate PDF (${contractPdfRes.buffer.length} bytes) and Bundle ZIP (${contractZipRes.buffer.length} bytes) verified.\n`);

    // ----------------------------------------------------
    // Test 16: AI Contract Drafting and Formal Legal Agreement PDF Export
    // ----------------------------------------------------
    console.log('Test 16: AI Contract Drafting & Formal Legal Agreement PDF Export');
    const draftRes = await makeRequest(
      server,
      {
        path: '/api/contacts/contracts/generate',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user1Token}`,
          'Content-Type': 'application/json',
        },
      },
      {
        title: 'Software Development & Evidentiary Support Agreement',
        contractType: 'Independent Contractor Agreement',
        counterpartyName: 'Apex Innovations LLC',
        startDate: '2026-10-01',
        endDate: '2027-09-30',
        value: '$75,000 USD payable in milestone increments',
        governingLaw: 'State of California',
        keyTerms: 'Developer agrees to provide software maintenance and evidentiary audit reports.',
      }
    );
    assert.strictEqual(draftRes.statusCode, 200, 'AI contract generation should return 200');
    assert.ok(draftRes.json.contractBody.includes('ARTICLE 1'), 'Generated contract body must have formal articles');
    assert.ok(draftRes.json.contractBody.includes('Apex Innovations LLC'), 'Generated contract must include counterparty');
    console.log('✓ PASS: AI synthesized complete multi-article formal legal contract draft.');

    // Save draft into contract and test formal PDF download
    const updateRes = await makeRequest(
      server,
      {
        path: `/api/contacts/contracts/${contractId}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user1Token}`,
          'Content-Type': 'application/json',
        },
      },
      {
        contractBody: draftRes.json.contractBody,
        governingLaw: 'State of California',
      }
    );
    assert.strictEqual(updateRes.statusCode, 200, 'Updating contract body should return 200');

    const formalPdfRes = await makeRequest(server, {
      path: `/api/contacts/contracts/${contractId}/export-contract-doc`,
      method: 'GET',
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    assert.strictEqual(formalPdfRes.statusCode, 200, 'Formal contract document PDF export should return 200');
    assert.strictEqual(formalPdfRes.headers['content-type'], 'application/pdf');
    assert.ok(formalPdfRes.buffer.length > 1000, 'Formal contract PDF must be non-empty and formatted');
    console.log(`✓ PASS: Formal Legal Agreement PDF successfully generated (${formalPdfRes.buffer.length} bytes).\n`);

    console.log('====================================================');
    console.log('ALL 16 END-TO-END TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runEndToEndTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
