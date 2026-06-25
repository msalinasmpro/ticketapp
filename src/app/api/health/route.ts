import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const count = await prisma.user.count()
    return NextResponse.json({ ok: true, userCount: count })
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message })
  }
}
