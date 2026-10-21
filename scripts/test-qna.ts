import { db } from '../src/db';
import { screeningQuestions } from '../src/db/schema';
import { eq, and, sql } from 'drizzle-orm';

async function testQnA() {
  console.log('🧪 Testing PostgreSQL Fast Screening Q&A Retrieval...');

  const sampleQuestion = "Berapa gaji bulanan yang kamu inginkan?";
  const normalized = sampleQuestion.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Exact Match Test
  const t0 = performance.now();
  const exact = await db.query.screeningQuestions.findFirst({
    where: and(
      eq(screeningQuestions.userId, 'default-user'),
      eq(screeningQuestions.normalizedQuestion, normalized)
    ),
  });
  const t1 = performance.now();
  console.log(`⏱️ Exact Match: ${(t1 - t0).toFixed(2)}ms`);
  console.log('Exact Result:', exact?.questionText, '->', exact?.answerText);

  if (!exact) throw new Error('Exact match failed!');

  // 2. Fuzzy Trigram Similarity Test
  const typoQuestion = "Berapa gaji bulanan yang anda inginkan?";
  const typoNormalized = typoQuestion.toLowerCase().replace(/[^a-z0-9]/g, '');

  const t2 = performance.now();
  const fuzzy = await db.execute(sql`
    SELECT question_text, answer_text, GREATEST(similarity(question_text, ${typoQuestion}), similarity(normalized_question, ${typoNormalized})) as sim
    FROM screening_questions
    WHERE user_id = 'default-user' AND (similarity(question_text, ${typoQuestion}) >= 0.60 OR similarity(normalized_question, ${typoNormalized}) >= 0.60)
    ORDER BY sim DESC
    LIMIT 1;
  `);
  const t3 = performance.now();
  console.log(`⏱️ Fuzzy Match: ${(t3 - t2).toFixed(2)}ms`);
  const rows = Array.isArray(fuzzy) ? fuzzy : (fuzzy as any).rows;
  console.log('Fuzzy First Row:', rows?.[0]);

  if (!rows || rows.length === 0) throw new Error('Fuzzy match failed!');

  console.log('🎉 PostgreSQL Screening Q&A verified successfully!');
  process.exit(0);
}

testQnA().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
