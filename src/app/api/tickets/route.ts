import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findTickets, createTicket, createNotification, findEmailConfig, findUsers } from '@/lib/db'
import { ticketSchema } from '@/lib/validations'
import { sendEmail, buildTicketEmail } from '@/lib/email'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const assigneeId = searchParams.get('assigneeId')

  const whereParts: string[] = []
  if (status) whereParts.push(`status=eq.${status}`)
  if (priority) whereParts.push(`priority=eq.${priority}`)
  if (assigneeId) whereParts.push(`assigneeId=eq.${assigneeId}`)

  const select = '*,creator:User!Ticket_creatorId_fkey(id,name,email),assignee:User!Ticket_assigneeId_fkey(id,name,email)'
  const tickets = await findTickets({
    select,
    where: whereParts.join('&'),
    order: 'createdAt.desc',
  })

  return NextResponse.json(tickets)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const data = ticketSchema.parse(body)

    const ticketData: Record<string, unknown> = { ...data, creatorId: session.user.id }
    if (session.user.role === 'admin' && !data.assigneeId) {
      ticketData.assigneeId = session.user.id
    }
    const ticket = await createTicket(ticketData)

    const users = await findUsers()
    const admins = users.filter(u => u.role === 'admin')

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: 'NEW_TICKET',
        title: 'Nuevo ticket creado',
        message: `${session.user.name || 'Usuario'} ha creado el ticket "${ticket.title}"`,
        ticketId: ticket.id,
      })

      const emailConfig = await findEmailConfig()

      if (emailConfig && emailConfig.enabled) {
        await sendEmail({
          to: emailConfig.from as string,
          subject: `[TicketApp] Nuevo ticket: ${ticket.title}`,
          html: buildTicketEmail({
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            company: ticket.company,
            phone: ticket.phone,
            creatorName: ticket.creator?.name || 'Desconocido',
            creatorEmail: ticket.creator?.email || '',
          }),
        })
      }
    }

    return NextResponse.json(ticket, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
