/**
 * AI Cover Letter Generator Module
 * Creates highly customized 1-2 paragraph motivation letters tailored to the specific
 * company name, job title, and the candidate's core skills/experience.
 */

import { getConfig } from './config';
import { askUniversalAi } from './aiGateway';

const coverLetterCache = new Map<string, string>();

export interface CoverLetterParams {
  jobTitle: string;
  company: string;
  jobDescriptionSnippet?: string;
  candidateProfileContext?: string;
  preferredLanguage?: 'id' | 'en';
}

export async function generateDynamicCoverLetter(params: CoverLetterParams): Promise<string> {
  const { jobTitle, company, jobDescriptionSnippet = '', preferredLanguage = 'id' } = params;

  // Cache key based on company + jobTitle
  const cacheKey = `${company.toLowerCase()}_${jobTitle.toLowerCase()}`;
  if (coverLetterCache.has(cacheKey)) {
    return coverLetterCache.get(cacheKey)!;
  }

  const config = getConfig();

  // Determine candidate context
  const candidateName = config.fullName || 'Pelamar Kerja';
  const skills = config.skills || 'Full Stack Development, JavaScript, React, Node.js';
  const expYears = config.yearsOfExperience || 1;
  const edu = config.educationLevel || 'Sarjana';

  const systemInstruction = `Kamu adalah asisten penulisan surat lamaran (Cover Letter / Motivation Statement) profesional tingkat tinggi.
Tugasmu adalah menyusun surat pengantar singkat (maksimal 2 paragraf padat, sekitar 70-110 kata) untuk formulir aplikasi kerja.
Prinsip Penulisan:
1. Menyapa rekruter / Hiring Manager secara profesional.
2. Menyebut secara spesifik nama posisi: "${jobTitle}" dan nama perusahaan: "${company}".
3. Menjelaskan kecocokan latar belakang kandidat (${expYears} tahun pengalaman, keahlian: ${skills}, pendidikan: ${edu}) dengan kebutuhan posisi tersebut.
4. Gunakan gaya bahasa yang sopan, antusias, percaya diri, tanpa basa-basi berlebihan.
5. Bahasa: ${preferredLanguage === 'id' ? 'Bahasa Indonesia yang formal dan elegan' : 'Professional fluent English'}.
6. Output HANYA berupa teks isi surat/paragraf, jangan tambahkan judul, subjek, atau tanda kurung placeholder.`;

  const userPrompt = `Nama Kandidat: ${candidateName}
Posisi Dilamar: ${jobTitle}
Nama Perusahaan: ${company}
Keahlian: ${skills}
${jobDescriptionSnippet ? `Potongan Deskripsi Loker: "${jobDescriptionSnippet.slice(0, 400)}"` : ''}

Buatkan surat pengantar singkat yang memikat sekarang:`;

  try {
    const letter = await askUniversalAi({
      systemPrompt: systemInstruction,
      userPrompt,
      temperature: 0.7,
    });

    if (letter?.trim()) {
      const cleanLetter = letter.trim();
      coverLetterCache.set(cacheKey, cleanLetter);
      return cleanLetter;
    }
  } catch {
    // Fallback template jika offline atau AI timeout
  }

  // Graceful Fallback Template
  const fallback = preferredLanguage === 'id'
    ? `Kepada Yth. Tim Rekrutmen ${company},\n\nMelalui pesan ini, saya ingin menyatakan ketertarikan saya untuk posisi ${jobTitle}. Dengan latar belakang keahlian saya di bidang ${skills} serta pengalaman kerja yang solid, saya optimis dapat berkontribusi secara nyata bagi perkembangan tim ${company}. Saya sangat menyambut kesempatan untuk mendiskusikan kualifikasi saya lebih lanjut.\n\nHormat saya,\n${candidateName}`
    : `Dear Hiring Team at ${company},\n\nI am writing to express my enthusiastic interest in the ${jobTitle} position. With my background in ${skills} and relevant hands-on experience, I am confident in my ability to deliver meaningful impact to ${company}. I look forward to the opportunity to discuss my qualifications with you.\n\nSincerely,\n${candidateName}`;

  coverLetterCache.set(cacheKey, fallback);
  return fallback;
}
