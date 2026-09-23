import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;

function encryptionKey(): Buffer {
  const value = process.env.APP_ENCRYPTION_KEY;
  if (!value || !/^[0-9a-f]{64}$/i.test(value)) {
    throw new Error('APP_ENCRYPTION_KEY must be a 64-character hex value');
  }
  return Buffer.from(value, 'hex');
}

export function encryptSecret(value: string): string {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString('base64url')).join('.');
}

export function decryptSecret(value: string): string {
  const [ivEncoded, tagEncoded, ciphertextEncoded] = value.split('.');
  if (!ivEncoded || !tagEncoded || !ciphertextEncoded) throw new Error('Malformed encrypted secret');
  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(ivEncoded, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagEncoded, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextEncoded, 'base64url')), decipher.final()]).toString('utf8');
}