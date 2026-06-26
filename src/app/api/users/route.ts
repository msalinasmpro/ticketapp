import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findUsers, updateUserRole } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const users = await findUsers()
  return NextResponse.json(users)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id, role } = await req.json()
  if (!id || !role || !['admin', 'user'].includes(role)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  await updateUserRole(id, role)
  return NextResponse.json({ success: true })
}
