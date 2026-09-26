import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage base directory - private, completely outside any public web root
// In serverless environments (Vercel/Lambda), only /tmp is writable
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const LOCAL_STORAGE_DIR = isServerless
  ? path.join(os.tmpdir(), 'proofpath-storage', 'evidence')
  : path.resolve(__dirname, '../../storage/evidence');

// Ensure directory exists
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

/**
 * Generate a cryptographically random, collision-resistant storage key
 * @param {string} originalFilename
 * @returns {string}
 */
export const generateStorageKey = (originalFilename) => {
  const ext = path.extname(originalFilename).toLowerCase();
  const safeExt = ext.replace(/[^a-z0-9.]/gi, '');
  return `${uuidv4()}${safeExt}`;
};

/**
 * Get the full filesystem path for a given storageKey
 * @param {string} storageKey
 * @returns {string}
 */
export const getFilePath = (storageKey) => {
  // Prevent path traversal attacks
  const safeKey = path.basename(storageKey);
  return path.join(LOCAL_STORAGE_DIR, safeKey);
};

/**
 * Check if a file exists in private storage
 * @param {string} storageKey
 * @returns {boolean}
 */
export const fileExists = (storageKey) => {
  const filePath = getFilePath(storageKey);
  return fs.existsSync(filePath);
};

/**
 * Delete a file from private storage
 * @param {string} storageKey
 * @returns {Promise<boolean>}
 */
export const deleteFile = async (storageKey) => {
  try {
    const filePath = getFilePath(storageKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error deleting storage key ${storageKey}:`, err);
    return false;
  }
};

/**
 * Create a read stream for a stored file
 * @param {string} storageKey
 * @returns {fs.ReadStream}
 */
export const getFileReadStream = (storageKey) => {
  const filePath = getFilePath(storageKey);
  if (!fs.existsSync(filePath)) {
    throw new Error('Requested evidence file does not exist in vault storage');
  }
  return fs.createReadStream(filePath);
};

export const getStorageDir = () => LOCAL_STORAGE_DIR;
