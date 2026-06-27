import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findTicketById, updateTicket, deleteTicket, createNotification, findUsers } from '@/lib/db'

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
  const oldTicket = await findTicketById(id)
  const ticket = await updateTicket(id, body)

  if (oldTicket && body.status && body.status !== oldTicket.status) {
    const users = await findUsers()
    const notifyUsers = users.filter(u => u.role === 'admin' || u.role === 'tecnico')
    for (const user of notifyUsers) {
      await createNotification({
        userId: user.id,
        type: 'STATUS_CHANGE',
        title: 'Estado de ticket actualizado',
        message: `El ticket "${ticket.title}" cambió de estado`,
        ticketId: ticket.id,
      })
    }
  }

  if (oldTicket && body.assigneeId && body.assigneeId !== oldTicket.assigneeId) {
    const users = await findUsers()
    const notifyUsers = users.filter(u => u.role === 'admin' || u.role === 'tecnico')
    for (const user of notifyUsers) {
      await createNotification({
        userId: user.id,
        type: 'ASSIGNMENT_CHANGE',
        title: 'Ticket reasignado',
        message: `El ticket "${ticket.title}" fue reasignado`,
        ticketId: ticket.id,
      })
    }
  }

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
