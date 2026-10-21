import { NextResponse } from 'next/server';
import { getConfig, saveConfig } from '@/lib/config';
import { maskApiKey, encryptSecret, validateSafeEndpointUrl } from '@/lib/security/encryption';
import { db } from '@/db';
import { aiProviderCredentials, applicantProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET() {
  const config = getConfig();

  // Load encrypted AI credentials from database if present
  let dbAiEndpoints: any[] = [];
  try {
    const creds = await db.query.aiProviderCredentials.findMany({
      where: eq(aiProviderCredentials.userId, 'default-user'),
      orderBy: (c, { asc }) => [asc(c.priority)],
    });

    dbAiEndpoints = creds.map((c) => ({
      id: c.id,
      name: c.provider,
      type: c.provider.toLowerCase().includes('gemini') ? 'gemini' : 'openai_compatible',
      baseUrl: c.baseUrl || '',
      apiKey: '••••••••', // Masked placeholder
      maskedKey: '••••••••',
      hasKey: Boolean(c.apiKeyEncrypted),
      model: c.modelName,
      isActive: c.isEnabled,
    }));
  } catch (err) {
    console.warn('Could not read AI credentials from DB in /api/config GET:', err);
  }

  // Also query profile from PostgreSQL applicant_profiles
  let dbProfile: any = null;
  try {
    dbProfile = await db.query.applicantProfiles.findFirst({
      where: eq(applicantProfiles.userId, 'default-user'),
    });
  } catch (err) {
    console.warn('Could not read applicant profile from DB in /api/config GET:', err);
  }

  // Create sanitized client-safe copy of config
  const sanitizedConfig = {
    ...config,
    fullName: dbProfile?.fullName || config.fullName,
    email: dbProfile?.email || config.email,
    phoneNumber: dbProfile?.phone || config.phoneNumber,
    address: dbProfile?.currentAddress || config.address,
    linkedinUrl: dbProfile?.linkedinUrl || config.linkedinUrl,
    githubUrl: dbProfile?.githubUrl || config.githubUrl,
    portfolioUrl: dbProfile?.portfolioUrl || config.portfolioUrl,
    skills: Array.isArray(dbProfile?.skills) ? dbProfile.skills.join(', ') : config.skills,
    expectedSalary: dbProfile?.expectedSalaryMax || config.expectedSalary,
    noticePeriod: dbProfile?.noticePeriod || config.noticePeriod,
    // Masked AI Keys
    geminiApiKey: maskApiKey(config.geminiApiKey),
    customAiApiKey: maskApiKey(config.customAiApiKey),
    hasGeminiKey: Boolean(config.geminiApiKey?.trim()),
    hasCustomAiKey: Boolean(config.customAiApiKey?.trim()),
    aiEndpoints: dbAiEndpoints.length > 0 ? dbAiEndpoints : config.aiEndpoints?.map((ep) => ({
      ...ep,
      apiKey: maskApiKey(ep.apiKey),
      hasKey: Boolean(ep.apiKey?.trim()),
    })),
  };

  return NextResponse.json({
    success: true,
    config: sanitizedConfig,
    ...sanitizedConfig,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation
    if (body.fullName !== undefined && typeof body.fullName === 'string' && !body.fullName.trim()) {
      return NextResponse.json({ success: false, error: 'Nama Lengkap wajib diisi' }, { status: 400 });
    }

    if (body.phoneNumber !== undefined && typeof body.phoneNumber === 'string' && !body.phoneNumber.trim()) {
      return NextResponse.json({ success: false, error: 'Nomor Telepon wajib diisi' }, { status: 400 });
    }

    if (body.concurrency !== undefined) {
      const num = Number(body.concurrency);
      if (isNaN(num) || num < 1 || num > 8) {
        return NextResponse.json({ success: false, error: 'Worker konkuren harus antara 1 dan 8' }, { status: 400 });
      }
    }

    // SSRF validation for custom endpoint URL
    if (body.customAiBaseUrl) {
      const ssrf = validateSafeEndpointUrl(body.customAiBaseUrl);
      if (!ssrf.isValid) {
        return NextResponse.json({ success: false, error: ssrf.error }, { status: 400 });
      }
    }

    // Handle AI Key Encryption & PostgreSQL Storage
    const userId = 'default-user';

    // 1. If Gemini key provided and not masked
    if (body.geminiApiKey && typeof body.geminiApiKey === 'string' && !body.geminiApiKey.includes('••••')) {
      const encrypted = encryptSecret(body.geminiApiKey.trim());
      await db
        .insert(aiProviderCredentials)
        .values({
          userId,
          provider: 'Google Gemini',
          modelName: 'gemini-2.5-flash',
          apiKeyEncrypted: encrypted.ciphertext,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          isEnabled: true,
          isPrimary: true,
          priority: 1,
        })
        .onConflictDoUpdate({
          target: [aiProviderCredentials.userId, aiProviderCredentials.provider],
          set: {
            apiKeyEncrypted: encrypted.ciphertext,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            updatedAt: new Date(),
          },
        });
    }

    // 2. Custom AI Router / OpenAI Standard credentials & config
    const hasNewCustomKey =
      body.customAiApiKey && typeof body.customAiApiKey === 'string' && !body.customAiApiKey.includes('••••');

    if (hasNewCustomKey) {
      const encrypted = encryptSecret(body.customAiApiKey.trim());
      await db
        .insert(aiProviderCredentials)
        .values({
          userId,
          provider: 'Custom AI Router',
          modelName: body.customAiModel || 'gpt-4o-mini',
          baseUrl: body.customAiBaseUrl || 'https://api.openai.com/v1',
          apiKeyEncrypted: encrypted.ciphertext,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          isEnabled: true,
          isPrimary: true,
          priority: 1,
        })
        .onConflictDoUpdate({
          target: [aiProviderCredentials.userId, aiProviderCredentials.provider],
          set: {
            apiKeyEncrypted: encrypted.ciphertext,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            modelName: body.customAiModel || 'gpt-4o-mini',
            baseUrl: body.customAiBaseUrl || 'https://api.openai.com/v1',
            isPrimary: true,
            priority: 1,
            updatedAt: new Date(),
          },
        });
    } else if (body.customAiModel || body.customAiBaseUrl) {
      // Key was not modified (e.g. masked), but model or baseUrl was changed
      await db
        .update(aiProviderCredentials)
        .set({
          ...(body.customAiModel ? { modelName: body.customAiModel } : {}),
          ...(body.customAiBaseUrl ? { baseUrl: body.customAiBaseUrl } : {}),
          isPrimary: true,
          priority: 1,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(aiProviderCredentials.userId, userId),
            eq(aiProviderCredentials.provider, 'Custom AI Router')
          )
        );
    }

    // 3. Update Applicant Profile in PostgreSQL
    const skillsList = body.skills
      ? (typeof body.skills === 'string' ? body.skills.split(',').map((s: string) => s.trim()) : body.skills)
      : undefined;

    await db
      .insert(applicantProfiles)
      .values({
        userId,
        fullName: body.fullName || 'User',
        email: body.email || 'user@example.com',
        phone: body.phoneNumber || '-',
        currentAddress: body.address,
        linkedinUrl: body.linkedinUrl,
        githubUrl: body.githubUrl,
        portfolioUrl: body.portfolioUrl,
        skills: skillsList || [],
        expectedSalaryMax: body.expectedSalary ? Number(body.expectedSalary) : undefined,
        noticePeriod: body.noticePeriod,
      })
      .onConflictDoUpdate({
        target: [applicantProfiles.userId],
        set: {
          fullName: body.fullName,
          email: body.email,
          phone: body.phoneNumber,
          currentAddress: body.address,
          linkedinUrl: body.linkedinUrl,
          githubUrl: body.githubUrl,
          portfolioUrl: body.portfolioUrl,
          skills: skillsList,
          expectedSalaryMax: body.expectedSalary ? Number(body.expectedSalary) : undefined,
          noticePeriod: body.noticePeriod,
          updatedAt: new Date(),
        },
      });

    // Also update legacy config.json without plaintext sensitive keys
    const currentConfig = getConfig();
    const configToSave = {
      ...body,
      // If client sent masked key, keep existing key in file or omit
      geminiApiKey: body.geminiApiKey?.includes('••••') ? currentConfig.geminiApiKey : body.geminiApiKey,
      customAiApiKey: body.customAiApiKey?.includes('••••') ? currentConfig.customAiApiKey : body.customAiApiKey,
    };
    const updated = saveConfig(configToSave);

    return NextResponse.json({
      success: true,
      message: 'Konfigurasi berhasil disimpan dengan aman!',
      config: {
        ...updated,
        geminiApiKey: maskApiKey(updated.geminiApiKey),
        customAiApiKey: maskApiKey(updated.customAiApiKey),
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, error: errMsg }, { status: 400 });
  }
}
