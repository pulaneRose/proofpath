import crypto from 'crypto';
import fs from 'fs';

/**
 * Calculate SHA-256 hash from a local file path using streams
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export const calculateFileSha256 = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
};

/**
 * Calculate SHA-256 hash from a Buffer
 * @param {Buffer} buffer
 * @returns {string}
 */
export const calculateBufferSha256 = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Recalculate file hash and compare with the recorded integrity hash
 * @param {string} filePath
 * @param {string} recordedHash
 * @returns {Promise<{ valid: boolean, calculatedHash: string, recordedHash: string, checkedAt: string }>}
 */
export const verifyFileIntegrity = async (filePath, recordedHash) => {
  if (!fs.existsSync(filePath)) {
    throw new Error('Stored evidence file not found on disk');
  }

  const calculatedHash = await calculateFileSha256(filePath);
  const valid = calculatedHash.toLowerCase() === (recordedHash || '').toLowerCase();

  return {
    valid,
    calculatedHash,
    recordedHash,
    checkedAt: new Date().toISOString(),
  };
};
