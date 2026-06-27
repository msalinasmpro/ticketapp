import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findTicketById, updateTicket, deleteTicket } from '@/lib/db'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const ticket = await findTicketById(id)

  if (!ticket) return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
  return NextResponse.json(ticket)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const ticket = await updateTicket(id, body)

  return NextResponse.json(ticket)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden eliminar tickets' }, { status: 403 })
  }

  const { id } = await params
  const ticket = await findTicketById(id)
  if (!ticket) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  await deleteTicket(id)
  return NextResponse.json({ message: 'Eliminado' })
}
