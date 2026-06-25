import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { creator: true, assignee: true },
  })

  if (!ticket) return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
  return NextResponse.json(ticket)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const ticket = await prisma.ticket.update({
    where: { id },
    data: body,
    include: { creator: true, assignee: true },
  })

  return NextResponse.json(ticket)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  if (session.user.role !== 'admin' && ticket.creatorId !== session.user.id) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  await prisma.ticket.delete({ where: { id } })
  return NextResponse.json({ message: 'Eliminado' })
}
