import { indexAllSnacks } from '@/backend/services/embeddingService'
import { NextResponse } from 'next/server'

export async function POST() {
  await indexAllSnacks()
  return NextResponse.json({ ok: true })
}
