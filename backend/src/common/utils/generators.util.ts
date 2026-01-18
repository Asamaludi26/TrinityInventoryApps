import { randomBytes } from 'crypto';
import { DOC_PREFIX } from '../constants';

/**
 * Generate a cryptographically secure random string
 * @param length - Length of the string
 */
export function generateSecureRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length);
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return result;
}

/**
 * Generate a temporary password (alphanumeric, min 10 chars)
 */
export function generateTemporaryPassword(): string {
  return generateSecureRandomString(12);
}

/**
 * Generate document number with format: PREFIX-YYYY-XXXX
 * @param prefix - Document prefix (AST, RO, HO, etc.)
 * @param sequence - Sequential number
 */
export function generateDocumentNumber(prefix: keyof typeof DOC_PREFIX, sequence: number): string {
  const year = new Date().getFullYear();
  const paddedSequence = String(sequence).padStart(4, '0');
  return `${DOC_PREFIX[prefix]}-${year}-${paddedSequence}`;
}

/**
 * Generate unique asset ID
 * @param sequence - Sequential number for the year
 */
export function generateAssetId(sequence: number): string {
  return generateDocumentNumber('ASSET', sequence);
}

/**
 * Generate request order ID
 * @param sequence - Sequential number for the year
 */
export function generateRequestId(sequence: number): string {
  return generateDocumentNumber('REQUEST', sequence);
}

/**
 * Generate handover document ID
 * @param sequence - Sequential number for the year
 */
export function generateHandoverId(sequence: number): string {
  return generateDocumentNumber('HANDOVER', sequence);
}
