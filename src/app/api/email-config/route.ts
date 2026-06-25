import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const config = await prisma.emailConfig.findFirst({
    orderBy: { updatedAt: 'desc' },
  })

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

  const existing = await prisma.emailConfig.findFirst()

  if (existing) {
    const updated = await prisma.emailConfig.update({
      where: { id: existing.id },
      data: {
        provider,
        host,
        port: parseInt(port),
        user,
        ...(password ? { password } : {}),
        from,
        enabled: enabled ?? true,
      },
    })
    return NextResponse.json({ id: updated.id })
  }

  const created = await prisma.emailConfig.create({
    data: {
      provider,
      host,
      port: parseInt(port),
      user,
      password,
      from,
      enabled: enabled ?? true,
    },
  })

  return NextResponse.json({ id: created.id })
}
