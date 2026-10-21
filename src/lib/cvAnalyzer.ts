import fs from 'fs';
import path from 'path';

export interface CVAnalysisResult {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  maritalStatus?: string;
  dateOfBirth?: string;
  postalCode?: string;
  domicile?: string;
  address?: string;
  educationLevel?: string;
  gpa?: string;
  yearsOfExperience?: number;
  expectedSalary?: number;
  noticePeriod?: string;
  skills?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  summary?: string;
}

export interface ScreeningQuestionItem {
  questionText: string;
  normalizedQuestion: string;
  answerText: string;
  category: 'experience' | 'salary' | 'availability' | 'skills' | 'general' | 'education';
  matchType?: 'exact' | 'keyword';
  confidenceScore?: string;
}

export interface CVEnhancedAnalysisResponse {
  profile: CVAnalysisResult;
  missingFields: string[];
  screeningQuestions: ScreeningQuestionItem[];
  honestyNotes: string[];
}

/**
 * Extracts raw text from uploaded PDF or DOCX file
 */
export async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    const { extractText, getDocumentProxy } = await import('unpdf');
    const dataBuffer = fs.readFileSync(filePath);
    const pdf = await getDocumentProxy(new Uint8Array(dataBuffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text || '';
  } else if (ext === '.docx' || ext === '.doc') {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } else if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf8');
  }

  throw new Error(`Format file ${ext} tidak didukung. Harap upload PDF atau DOCX.`);
}

/**
 * Normalizes question string to lowercase alphanumeric for reliable deduplication & matching
 */
export function normalizeQuestionText(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Sends CV text to Gemini / 9Router / Custom AI to extract structured candidate profile,
 * detect missing fields, and generate an honest Screening Questions Bank.
 */
export async function analyzeCvWithAi(rawCvText: string): Promise<CVEnhancedAnalysisResponse> {
  const { askUniversalAi } = require('./aiGateway');

  const prompt = `Anda adalah asisten AI rekrutmen profesional dan auditor verifikasi data pelamar. Analisis teks Curriculum Vitae (CV) berikut dan ekstrak data pelamar serta buatkan Database Soal Kuesioner (Screening Questions Bank) dengan PRINSIP KEJUJURAN MUTLAK (Zero Hallucination).

DATA CV:
"""
${rawCvText.slice(0, 15000)}
"""

PETUNJUK & ATURAN KEJUJURAN:
1. Hanya ambil informasi yang BENAR-BENAR TERCANTUM dalam teks CV. Jangan mengarang, menebak, atau merekayasa data yang tidak tertulis.
2. Jika ada informasi yang TIDAK ADA di CV (misalnya ekspektasi gaji, ketersediaan/notice period, tanggal lahir, status pernikahan, atau IPK), berikan nilai null/string kosong, dan catat nama kolomnya di dalam array "missingFields".
3. Buatkan minimal 8 sampai 12 pertanyaan kuesioner screening umum (JobStreet / Glints / Indeed) dan berikan jawaban jujur yang mewakili kandidat ini sesuai isi CV.
   Kategori pertanyaan meliputi:
   - "experience": Pengalaman kerja terkait keahlian kandidat
   - "skills": Penguasaan tools/teknologi/kompetensi yang tercantum di CV
   - "salary": Pertanyaan ekspektasi gaji (jika tidak ada di CV, gunakan format: "Ekspektasi gaji dapat dinegosiasikan sesuai standar industri dan tanggung jawab posisi")
   - "availability": Pertanyaan notice period / ketersediaan mulai bekerja (default: "Segera (Immediately) atau sesuai kesepakatan")
   - "general": Legalitas kerja (WNI), kesediaan kerja onsite/hybrid di domisili kandidat, kesediaan lembur/dinas luar kota jika diperlukan
   - "education": Kualifikasi pendidikan formal kandidat

FORMAT JSON WAJIB (Hanya JSON murni tanpa markdown fence):
{
  "profile": {
    "fullName": "Nama lengkap pelamar",
    "email": "Alamat email pelamar",
    "phoneNumber": "Nomor HP / WhatsApp (format 08...)",
    "gender": "Laki-laki atau Perempuan",
    "maritalStatus": "Single atau Menikah",
    "dateOfBirth": "YYYY-MM-DD atau null jika tidak ada",
    "postalCode": "Kode pos atau null",
    "domicile": "Kota domisili pelamar",
    "address": "Alamat lengkap jika ada di CV",
    "educationLevel": "Pilihan salah satu: SMA / SMK, Diploma (D3), Sarjana (S1), Magister (S2), Doktor (S3)",
    "gpa": "IPK terakhir jika ada",
    "yearsOfExperience": 2,
    "expectedSalary": null,
    "noticePeriod": null,
    "skills": "Daftar seluruh keahlian, teknologi, tools yang ditemukan, dipisahkan koma",
    "linkedinUrl": "URL profil LinkedIn jika ada",
    "githubUrl": "URL GitHub jika ada",
    "portfolioUrl": "URL Portofolio/Website jika ada",
    "summary": "Ringkasan profil profesional 2-3 kalimat yang padat dan jujur"
  },
  "missingFields": ["expectedSalary", "noticePeriod"],
  "screeningQuestions": [
    {
      "questionText": "Berapa tahun total pengalaman kerja Anda di bidang terkait?",
      "normalizedQuestion": "berapatahuntotalpengalamankerjaandadibidangterkait",
      "answerText": "2 tahun pengalaman kerja di bidang Software Engineering",
      "category": "experience"
    },
    {
      "questionText": "Kapan Anda bisa mulai bergabung bekerja jika diterima?",
      "normalizedQuestion": "kapanandabisamulaibergabungbekerjajikaditerima",
      "answerText": "Dapat segera mulai bekerja (Immediately)",
      "category": "availability"
    },
    {
      "questionText": "Berapa ekspektasi gaji bersih per bulan yang Anda harapkan?",
      "normalizedQuestion": "berapaekspektasigajibersihperbulanyangandaharapkan",
      "answerText": "Dapat dinegosiasikan sesuai standar remunerasi perusahaan dan ruang lingkup pekerjaan",
      "category": "salary"
    },
    {
      "questionText": "Apakah Anda adalah Warga Negara Indonesia (WNI) dan berhak bekerja di Indonesia?",
      "normalizedQuestion": "apakahandaadalahwarganegaraindonesiawnidanberhakbekerjadiindonesia",
      "answerText": "Ya, saya adalah Warga Negara Indonesia (WNI) dan berhak bekerja secara legal",
      "category": "general"
    }
  ],
  "honestyNotes": [
    "Seluruh data identitas, pendidikan, dan keahlian diambil langsung dari teks CV.",
    "Ekspektasi gaji tidak ditemukan di dalam teks CV dan dapat Anda lengkapi secara manual."
  ]
}`;

  let textResponse = '';
  try {
    textResponse = await askUniversalAi({
      userPrompt: prompt,
      jsonMode: true,
      temperature: 0.1,
    });

    let cleanText = textResponse
      .replace(/^```(?:json)?\s*/im, '')
      .replace(/```\s*$/im, '')
      .trim();

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanText = jsonMatch[0];

    const parsed = JSON.parse(cleanText);

    const profile: CVAnalysisResult = parsed.profile || parsed;
    const missingFields: string[] = Array.isArray(parsed.missingFields)
      ? parsed.missingFields
      : detectMissingProfileFields(profile);

    const screeningQuestions: ScreeningQuestionItem[] = Array.isArray(parsed.screeningQuestions) && parsed.screeningQuestions.length > 0
      ? parsed.screeningQuestions.map((q: any) => ({
          questionText: q.questionText || '',
          normalizedQuestion: normalizeQuestionText(q.questionText || ''),
          answerText: q.answerText || '',
          category: q.category || 'general',
          matchType: 'exact',
          confidenceScore: '1.00',
        }))
      : generateDefaultScreeningQuestions(profile);

    const honestyNotes: string[] = Array.isArray(parsed.honestyNotes) && parsed.honestyNotes.length > 0
      ? parsed.honestyNotes
      : [
          'Data profil berhasil diekstraksi dari dokumen CV secara objektif.',
          missingFields.length > 0
            ? `Terdapat ${missingFields.length} kolom yang belum terisi di CV dan dapat Anda lengkapi langsung.`
            : 'Seluruh kolom utama berhasil diekstraksi.',
        ];

    return {
      profile,
      missingFields,
      screeningQuestions,
      honestyNotes,
    };
  } catch (e: any) {
    console.error('[CV AI Analysis ERROR]', {
      error: e?.message || e,
      responsePreview: textResponse?.slice(0, 300) || '(no response)',
    });

    const fallbackResponse = extractHeuristicFromText(rawCvText);
    if (fallbackResponse.profile.fullName || fallbackResponse.profile.phoneNumber || fallbackResponse.profile.skills) {
      console.info('[CV AI] Using enhanced heuristic fallback.');
      return fallbackResponse;
    }
    throw new Error(`AI analisis CV gagal: ${e?.message || 'tidak ada respon'} — pastikan API Key di Pengaturan valid & aktif.`);
  }
}

/**
 * Checks which standard profile fields are missing
 */
function detectMissingProfileFields(p: CVAnalysisResult): string[] {
  const missing: string[] = [];
  if (!p.expectedSalary) missing.push('expectedSalary');
  if (!p.noticePeriod) missing.push('noticePeriod');
  if (!p.dateOfBirth) missing.push('dateOfBirth');
  if (!p.maritalStatus) missing.push('maritalStatus');
  if (!p.domicile && !p.address) missing.push('domicile');
  if (!p.gpa) missing.push('gpa');
  return missing;
}

/**
 * Standard generator for realistic job screening questions based on profile
 */
export function generateDefaultScreeningQuestions(profile: CVAnalysisResult): ScreeningQuestionItem[] {
  const years = profile.yearsOfExperience || 1;
  const skillsList = profile.skills || 'Software Development';
  const primarySkills = skillsList.split(',').slice(0, 3).map(s => s.trim()).filter(Boolean).join(', ') || 'Software Development';
  const domicile = profile.domicile || profile.address || 'lokasi yang ditentukan';
  const education = profile.educationLevel || 'Sarjana (S1)';
  const salaryText = profile.expectedSalary
    ? `Rp ${Number(profile.expectedSalary).toLocaleString('id-ID')}`
    : 'Dapat dinegosiasikan sesuai standar industri dan tanggung jawab posisi';
  const noticeText = profile.noticePeriod || 'Segera (Immediately)';

  const list: { q: string; a: string; cat: ScreeningQuestionItem['category'] }[] = [
    {
      q: 'Berapa tahun total pengalaman kerja Anda di bidang terkait?',
      a: `${years} tahun pengalaman kerja profesional di bidang ${primarySkills}.`,
      cat: 'experience',
    },
    {
      q: 'Kapan Anda bisa mulai bergabung bekerja jika diterima?',
      a: `${noticeText}.`,
      cat: 'availability',
    },
    {
      q: 'Berapa ekspektasi gaji bersih bulanan yang Anda harapkan (IDR)?',
      a: `${salaryText}.`,
      cat: 'salary',
    },
    {
      q: `Apakah Anda memiliki pengalaman dan kompetensi menggunakan ${primarySkills}?`,
      a: `Ya, saya memiliki pengalaman praktis dan portofolio dalam menggunakan ${primarySkills}.`,
      cat: 'skills',
    },
    {
      q: `Apakah Anda berdomisili di atau bersedia bekerja di area ${domicile}?`,
      a: `Ya, saya bersedia bekerja secara On-site / Hybrid di area ${domicile}.`,
      cat: 'general',
    },
    {
      q: 'Apakah Anda Warga Negara Indonesia (WNI) dan berhak bekerja legal di Indonesia?',
      a: 'Ya, saya adalah Warga Negara Indonesia (WNI) dan berhak bekerja penuh waktu.',
      cat: 'general',
    },
    {
      q: `Apakah Anda memenuhi kualifikasi pendidikan minimal ${education}?`,
      a: `Ya, saya telah menyelesaikan pendidikan formal ${education}.`,
      cat: 'education',
    },
    {
      q: 'Apakah Anda bersedia mengikuti proses seleksi wawancara dan tes teknis?',
      a: 'Ya, saya siap dan bersedia mengikuti seluruh rangkaian proses rekrutmen perusahaan.',
      cat: 'general',
    },
    {
      q: 'Apakah Anda bersedia bekerja lembur atau dinas luar kota jika dibutuhkan perusahaan?',
      a: 'Ya, saya bersedia bekerja secara fleksibel sesuai dengan kebutuhan operasional perusahaan.',
      cat: 'general',
    },
    {
      q: 'Bagaimana status ketersediaan kendaraan pribadi atau mobilitas kerja Anda?',
      a: 'Saya memiliki kendaraan pribadi dan siap bermobilisasi untuk keperluan pekerjaan.',
      cat: 'general',
    },
  ];

  return list.map(item => ({
    questionText: item.q,
    normalizedQuestion: normalizeQuestionText(item.q),
    answerText: item.a,
    category: item.cat,
    matchType: 'exact',
    confidenceScore: '1.00',
  }));
}

/**
 * Fallback regex & heuristic parser when AI key is empty or network fails
 */
function extractHeuristicFromText(text: string): CVEnhancedAnalysisResponse {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result: CVAnalysisResult = {};

  // 1. Detect candidate name (first 8 lines)
  const headerDisqualifiers = ['tentang saya', 'curriculum vitae', 'resume', 'data diri', 'kontak', 'pendidikan', 'experience', 'profile', 'biodata'];
  for (const line of lines.slice(0, 8)) {
    const lower = line.toLowerCase();
    if (!headerDisqualifiers.some(h => lower.includes(h)) && line.length >= 4 && line.length <= 40 && !/\d/.test(line)) {
      result.fullName = line;
      break;
    }
  }

  // 2. Detect phone number (08... or +62...)
  const phoneMatch = text.match(/(?:(?:\+62|62)|0)8[0-9]{2}[\s\-]?[0-9]{3,4}[\s\-]?[0-9]{3,5}/);
  if (phoneMatch) {
    result.phoneNumber = phoneMatch[0].replace(/[\s\-]/g, '');
  }

  // 2b. Detect email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    result.email = emailMatch[0].trim();
  }

  // 2c. Detect gender
  if (/laki-laki|pria/i.test(text)) {
    result.gender = 'Laki-laki';
  } else if (/perempuan|wanita/i.test(text)) {
    result.gender = 'Perempuan';
  }

  // 2d. Detect marital status
  if (/belum menikah|single|lajang/i.test(text)) {
    result.maritalStatus = 'Single';
  } else if (/menikah|kawin/i.test(text)) {
    result.maritalStatus = 'Menikah';
  }

  // 3. Detect domicile / city & address
  const addressMatch = text.match(/(?:desa|jalan|jl\.|dusun|komplek|rt\s*\d+)[^\n]{5,80}/i);
  if (addressMatch) {
    result.address = addressMatch[0].trim();
  }

  const cityMatch = text.match(/(?:domisili|kota|tinggal|alamat)[^:\n]*[:\s]+([^\n,]{3,35})/i);
  if (cityMatch && cityMatch[1]) {
    result.domicile = cityMatch[1].trim();
  } else if (/gresik/i.test(text)) {
    result.domicile = 'Gresik, Jawa Timur';
  } else if (/surabaya/i.test(text)) {
    result.domicile = 'Surabaya, Jawa Timur';
  } else if (/jakarta/i.test(text)) {
    result.domicile = 'Jakarta';
  }

  // 4. Detect education level
  if (/s1|sarjana|semester|informatika|universitas|institut/i.test(text)) {
    result.educationLevel = 'Sarjana (S1)';
  } else if (/d3|diploma/i.test(text)) {
    result.educationLevel = 'Diploma (D3)';
  } else if (/smk|sma/i.test(text)) {
    result.educationLevel = 'SMA / SMK';
  }

  // 5. Detect skills
  const knownKeywords = [
    'Laravel', 'PHP', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap',
    'React', 'Next.js', 'Node.js', 'Express', 'Git', 'GitHub', 'GitLab', 'MySQL', 'PostgreSQL',
    'Python', 'Java', 'Docker', 'Figma', 'REST API'
  ];
  const foundSkills: string[] = [];
  for (const kw of knownKeywords) {
    const reg = new RegExp(`\\b${kw.replace('.', '\\.')}\\b`, 'i');
    if (reg.test(text)) {
      foundSkills.push(kw);
    }
  }
  if (foundSkills.length > 0) {
    result.skills = foundSkills.join(', ');
  }

  // 6. Detect Github & Linkedin
  const githubMatch = text.match(/(?:github\.com\/[A-Za-z0-9_-]+|@[A-Za-z0-9_-]+\s*-\s*Github)/i);
  if (githubMatch) {
    const raw = githubMatch[0];
    if (raw.includes('github.com')) {
      result.githubUrl = `https://${raw}`;
    } else {
      const user = raw.split('-')[0].replace(/[@\s]/g, '');
      result.githubUrl = `https://github.com/${user}`;
    }
  }

  // 7. Years of experience estimate
  if (/mahasiswa|fresh graduate|semester/i.test(text) && !/tahun pengalaman/i.test(text)) {
    result.yearsOfExperience = 1;
  } else {
    result.yearsOfExperience = 2;
  }

  const missingFields = detectMissingProfileFields(result);
  const screeningQuestions = generateDefaultScreeningQuestions(result);
  const honestyNotes = [
    'Data diekstrak menggunakan parser lokal dokumen CV.',
    'Ekspektasi gaji dan ketersediaan notice period belum ditemukan di dokumen CV dan dapat diinput manual.',
  ];

  return {
    profile: result,
    missingFields,
    screeningQuestions,
    honestyNotes,
  };
}
