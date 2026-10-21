import {
  encryptSecret,
  decryptSecret,
  maskApiKey,
  validateSafeEndpointUrl,
} from '../src/lib/security/encryption';

console.log('🧪 Testing AES-256-GCM Encryption & SSRF Validator...');

process.env.APP_ENCRYPTION_KEY =
  process.env.APP_ENCRYPTION_KEY ||
  'c3f91a27e8d44208a96e5b1287c4d093fe5421a7b8e90c23145f891b2c4d6e7f';

// Test 1: Encryption & Decryption
const originalSecret = 'sk-proj-super-secret-key-123456789';
const encrypted = encryptSecret(originalSecret);
console.log('Encrypted:', encrypted);

const decrypted = decryptSecret(encrypted.ciphertext, encrypted.iv, encrypted.authTag);
if (decrypted !== originalSecret) {
  throw new Error(`Decryption failed! Expected: ${originalSecret}, got: ${decrypted}`);
}
console.log('✅ Encryption / Decryption verified successfully!');

// Test 2: Masking
const masked = maskApiKey(originalSecret);
console.log('Masked key:', masked);
if (!masked.includes('••••••••') || masked.includes('super-secret')) {
  throw new Error(`Masking failed: ${masked}`);
}
console.log('✅ Masking verified successfully!');

// Test 3: SSRF Validator
const safeUrl = validateSafeEndpointUrl('https://api.openai.com/v1');
if (!safeUrl.isValid) {
  throw new Error('Safe URL rejected');
}

const metadataUrl = validateSafeEndpointUrl('http://169.254.169.254/latest/meta-data/');
if (metadataUrl.isValid) {
  throw new Error('Metadata IP allowed erroneously');
}
console.log('✅ SSRF validation verified successfully!');

console.log('🎉 All security tests passed!');
