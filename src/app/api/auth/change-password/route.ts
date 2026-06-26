import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findUserById, SUPABASE_URL, SUPABASE_KEY } from '@/lib/db'
import { compare, hash } from 'bcryptjs'

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Datos inválidos. La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 })
  }

  const user = await findUserById(session.user.id)
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const valid = await compare(currentPassword, user.password)
  if (!valid) return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 })

  const hashed = await hash(newPassword, 12)
  await fetch(`${SUPABASE_URL}/rest/v1/User?id=eq.${session.user.id}`, {
    method: 'PATCH',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ password: hashed, updatedAt: new Date().toISOString() }),
  })

  return NextResponse.json({ success: true })
}
