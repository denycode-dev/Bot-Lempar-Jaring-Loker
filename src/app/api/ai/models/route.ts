import { NextResponse } from 'next/server';
import { db } from '@/db';
import { aiProviderCredentials } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { decryptSecret, validateSafeEndpointUrl } from '@/lib/security/encryption';
import { getConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const config = getConfig();

    // 1. Resolve Base URL
    let rawBaseUrl = (body.baseUrl || config.customAiBaseUrl || 'https://api.openai.com/v1').trim();
    // Normalize: remove trailing slash, and remove trailing /models if mistakenly entered
    rawBaseUrl = rawBaseUrl.replace(/\/+$/, '');
    if (rawBaseUrl.endsWith('/models')) {
      rawBaseUrl = rawBaseUrl.slice(0, -'/models'.length).replace(/\/+$/, '');
    }

    // SSRF Check
    const ssrfCheck = validateSafeEndpointUrl(rawBaseUrl);
    if (!ssrfCheck.isValid) {
      return NextResponse.json(
        { success: false, error: ssrfCheck.error || 'Endpoint URL tidak diizinkan (SSRF Protection).' },
        { status: 400 }
      );
    }

    // 2. Resolve API Key / Token
    let apiKey = (body.apiKey || '').trim();

    // If key is masked or empty, read from encrypted database or fallback config
    if (!apiKey || apiKey.includes('••••')) {
      try {
        const creds = await db.query.aiProviderCredentials.findFirst({
          where: and(
            eq(aiProviderCredentials.userId, 'default-user'),
            eq(aiProviderCredentials.isEnabled, true)
          ),
          orderBy: [asc(aiProviderCredentials.priority)],
        });

        if (creds?.apiKeyEncrypted) {
          apiKey = decryptSecret(creds.apiKeyEncrypted, creds.iv, creds.authTag) || '';
        }
      } catch (dbErr) {
        console.warn('Could not read AI key from DB in /api/ai/models:', dbErr);
      }

      if (!apiKey && config.customAiApiKey && !config.customAiApiKey.includes('••••')) {
        apiKey = config.customAiApiKey.trim();
      }

      if (!apiKey && process.env.OPENAI_API_KEY) {
        apiKey = process.env.OPENAI_API_KEY.trim();
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key / Token belum diisi atau disimpan.' },
        { status: 400 }
      );
    }

    // 3. Request {baseUrl}/models
    const targetUrl = `${rawBaseUrl}/models`;
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        const errJson = await res.json();
        errorDetail = errJson?.error?.message || errJson?.message || JSON.stringify(errJson);
      } catch {}

      return NextResponse.json(
        {
          success: false,
          error: `Gagal memuat model (${res.status}): ${errorDetail}`,
        },
        { status: res.status >= 400 && res.status < 500 ? res.status : 502 }
      );
    }

    const data = await res.json();

    // 4. Extract models list
    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (Array.isArray(data.data)) {
      rawList = data.data;
    } else if (Array.isArray(data.models)) {
      rawList = data.models;
    }

    const modelsSet = new Set<string>();
    rawList.forEach((item: any) => {
      const id = (typeof item === 'string' ? item : item?.id || item?.name || item?.model || '').trim();
      if (id) {
        modelsSet.add(id);
        // If model has provider/vendor prefix (e.g. "meng/claude-sonnet-5.5"), also provide bare name
        if (id.includes('/')) {
          const parts = id.split('/');
          const bareName = parts.slice(1).join('/').trim();
          if (bareName) {
            modelsSet.add(bareName);
          }
        }
      }
    });

    const models: string[] = Array.from(modelsSet);

    // Sort models alphabetically
    models.sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      success: true,
      baseUrl: rawBaseUrl,
      models,
      count: models.length,
    });
  } catch (error: any) {
    console.error('Error fetching models in /api/ai/models:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Terjadi kesalahan sistem saat menghubungi endpoint AI.',
      },
      { status: 500 }
    );
  }
}
