import crypto from 'node:crypto';

function getEncryptionKey(): Buffer {
  const secret = process.env.DOC_ENCRYPTION_KEY || process.env.AUTH_SECRET || 'docvault-default-secret-key-change-me';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a binary buffer using AES-256-GCM.
 * Output format: [12-byte IV][16-byte AuthTag][Ciphertext]
 */
export function encryptBuffer(buffer: Buffer): Buffer {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 12 bytes standard for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag(); // 16 bytes

  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypts a binary buffer that was encrypted using encryptBuffer.
 * Expects format: [12-byte IV][16-byte AuthTag][Ciphertext]
 */
export function decryptBuffer(encryptedBuffer: Buffer): Buffer {
  if (encryptedBuffer.length < 28) {
    throw new Error('Invalid encrypted document payload: buffer too short.');
  }

  const key = getEncryptionKey();
  const iv = encryptedBuffer.subarray(0, 12);
  const authTag = encryptedBuffer.subarray(12, 28);
  const ciphertext = encryptedBuffer.subarray(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
