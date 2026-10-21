import { executeOpenAiCompletion, GEMINI_OPENAI_BASE_URL } from './ai/openAiClient';
import { db } from '../db';
import { aiProviderCredentials } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { decryptSecret, validateSafeEndpointUrl } from './security/encryption';
import { getConfig } from './config';

export interface AiCompletionOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  jsonMode?: boolean;
}

/**
 * Universal AI Completion Function with Multi-Provider Chaining & Automatic Fallback.
 * Prioritizes encrypted PostgreSQL database credentials, followed by config fallback and .env.
 */
export async function askUniversalAi(options: AiCompletionOptions): Promise<string> {
  const errors: string[] = [];

  // 1. First Priority: PostgreSQL ai_provider_credentials (AES-256-GCM protected)
  try {
    const dbCredentials = await db.query.aiProviderCredentials.findMany({
      where: and(
        eq(aiProviderCredentials.userId, 'default-user'),
        eq(aiProviderCredentials.isEnabled, true)
      ),
      orderBy: [asc(aiProviderCredentials.priority)],
    });

    for (const cred of dbCredentials) {
      try {
        const apiKey = decryptSecret(cred.apiKeyEncrypted, cred.iv, cred.authTag);
        if (!apiKey) continue;

        const isGemini = cred.provider.toLowerCase().includes('gemini');
        const defaultBaseUrl = isGemini ? GEMINI_OPENAI_BASE_URL : 'https://api.9router.com/v1';
        const baseUrl = cred.baseUrl || defaultBaseUrl;

        // SSRF Check
        const ssrfCheck = validateSafeEndpointUrl(baseUrl);
        if (!ssrfCheck.isValid) {
          console.warn(`SSRF Blocked endpoint ${baseUrl}: ${ssrfCheck.error}`);
          continue;
        }

        const model = cred.modelName || (isGemini ? 'gemini-2.5-flash' : 'google/gemini-2.5-flash');

        return await executeOpenAiCompletion({
          apiKey,
          baseUrl,
          model,
          systemPrompt: options.systemPrompt,
          userPrompt: options.userPrompt,
          temperature: options.temperature,
          jsonMode: options.jsonMode,
          timeoutMs: 25000,
        });
      } catch (err: any) {
        const msg = `DB Provider [${cred.provider} (${cred.modelName})]: ${err?.message || err}`;
        console.warn(`AI Gateway failover -> ${msg}`);
        errors.push(msg);
      }
    }
  } catch (dbErr: any) {
    console.warn('Could not read AI credentials from DB, falling back to legacy config:', dbErr?.message);
  }

  // 2. Second Priority: Legacy config.json fields (during migration)
  const config = getConfig();
  if (config.geminiApiKey?.trim()) {
    try {
      return await executeOpenAiCompletion({
        apiKey: config.geminiApiKey.trim(),
        baseUrl: GEMINI_OPENAI_BASE_URL,
        model: 'gemini-2.5-flash',
        systemPrompt: options.systemPrompt,
        userPrompt: options.userPrompt,
        temperature: options.temperature,
        jsonMode: options.jsonMode,
        timeoutMs: 25000,
      });
    } catch (e: any) {
      errors.push(`Legacy Gemini Config: ${e?.message || e}`);
    }
  }

  if (config.customAiApiKey?.trim() && config.customAiBaseUrl?.trim()) {
    try {
      return await executeOpenAiCompletion({
        apiKey: config.customAiApiKey.trim(),
        baseUrl: config.customAiBaseUrl,
        model: config.customAiModel || 'google/gemini-2.5-flash',
        systemPrompt: options.systemPrompt,
        userPrompt: options.userPrompt,
        temperature: options.temperature,
        jsonMode: options.jsonMode,
        timeoutMs: 25000,
      });
    } catch (e: any) {
      errors.push(`Legacy Custom AI: ${e?.message || e}`);
    }
  }

  // 3. Final Fallback: .env file
  const envKey = process.env.GEMINI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (envKey && envKey !== 'your_gemini_api_key_here') {
    try {
      const isGemini = !process.env.OPENAI_API_KEY;
      return await executeOpenAiCompletion({
        apiKey: envKey,
        baseUrl: isGemini ? GEMINI_OPENAI_BASE_URL : (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'),
        model: isGemini ? 'gemini-2.5-flash' : 'gpt-4o-mini',
        systemPrompt: options.systemPrompt,
        userPrompt: options.userPrompt,
        temperature: options.temperature,
        jsonMode: options.jsonMode,
        timeoutMs: 25000,
      });
    } catch (e: any) {
      errors.push(`Env AI Key: ${e?.message || e}`);
    }
  }

  throw new Error(`Seluruh provider AI gagal merespon:\n${errors.join('\n')}`);
}

/**
 * Test a specific endpoint or active endpoint
 */
export async function testAiConnection(specificEndpoint?: {
  apiKey?: string;
  type?: 'gemini' | 'openai_compatible';
  baseUrl?: string;
  model?: string;
}): Promise<{ success: boolean; message: string; reply?: string }> {
  try {
    if (specificEndpoint && specificEndpoint.apiKey) {
      const isGemini = specificEndpoint.type === 'gemini';
      const baseUrl = isGemini
        ? (specificEndpoint.baseUrl || GEMINI_OPENAI_BASE_URL)
        : (specificEndpoint.baseUrl || 'https://api.9router.com/v1');

      const ssrfCheck = validateSafeEndpointUrl(baseUrl);
      if (!ssrfCheck.isValid) {
        return { success: false, message: ssrfCheck.error || 'Endpoint tidak aman (SSRF Protection).' };
      }

      const model = specificEndpoint.model || (isGemini ? 'gemini-2.5-flash' : 'google/gemini-2.5-flash');
      const testPrompt = isGemini
        ? 'Katakan "Koneksi Gemini Sukses!" dalam 1 kalimat pendek.'
        : 'Katakan "Koneksi Router Sukses!" dalam 1 kalimat pendek.';

      const reply = await executeOpenAiCompletion({
        apiKey: specificEndpoint.apiKey.trim(),
        baseUrl,
        model,
        userPrompt: testPrompt,
        temperature: 0.1,
        timeoutMs: 30000,
      });

      return {
        success: true,
        message: isGemini ? 'Koneksi Gemini Sukses!' : 'Koneksi Router Sukses!',
        reply,
      };
    }

    const reply = await askUniversalAi({
      userPrompt: 'Katakan "Koneksi AI Berhasil!" dalam 1 kalimat pendek.',
      temperature: 0.1,
    });
    return {
      success: true,
      message: 'Koneksi AI Aktif & Berfungsi!',
      reply,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal terhubung ke AI',
    };
  }
}
