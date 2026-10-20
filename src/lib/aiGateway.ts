import { getConfig, AiEndpointConfig } from './config';
import { executeOpenAiCompletion, GEMINI_OPENAI_BASE_URL } from './ai/openAiClient';

export interface AiCompletionOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  jsonMode?: boolean;
}

/**
 * Universal AI Completion Function with Multi-Provider Chaining & Automatic Fallback
 * Powered by the official OpenAI SDK supporting OpenAI-compatible APIs & Gemini:
 * 1. Checks active endpoint from `aiEndpoints` list
 * 2. Tries remaining configured endpoints in sequence
 * 3. Falls back to legacy config fields
 * 4. Falls back to .env GEMINI_API_KEY
 */
export async function askUniversalAi(options: AiCompletionOptions): Promise<string> {
  const config = getConfig();
  const errors: string[] = [];

  // Build execution queue from aiEndpoints list
  const endpoints: AiEndpointConfig[] = Array.isArray(config.aiEndpoints) && config.aiEndpoints.length > 0
    ? config.aiEndpoints
    : [
        {
          id: 'ep-gemini',
          name: 'Google Gemini',
          type: 'gemini',
          baseUrl: '',
          apiKey: config.geminiApiKey || '',
          model: 'gemini-2.5-flash',
          isActive: config.aiProvider !== 'custom_router',
        },
        {
          id: 'ep-custom',
          name: 'Custom Router',
          type: 'openai_compatible',
          baseUrl: config.customAiBaseUrl || 'https://api.9router.com/v1',
          apiKey: config.customAiApiKey || '',
          model: config.customAiModel || 'google/gemini-2.5-flash',
          isActive: config.aiProvider === 'custom_router',
        },
      ];

  // Prioritize active endpoint first, followed by other configured endpoints
  const activeId = config.activeAiEndpointId;
  const sorted = [...endpoints].sort((a, b) => {
    if (a.id === activeId || a.isActive) return -1;
    if (b.id === activeId || b.isActive) return 1;
    return 0;
  });

  for (const ep of sorted) {
    if (!ep.apiKey?.trim()) continue;

    try {
      const isGemini = ep.type === 'gemini';
      const baseUrl = isGemini
        ? (ep.baseUrl || GEMINI_OPENAI_BASE_URL)
        : (ep.baseUrl || 'https://api.9router.com/v1');
      const model = ep.model || (isGemini ? 'gemini-2.5-flash' : 'google/gemini-2.5-flash');

      return await executeOpenAiCompletion({
        apiKey: ep.apiKey.trim(),
        baseUrl,
        model,
        systemPrompt: options.systemPrompt,
        userPrompt: options.userPrompt,
        temperature: options.temperature,
        jsonMode: options.jsonMode,
        timeoutMs: 25000,
      });
    } catch (err: any) {
      const msg = `Provider [${ep.name} (${ep.model})]: ${err?.message || err}`;
      console.warn(`AI Gateway failover -> ${msg}`);
      errors.push(msg);
    }
  }

  // Fallback to legacy fields if not covered
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

  // Final Fallback: .env file
  const envKey = process.env.GEMINI_API_KEY?.trim();
  if (envKey && envKey !== 'your_gemini_api_key_here') {
    try {
      return await executeOpenAiCompletion({
        apiKey: envKey,
        baseUrl: GEMINI_OPENAI_BASE_URL,
        model: 'gemini-2.5-flash',
        systemPrompt: options.systemPrompt,
        userPrompt: options.userPrompt,
        temperature: options.temperature,
        jsonMode: options.jsonMode,
        timeoutMs: 25000,
      });
    } catch (e: any) {
      errors.push(`Gemini .env: ${e?.message || e}`);
    }
  }

  throw new Error(`Seluruh provider AI gagal merespon:\n${errors.join('\n')}`);
}

/**
 * Test a specific endpoint or active endpoint using the unified OpenAI client
 */
export async function testAiConnection(specificEndpoint?: Partial<AiEndpointConfig>): Promise<{ success: boolean; message: string; reply?: string }> {
  try {
    if (specificEndpoint && specificEndpoint.apiKey) {
      const isGemini = specificEndpoint.type === 'gemini';
      const baseUrl = isGemini
        ? (specificEndpoint.baseUrl || GEMINI_OPENAI_BASE_URL)
        : (specificEndpoint.baseUrl || 'https://api.9router.com/v1');
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
