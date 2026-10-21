import fs from 'fs';
import path from 'path';
import { TalentCandidate } from './talentTypes';
import { db } from '../db';
import { sourcedTalents } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const TALENT_STORAGE_PATH = path.join(process.cwd(), 'sourced_talents.json');

export async function getSourcedTalentsAsync(): Promise<TalentCandidate[]> {
  try {
    const rows = await db
      .select()
      .from(sourcedTalents)
      .where(eq(sourcedTalents.userId, 'default-user'))
      .orderBy(desc(sourcedTalents.sourcedAt));

    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        name: r.candidateName,
        headline: r.headline || '',
        platform: (r.sourcingPlatform === 'glints' ? 'glints' : 'linkedin') as any,
        profileUrl: r.profileUrl,
        location: r.location || 'Indonesia',
        isOpenToWork: true,
        skills: Array.isArray(r.matchedSkills) ? r.matchedSkills : [],
        experiences: [],
        aiHonestyScore: 90,
        aiHonestyNotes: [],
        aiMatchScore: 85,
        availabilityStatus: 'immediate',
        sourcedDate: r.sourcedAt ? new Date(r.sourcedAt).toISOString().split('T')[0] : '',
        status: 'new',
      }));
    }
  } catch (err) {
    console.warn('DB fetch for talents failed, falling back to JSON file:', err);
  }

  return getSourcedTalents();
}

export function getSourcedTalents(): TalentCandidate[] {
  try {
    if (!fs.existsSync(TALENT_STORAGE_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(TALENT_STORAGE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read sourced talents:', err);
    return [];
  }
}

export function saveSourcedTalents(talents: TalentCandidate[]): boolean {
  try {
    fs.writeFileSync(TALENT_STORAGE_PATH, JSON.stringify(talents, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write sourced talents:', err);
    return false;
  }
}

export function upsertCandidate(candidate: TalentCandidate): boolean {
  // Save to JSON
  const current = getSourcedTalents();
  const existingIdx = current.findIndex(
    (c) => c.profileUrl === candidate.profileUrl || c.id === candidate.id
  );

  if (existingIdx >= 0) {
    current[existingIdx] = { ...current[existingIdx], ...candidate };
  } else {
    current.unshift(candidate);
  }
  saveSourcedTalents(current);

  // Async save to PostgreSQL sourced_talents table
  if (candidate.profileUrl) {
    db.insert(sourcedTalents)
      .values({
        userId: 'default-user',
        candidateName: candidate.name || 'Kandidat',
        headline: candidate.headline || '',
        currentCompany: '',
        location: candidate.location || 'Indonesia',
        profileUrl: candidate.profileUrl,
        snippet: candidate.notes || '',
        matchedSkills: candidate.skills || [],
        sourcingPlatform: candidate.platform || 'google_xray',
        sourcedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [sourcedTalents.userId, sourcedTalents.profileUrl],
        set: {
          candidateName: candidate.name || 'Kandidat',
          headline: candidate.headline || '',
          location: candidate.location || 'Indonesia',
          matchedSkills: candidate.skills || [],
        },
      })
      .catch((err) => {
        console.warn('Could not upsert talent to PostgreSQL:', err?.message || err);
      });
  }

  return true;
}

export function exportTalentsToCsv(talents: TalentCandidate[]): string {
  const headers = [
    'Nama Lengkap',
    'Headline',
    'Platform',
    'Open to Work',
    'Domisili / Lokasi',
    'Nomor WhatsApp',
    'Email',
    'Ketersediaan',
    'Skor Kejujuran AI',
    'Catatan AI',
    'URL Profil',
    'Tanggal Scraping',
  ];

  const rows = talents.map((t) => [
    `"${(t.name || '').replace(/"/g, '""')}"`,
    `"${(t.headline || '').replace(/"/g, '""')}"`,
    `"${t.platform}"`,
    t.isOpenToWork ? 'YA' : 'TIDAK',
    `"${(t.location || '').replace(/"/g, '""')}"`,
    `"${t.phone || '-'}"`,
    `"${t.email || '-'}"`,
    `"${t.availabilityStatus}"`,
    `${t.aiHonestyScore}%`,
    `"${(t.aiHonestyNotes || []).join('; ').replace(/"/g, '""')}"`,
    `"${t.profileUrl}"`,
    `"${t.sourcedDate}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
