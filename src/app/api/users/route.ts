import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findUsers, updateUserRole, deleteUser } from '@/lib/db'

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

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  if (id === session.user.id) return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })

  await deleteUser(id)
  return NextResponse.json({ success: true })
}
