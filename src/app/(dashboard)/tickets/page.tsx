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

  const whereParts: string[] = []
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

  const statusDot: Record<string, string> = {
    OPEN: 'bg-blue',
    IN_PROGRESS: 'bg-yellow',
    RESOLVED: 'bg-green',
    CLOSED: 'bg-gray-badge',
  }

  const priorityDot: Record<string, string> = {
    LOW: 'bg-gray-badge',
    MEDIUM: 'bg-blue',
    HIGH: 'bg-orange',
    CRITICAL: 'bg-red',
  }

  const statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

  function buildFilterUrl(key: string, value: string) {
    const sp = new URLSearchParams()
    if (key === 'status') {
      if (status === value) {
        if (priority) sp.set('priority', priority)
      } else {
        sp.set('status', value)
        if (priority) sp.set('priority', priority)
      }
    } else {
      if (priority === value) {
        if (status) sp.set('status', status)
      } else {
        sp.set('priority', value)
        if (status) sp.set('status', status)
      }
    }
    const qs = sp.toString()
    return `/tickets${qs ? `?${qs}` : ''}`
  }

  function clearFilters() {
    return '/tickets'
  }

  const hasFilters = !!(status || priority)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Tickets
          </h1>
          <p className="mt-1 text-sm text-light font-tabular">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/tickets/new"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-hover active:scale-[0.97] transition-all duration-150"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Ticket
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-1.5 mr-2">
          <span className="text-[11px] font-medium text-light uppercase tracking-widest">Estado:</span>
          {statusOptions.map((s) => (
            <Link
              key={s}
              href={buildFilterUrl('status', s)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150 active:scale-[0.97] ${
                status === s
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-border bg-surface text-muted hover:border-border/60 hover:text-foreground'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot[s]}`} />
              {statusLabels[s]}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-light uppercase tracking-widest">Prioridad:</span>
          {priorityOptions.map((p) => (
            <Link
              key={p}
              href={buildFilterUrl('priority', p)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150 active:scale-[0.97] ${
                priority === p
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-border bg-surface text-muted hover:border-border/60 hover:text-foreground'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[p]}`} />
              {priorityLabels[p]}
            </Link>
          ))}
        </div>
        {hasFilters && (
          <Link
            href={clearFilters()}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-light hover:text-foreground transition-all duration-150 active:scale-[0.97]"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Limpiar
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left">Título</th>
                <th className="px-4 py-2.5 text-left">Estado</th>
                <th className="px-4 py-2.5 text-left">Prioridad</th>
                <th className="px-4 py-2.5 text-left">Creador</th>
                <th className="px-4 py-2.5 text-left">Asignado</th>
                <th className="px-4 py-2.5 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="h-10 w-10 text-light/30 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm text-light mb-3">No hay tickets</p>
                      <Link
                        href="/tickets/new"
                        className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-hover active:scale-[0.97] transition-all duration-150"
                      >
                        Crear primer ticket
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-surface-hover transition-colors duration-100">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/tickets/${ticket.id}`} className="text-sm font-medium text-foreground hover:text-accent transition-colors duration-150">
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted">
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDot[ticket.status] || 'bg-gray-badge'}`} />
                        {statusLabels[ticket.status] || ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted">
                        <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[ticket.priority] || 'bg-gray-badge'}`} />
                        {priorityLabels[ticket.priority] || ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted">
                      {ticket.creator.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted">
                      {ticket.assignee?.name || (
                        <span className="text-light">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-light font-tabular">
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
