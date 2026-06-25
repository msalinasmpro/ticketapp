import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const count = await prisma.user.count()
    return NextResponse.json({ ok: true, count })
  } catch (e) {
    const err = e as Error
    return NextResponse.json({ ok: false, name: err.name, msg: err.message, stack: err.stack?.substring(0, 500) })
  }
}
