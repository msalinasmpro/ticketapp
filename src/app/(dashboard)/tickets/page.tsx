import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findTickets } from '@/lib/db'
import Link from 'next/link'
import { TicketTable } from '@/components/dashboard/ticket-table'

interface TicketListItem {
  id: string
  ticketNumber: number
  title: string
  status: string
  priority: string
  clientName: string | null
  reportTo: string | null
  createdAt: string
  creator: { id: string; name: string; email: string }
  assignee?: { id: string; name: string; email: string } | null
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const params = await searchParams
  const status = params.status
  const priority = params.priority
  const role = session.user.role
  const isAdmin = role === 'admin'
  const isTecnico = role === 'tecnico'
  const canSeeAll = isAdmin || isTecnico

  const whereParts: string[] = []
  if (!canSeeAll) whereParts.push(`creatorId=eq.${session.user.id}`)
  if (status) whereParts.push(`status=eq.${status}`)
  if (priority) whereParts.push(`priority=eq.${priority}`)

  const select = 'id,ticketNumber,title,status,priority,clientName,reportTo,createdAt,creator:User!Ticket_creatorId_fkey(id,name,email),assignee:User!Ticket_assigneeId_fkey(id,name,email)'
  const tickets = await findTickets({
    select,
    where: whereParts.join('&'),
    order: 'createdAt.desc',
  }) as unknown as TicketListItem[]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-light hover:text-foreground transition-colors mb-3">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Dashboard
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Tickets
          </h1>
          <p className="mt-1 text-sm text-light">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Link
          href="/tickets/new"
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-all duration-200 shadow-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Ticket
        </Link>
      </div>

      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        <TicketTable tickets={tickets} isAdmin={isAdmin} />
      </div>
    </div>
  )
}
