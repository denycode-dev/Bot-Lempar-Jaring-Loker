import { NextResponse } from 'next/server';
import { testActiveStorage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await testActiveStorage();
  return NextResponse.json(result);
}
