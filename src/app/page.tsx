import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { countTickets, findTickets, SUPABASE_URL, SUPABASE_KEY } from '@/lib/db'
import Link from 'next/link'
import { DashboardActions } from '@/components/dashboard/dashboard-actions'
import { TicketSearch } from '@/components/dashboard/ticket-search'

interface DashboardTicket {
  id: string
  title: string
  status: string
  priority: string
  company: string | null
  phone: string | null
  createdAt: string
  creator: { name: string }
  assignee?: { name: string } | null
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const params = await searchParams
  const q = params.q || ''

  const [total, open, inProgress, resolved, closed] = await Promise.all([
    countTickets(),
    countTickets('status=eq.OPEN'),
    countTickets('status=eq.IN_PROGRESS'),
    countTickets('status=eq.RESOLVED'),
    countTickets('status=eq.CLOSED'),
  ])

  const select = 'id,title,status,priority,company,phone,createdAt,creator:User!Ticket_creatorId_fkey(name),assignee:User!Ticket_assigneeId_fkey(name)'

  let recentTickets: DashboardTicket[]
  if (q) {
    const eq = encodeURIComponent(q)
    const fetchHeaders = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }
    const url = `${SUPABASE_URL}/rest/v1/Ticket?select=${select}&or=(title.ilike.*${eq}*,company.ilike.*${eq}*,phone.ilike.*${eq}*,description.ilike.*${eq}*)&order=createdAt.desc&limit=10`
    recentTickets = await fetch(url, { headers: fetchHeaders }).then(r => r.json())
  } else {
    recentTickets = await findTickets({ select, order: 'createdAt.desc', limit: 10 }) as unknown as DashboardTicket[]
  }

  const stats = [
    { label: 'Total', value: total },
    { label: 'Abiertos', value: open },
    { label: 'En Progreso', value: inProgress },
    { label: 'Resueltos', value: resolved },
    { label: 'Cerrados', value: closed },
  ]

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

  const isAdmin = session?.user?.role === 'admin'

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Hola, <span className="font-bold">{session.user?.name}</span>
          </h1>
          <p className="mt-1 text-sm text-light">
            Resumen de actividad reciente
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          {isAdmin && (
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-hover active:scale-[0.97] transition-all duration-150"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Config
            </Link>
          )}
          {isAdmin && <DashboardActions />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-4 hover:border-border/60 transition-all duration-150"
          >
            <p className="text-[11px] font-medium text-light uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-[28px] font-semibold tracking-tight text-foreground font-tabular leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Tickets</h2>
          <TicketSearch defaultValue={q} />
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left">Ticket</th>
                <th className="px-4 py-2.5 text-left hidden sm:table-cell">Empresa</th>
                <th className="px-4 py-2.5 text-left">Estado</th>
                <th className="px-4 py-2.5 text-left">Prioridad</th>
                <th className="px-4 py-2.5 text-left hidden md:table-cell">Asignado</th>
                <th className="px-4 py-2.5 text-left">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="h-10 w-10 text-light/30 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm text-light mb-2">{q ? 'No se encontraron resultados' : 'No hay tickets aún'}</p>
                      {!q && (
                        <Link href="/tickets/new" className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                          Crear primer ticket
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-surface-hover transition-colors duration-100 group">
                    <td className="px-4 py-3">
                      <div>
                        <Link href={`/tickets/${ticket.id}`} className="text-sm font-medium text-foreground hover:text-accent transition-colors duration-150">
                          {ticket.title}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-light">
                          <span>{ticket.creator.name}</span>
                          <span>·</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-muted">{ticket.company || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted">
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDot[ticket.status] || 'bg-gray-badge'}`} />
                        {statusLabels[ticket.status] || ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted">
                        <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[ticket.priority] || 'bg-gray-badge'}`} />
                        {priorityLabels[ticket.priority] || ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-muted">
                        {ticket.assignee?.name || <span className="text-light">Sin asignar</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="rounded-md p-1.5 text-light hover:text-foreground hover:bg-surface-2 transition-all duration-150 active:scale-95"
                          title="Ver detalle"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {recentTickets.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
            <p className="text-xs text-light font-tabular">
              {recentTickets.length} de {total} tickets
            </p>
            <Link href="/tickets" className="text-xs font-medium text-accent hover:text-accent-hover transition-colors">
              Ver todos →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
