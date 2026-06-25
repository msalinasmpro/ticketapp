import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const { findUserByEmail } = await import('@/lib/db')
    const { compare } = await import('bcryptjs')

    console.log('[DBG] Testing login for:', email)
    const user = await findUserByEmail(email)
    console.log('[DBG] User result:', user ? 'found' : 'null')

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found', email })
    }

    const valid = await compare(password, user.password)
    console.log('[DBG] Password valid:', valid)

    return NextResponse.json({ ok: true, user: { email: user.email, role: user.role, valid } })
  } catch (e) {
    const err = e as Error & { code?: string }
    console.error('[DBG] Error:', err.name, err.code, err.message)
    return NextResponse.json({ ok: false, error: err.message, code: err.code, name: err.name })
  }
}
