/**
 * Sanitize string input to prevent XSS
 * Removes HTML tags and dangerous characters
 */
export function sanitizeString(input: string): string {
  if (!input) return input;

  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, char => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
        '&': '&amp;',
      };
      return entities[char] || char;
    })
    .trim();
}

/**
 * Mask sensitive data (email, phone, etc.)
 * @param value - Value to mask
 * @param visibleChars - Number of visible characters at start and end
 */
export function maskSensitiveData(value: string, visibleChars = 3): string {
  if (!value || value.length <= visibleChars * 2) {
    return '*'.repeat(value?.length || 0);
  }

  const start = value.slice(0, visibleChars);
  const end = value.slice(-visibleChars);
  const middle = '*'.repeat(value.length - visibleChars * 2);

  return `${start}${middle}${end}`;
}

/**
 * Mask email address
 * @param email - Email to mask
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');

  if (!localPart || !domain) {
    return maskSensitiveData(email);
  }

  const maskedLocal =
    localPart.length > 2
      ? localPart.slice(0, 2) + '*'.repeat(localPart.length - 2)
      : '*'.repeat(localPart.length);

  return `${maskedLocal}@${domain}`;
}

/**
 * Remove null and undefined values from object
 */
export function removeNullish<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      result[key as keyof T] = value as T[keyof T];
    }
  }

  return result;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
