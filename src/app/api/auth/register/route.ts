import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { findUserByEmail, createUser } from '@/lib/db'
import { registerSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = registerSchema.parse(body)

    const exists = await findUserByEmail(email)
    if (exists) {
      return NextResponse.json({ error: 'Email ya registrado' }, { status: 400 })
    }

    const user = await createUser({
      name,
      email,
      password: await hash(password, 12),
    })

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    console.error('[REGISTER]', (error as Error).message)
    return NextResponse.json({ error: 'Datos inválidos: ' + (error as Error).message }, { status: 400 })
  }
}
