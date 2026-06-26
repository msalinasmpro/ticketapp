import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findTickets } from '@/lib/db'
import Link from 'next/link'

interface TicketListItem {
  id: string
  title: string
  status: string
  priority: string
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
  const isAdmin = session.user.role === 'admin'

  const whereParts: string[] = []
  if (!isAdmin) whereParts.push(`creatorId=eq.${session.user.id}`)
  if (status) whereParts.push(`status=eq.${status}`)
  if (priority) whereParts.push(`priority=eq.${priority}`)

  const select = '*,creator:User!Ticket_creatorId_fkey(id,name,email),assignee:User!Ticket_assigneeId_fkey(id,name,email)'
  const tickets = await findTickets({
    select,
    where: whereParts.join('&'),
    order: 'createdAt.desc',
  }) as unknown as TicketListItem[]

  const statusLabels: Record<string, string> = {
    OPEN: 'Abierto',
    IN_PROGRESS: 'En Progreso',
    RESOLVED: 'Resuelto',
    CLOSED: 'Cerrado',
  }

  const priorityLabels: Record<string, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    CRITICAL: 'Crítica',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
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
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Creador
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Asignado
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="h-12 w-12 text-border mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm text-light mb-4">No hay tickets</p>
                      <Link
                        href="/tickets/new"
                        className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors duration-200"
                      >
                        Crear primer ticket
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-surface-hover transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/tickets/${ticket.id}`} className="text-sm font-medium text-foreground hover:text-accent transition-colors duration-200">
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ticket.status === 'OPEN' ? 'bg-blue-light text-blue' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-yellow-light text-yellow' :
                        ticket.status === 'RESOLVED' ? 'bg-green-light text-green' :
                        'bg-gray-light text-gray-badge'
                      }`}>
                        {statusLabels[ticket.status] || ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ticket.priority === 'CRITICAL' ? 'bg-red-light text-red' :
                        ticket.priority === 'HIGH' ? 'bg-orange-light text-orange' :
                        ticket.priority === 'MEDIUM' ? 'bg-blue-light text-blue' :
                        'bg-gray-light text-gray-badge'
                      }`}>
                        {priorityLabels[ticket.priority] || ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                      {ticket.creator.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                      {ticket.assignee?.name || (
                        <span className="text-light">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light">
                      {new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
