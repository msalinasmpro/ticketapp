import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findTickets, createTicket, createNotification, findEmailConfig, findUsers, findUserById, type DbTicket } from '@/lib/db'
import { ticketSchema } from '@/lib/validations'
import { sendEmail, buildTicketEmail } from '@/lib/email'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const assigneeId = searchParams.get('assigneeId')
  const role = session.user.role

  const whereParts: string[] = []
  if (status) whereParts.push(`status=eq.${status}`)
  if (priority) whereParts.push(`priority=eq.${priority}`)
  if (assigneeId) whereParts.push(`assigneeId=eq.${assigneeId}`)
  if (role === 'user') whereParts.push(`creatorId=eq.${session.user.id}`)

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
    if ((session.user.role === 'admin' || session.user.role === 'tecnico') && !data.assigneeId) {
      ticketData.assigneeId = session.user.id
    }
    const ticket = await createTicket(ticketData)

    sendNotificationsAndEmail(ticket, session.user).catch(() => {})

    return NextResponse.json(ticket, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}

async function sendNotificationsAndEmail(ticket: DbTicket, user: { name?: string | null; email?: string | null; id: string; role: string }) {
  try {
    const users = await findUsers()
    const notifyUsers = users.filter(u => u.role === 'admin' || u.role === 'tecnico')

    for (const u of notifyUsers) {
      try {
        await createNotification({
          userId: u.id,
          type: 'NEW_TICKET',
          title: 'Nuevo ticket creado',
          message: `${user.name || 'Usuario'} ha creado el ticket "${ticket.title}"`,
          ticketId: ticket.id,
        })
      } catch {}
    }

    const emailConfig = await findEmailConfig()
    if (emailConfig && emailConfig.enabled) {
      const creator = await findUserById(user.id)
      for (const u of notifyUsers) {
        try {
          await sendEmail({
            to: emailConfig.from as string,
            subject: `[TicketApp] Nuevo ticket: ${ticket.title}`,
            html: buildTicketEmail({
              title: ticket.title as string,
              description: ticket.description as string,
              priority: ticket.priority as string,
              company: ticket.company as string,
              phone: ticket.phone as string,
              clientName: (ticket.clientName as string) || user.name,
              creatorName: creator?.name || user.name || 'Desconocido',
              creatorEmail: creator?.email || user.email || '',
            }),
          })
        } catch {}
      }
    }
  } catch {}
}
