import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM

function getMasterKey(): Buffer {
  const envKey = process.env.APP_ENCRYPTION_KEY;
  if (!envKey) {
    throw new Error('APP_ENCRYPTION_KEY is not defined in environment variables.');
  }

  // Key must be 32 bytes (64 hex chars or 32 raw bytes)
  if (envKey.length === 64) {
    return Buffer.from(envKey, 'hex');
  }

  if (Buffer.byteLength(envKey, 'utf8') === 32) {
    return Buffer.from(envKey, 'utf8');
  }

  // Hash key if non-standard length to derive consistent 32 bytes
  return crypto.createHash('sha256').update(envKey).digest();
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypt sensitive secret using authenticated AES-256-GCM
 */
export function encryptSecret(plainText: string): EncryptedData {
  if (!plainText) {
    return { ciphertext: '', iv: '', authTag: '' };
  }

  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plainText, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext,
    iv: iv.toString('hex'),
    authTag,
  };
}

/**
 * Decrypt sensitive secret using authenticated AES-256-GCM
 */
export function decryptSecret(ciphertext: string, iv: string, authTag: string): string {
  if (!ciphertext || !iv || !authTag) {
    return '';
  }

  const key = getMasterKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Mask API keys for safe transmission to client components
 * Example: "sk-1234567890abcdef" -> "sk-••••••••cdef"
 */
export function maskApiKey(apiKey?: string): string {
  if (!apiKey || typeof apiKey !== 'string') return '';
  const trimmed = apiKey.trim();
  if (trimmed.length <= 8) return '••••••••';

  const prefix = trimmed.startsWith('sk-') ? 'sk-' : '';
  const suffix = trimmed.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

/**
 * Validate endpoint URLs against SSRF (Server-Side Request Forgery) vulnerabilities
 */
export function validateSafeEndpointUrl(rawUrl: string): { isValid: boolean; error?: string } {
  if (!rawUrl) return { isValid: true };

  try {
    const parsed = new URL(rawUrl);

    // Protocol check: only https allowed (http allowed only for localhost in non-production)
    const isDev = process.env.NODE_ENV !== 'production';
    const isLocalhost =
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '[::1]';

    if (parsed.protocol === 'http:' && !(isDev && isLocalhost)) {
      return {
        isValid: false,
        error: 'Hanya protokol HTTPS aman yang diizinkan untuk endpoint AI eksternal.',
      };
    }

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return {
        isValid: false,
        error: `Protokol tidak valid: ${parsed.protocol}. Hanya https:// yang diizinkan.`,
      };
    }

    const host = parsed.hostname.toLowerCase();

    // Block cloud metadata endpoints
    if (host === '169.254.169.254' || host === 'metadata.google.internal') {
      return { isValid: false, error: 'Akses ke metadata endpoint dilarang keras (SSRF Protection).' };
    }

    // Block private IP ranges unless localhost in development
    if (!isDev) {
      if (
        host === '127.0.0.1' ||
        host === 'localhost' ||
        host.startsWith('10.') ||
        host.startsWith('192.168.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
      ) {
        return { isValid: false, error: 'Akses ke jaringan lokal internal dilarang (SSRF Protection).' };
      }
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Format URL tidak valid.' };
  }
}
