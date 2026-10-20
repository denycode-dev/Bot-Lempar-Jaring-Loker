import OpenAI from 'openai';

export interface OpenAiRequestOptions {
  apiKey: string;
  baseUrl?: string;
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
}

/**
 * Standard Google Gemini OpenAI Compatibility Base URL
 */
export const GEMINI_OPENAI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';

/**
 * Creates an OpenAI client instance configured for standard or custom OpenAI-compatible providers
 */
export function createOpenAiClient(apiKey: string, baseUrl?: string, timeoutMs: number = 25000): OpenAI {
  let cleanBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, '') : undefined;

  // Auto-detect Google Gemini API key if no baseUrl is explicitly provided
  if (!cleanBaseUrl && apiKey.trim().startsWith('AIzaSy')) {
    cleanBaseUrl = GEMINI_OPENAI_BASE_URL;
  }

  return new OpenAI({
    apiKey: apiKey.trim(),
    baseURL: cleanBaseUrl,
    timeout: timeoutMs,
    maxRetries: 2, // Built-in exponential backoff for HTTP 429/503
  });
}

/**
 * Executes a chat completion using the official OpenAI SDK
 */
export async function executeOpenAiCompletion(options: OpenAiRequestOptions): Promise<string> {
  const client = createOpenAiClient(options.apiKey, options.baseUrl, options.timeoutMs);

  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  if (options.systemPrompt?.trim()) {
    messages.push({ role: 'system', content: options.systemPrompt.trim() });
  }
  messages.push({ role: 'user', content: options.userPrompt });

  const response = await client.chat.completions.create({
    model: options.model,
    messages,
    temperature: options.temperature ?? 0.2,
    response_format: options.jsonMode ? { type: 'json_object' } : undefined,
  });

  return (response.choices[0]?.message?.content || '').trim();
}
