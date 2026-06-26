import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findEmailConfig, upsertEmailConfig } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const config = await findEmailConfig()

  if (!config) {
    return NextResponse.json(null)
  }

  return NextResponse.json({
    id: config.id,
    provider: config.provider,
    host: config.host,
    port: config.port,
    user: config.user,
    from: config.from,
    enabled: config.enabled,
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { provider, host, port, user, password, from, enabled } = body

  await upsertEmailConfig({
    provider,
    host,
    port: parseInt(port),
    user,
    ...(password ? { password } : {}),
    from,
    enabled: enabled ?? true,
  })

  return NextResponse.json({ success: true })
}
