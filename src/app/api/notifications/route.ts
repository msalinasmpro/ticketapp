import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findNotifications, updateManyNotifications, updateNotification } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const notifications = await findNotifications(session.user.id)

  return NextResponse.json(notifications)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()

  if (body.markAllAsRead) {
    await updateManyNotifications(
      { userId: session.user.id, read: false },
      { read: true }
    )
    return NextResponse.json({ success: true })
  }

  if (body.id) {
    await updateNotification(body.id, { read: true })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
}
