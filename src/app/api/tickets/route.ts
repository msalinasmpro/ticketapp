import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ticketSchema } from '@/lib/validations'
import { sendEmail, buildTicketEmail } from '@/lib/email'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const assigneeId = searchParams.get('assigneeId')

  const where: Record<string, string> = {}
  if (status) where.status = status
  if (priority) where.priority = priority
  if (assigneeId) where.assigneeId = assigneeId

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(tickets)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const data = ticketSchema.parse(body)

    const ticket = await prisma.ticket.create({
      data: { ...data, creatorId: session.user.id },
      include: { creator: true, assignee: true },
    })

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, email: true },
    })

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'NEW_TICKET',
          title: 'Nuevo ticket creado',
          message: `${session.user.name || 'Usuario'} ha creado el ticket "${ticket.title}"`,
          ticketId: ticket.id,
        },
      })

      const emailConfig = await prisma.emailConfig.findFirst({
        where: { enabled: true },
      })

      if (emailConfig) {
        await sendEmail({
          to: emailConfig.from,
          subject: `[TicketApp] Nuevo ticket: ${ticket.title}`,
          html: buildTicketEmail({
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            company: ticket.company,
            phone: ticket.phone,
            creatorName: ticket.creator.name,
            creatorEmail: ticket.creator.email,
          }),
        })
      }
    }

    return NextResponse.json(ticket, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
