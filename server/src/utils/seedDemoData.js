import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Evidence from '../models/Evidence.js';
import Case from '../models/Case.js';
import { calculateFileSha256 } from '../services/hashService.js';
import { getStorageDir } from '../services/storageService.js';
import { buildCaseAnalysis } from '../services/aiService.js';

export const seedDemoData = async () => {
  console.log('Seeding demo data for ProofPath...');

  const demoEmail = 'demo@proofpath.app';
  let demoUser = await User.findOne({ email: demoEmail });

  if (!demoUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('ProofPath2026!', salt);
    demoUser = await User.create({
      fullName: 'Alex Vance (Demo User)',
      email: demoEmail,
      passwordHash,
    });
    console.log('Created Demo User:', demoUser.email);
  }

  // Clear previous demo evidence & cases for this demo user
  await Evidence.deleteMany({ userId: demoUser._id });
  await Case.deleteMany({ userId: demoUser._id });

  const storageDir = getStorageDir();

  // 1. Create a sample workplace photo file
  // A minimal valid 1x1 JPEG buffer or standard PNG buffer
  const samplePhotoKey = `demo-workplace-photo-${Date.now()}.jpg`;
  const samplePhotoPath = path.join(storageDir, samplePhotoKey);
  
  // Minimal valid JPEG binary
  const minimalJpegBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
    0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
    0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
    0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
    0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0x7f, 0x00, 0xff, 0xd9
  ]);
  fs.writeFileSync(samplePhotoPath, minimalJpegBuffer);
  const photoSha256 = await calculateFileSha256(samplePhotoPath);

  const evidence1 = await Evidence.create({
    userId: demoUser._id,
    title: 'Workplace Desk & ID Badge Photo — September 23',
    description: 'Photograph captured upon arrival at the 4th floor engineering department desk.',
    category: 'Attendance',
    tags: ['work', 'attendance', 'badge', 'september23', 'demo'],
    originalFilename: 'IMG_4829_workplace.jpg',
    storageKey: samplePhotoKey,
    mimeType: 'image/jpeg',
    fileSize: minimalJpegBuffer.length,
    sha256: photoSha256,
    uploadTimestamp: new Date('2026-09-23T08:20:00Z'),
    metadata: {
      dateTimeOriginal: '2026-09-23T08:16:42.000Z',
      createDate: '2026-09-23T08:16:42.000Z',
      gpsLatitude: 37.774929,
      gpsLongitude: -122.419416,
      make: 'Apple',
      model: 'iPhone 15 Pro',
      imageWidth: 4032,
      imageHeight: 3024,
      orientation: 1,
      hasGps: true,
      hasExif: true,
      rawFieldsFound: ['DateTimeOriginal', 'GPSLatitude', 'GPSLongitude', 'Make', 'Model', 'ImageWidth', 'ImageHeight'],
    },
  });

  // 2. Supervisor WhatsApp Message screenshot (No GPS)
  const sampleMsgKey = `demo-supervisor-message-${Date.now()}.png`;
  const sampleMsgPath = path.join(storageDir, sampleMsgKey);
  fs.writeFileSync(sampleMsgPath, minimalJpegBuffer); // file present on disk
  const msgSha256 = await calculateFileSha256(sampleMsgPath);

  const evidence2 = await Evidence.create({
    userId: demoUser._id,
    title: 'Supervisor WhatsApp Chat — Morning Check-in',
    description: 'Screenshot showing morning greeting and task confirmation with shift supervisor on September 23.',
    category: 'Communication',
    tags: ['whatsapp', 'supervisor', 'chat', 'september23', 'demo'],
    originalFilename: 'Screenshot_20260923_Supervisor.png',
    storageKey: sampleMsgKey,
    mimeType: 'image/png',
    fileSize: minimalJpegBuffer.length,
    sha256: msgSha256,
    uploadTimestamp: new Date('2026-09-23T08:45:00Z'),
    metadata: {
      dateTimeOriginal: '2026-09-23T08:24:10.000Z',
      createDate: '2026-09-23T08:24:10.000Z',
      gpsLatitude: null,
      gpsLongitude: null,
      make: null,
      model: null,
      imageWidth: 1170,
      imageHeight: 2532,
      hasGps: false,
      hasExif: true,
      rawFieldsFound: ['DateTimeOriginal', 'ImageWidth', 'ImageHeight'],
    },
  });

  // 3. Attendance Document / Payslip (Document, no EXIF/GPS)
  const sampleDocKey = `demo-attendance-record-${Date.now()}.pdf`;
  const sampleDocPath = path.join(storageDir, sampleDocKey);
  fs.writeFileSync(sampleDocPath, Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000098 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n167\n%%EOF'));
  const docSha256 = await calculateFileSha256(sampleDocPath);

  const evidence3 = await Evidence.create({
    userId: demoUser._id,
    title: 'September Bi-Weekly Card Access Log Report',
    description: 'Turnstile access badge log export for the engineering facility covering late September.',
    category: 'Employment',
    tags: ['badge', 'turnstile', 'access-log', 'demo'],
    originalFilename: 'Facility_Access_Log_Sept2026.pdf',
    storageKey: sampleDocKey,
    mimeType: 'application/pdf',
    fileSize: 420,
    sha256: docSha256,
    uploadTimestamp: new Date('2026-09-25T14:10:00Z'),
    metadata: {
      dateTimeOriginal: null,
      createDate: null,
      gpsLatitude: null,
      gpsLongitude: null,
      make: null,
      model: null,
      hasGps: false,
      hasExif: false,
      rawFieldsFound: [],
    },
  });

  // 4. Create the workplace dispute case linking all three
  const sampleCase = await Case.create({
    userId: demoUser._id,
    title: 'Workplace Attendance Dispute — September 23',
    issueType: 'Employment',
    userDescription:
      'My employer claims that I was completely absent from work on September 23, but I reported to work on schedule at 08:15 AM, checked in with my supervisor, and completed my shift.',
    incidentDate: '2026-09-23',
    evidenceIds: [evidence1._id, evidence2._id, evidence3._id],
    status: 'active',
  });

  // Run AI analysis for the case
  const { provider, analysis } = await buildCaseAnalysis(sampleCase, [evidence1, evidence2, evidence3]);
  sampleCase.aiAnalysis = {
    ...analysis,
    generatedAt: new Date(),
    provider,
    status: 'completed',
  };
  await sampleCase.save();

  console.log('Demo data successfully seeded for user:', demoUser.email);
  return {
    user: {
      email: demoUser.email,
      password: 'ProofPath2026!',
    },
    caseId: sampleCase._id,
    evidenceCount: 3,
  };
};
