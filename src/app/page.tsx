import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { countTickets, findTickets, SUPABASE_URL, SUPABASE_KEY } from '@/lib/db'
import Link from 'next/link'
import { DashboardActions } from '@/components/dashboard/dashboard-actions'
import { TicketSearch } from '@/components/dashboard/ticket-search'
import { NotificationBell } from '@/components/notifications/notification-bell'

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
  const isAdmin = session.user.role === 'admin'
  const userId = session.user.id

  const whereParts: string[] = []
  if (!isAdmin) whereParts.push(`creatorId=eq.${userId}`)

  const countWhere = whereParts.length > 0 ? whereParts.join('&') : undefined

  const [total, open, inProgress, resolved, closed] = await Promise.all([
    countTickets(countWhere),
    countTickets(countWhere ? `${countWhere}&status=eq.OPEN` : 'status=eq.OPEN'),
    countTickets(countWhere ? `${countWhere}&status=eq.IN_PROGRESS` : 'status=eq.IN_PROGRESS'),
    countTickets(countWhere ? `${countWhere}&status=eq.RESOLVED` : 'status=eq.RESOLVED'),
    countTickets(countWhere ? `${countWhere}&status=eq.CLOSED` : 'status=eq.CLOSED'),
  ])

  const select = 'id,title,status,priority,company,phone,createdAt,creator:User!Ticket_creatorId_fkey(name),assignee:User!Ticket_assigneeId_fkey(name)'

  let recentTickets: DashboardTicket[]
  if (q) {
    const eq = encodeURIComponent(q)
    const fetchHeaders = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }
    const searchWhere = !isAdmin ? `&creatorId=eq.${userId}` : ''
    const url = `${SUPABASE_URL}/rest/v1/Ticket?select=${select}&or=(title.ilike.*${eq}*,company.ilike.*${eq}*,phone.ilike.*${eq}*,description.ilike.*${eq}*)${searchWhere}&order=createdAt.desc&limit=10`
    recentTickets = await fetch(url, { headers: fetchHeaders }).then(r => r.json())
  } else {
    const ticketWhere = !isAdmin ? `creatorId=eq.${userId}` : undefined
    recentTickets = await findTickets({ select, where: ticketWhere, order: 'createdAt.desc', limit: 10 }) as unknown as DashboardTicket[]
  }

  const stats = [
    { name: 'Total', value: total, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30', ring: 'ring-accent/10' },
    { name: 'Abiertos', value: open, icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-blue', bg: 'bg-blue-light', border: 'border-blue/20', ring: 'ring-blue/10' },
    { name: 'En Progreso', value: inProgress, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-yellow', bg: 'bg-yellow-light', border: 'border-yellow/20', ring: 'ring-yellow/10' },
    { name: 'Resueltos', value: resolved, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green', bg: 'bg-green-light', border: 'border-green/20', ring: 'ring-green/10' },
    { name: 'Cerrados', value: closed, icon: 'M18 12H6', color: 'text-gray-badge', bg: 'bg-gray-light', border: 'border-border', ring: 'ring-gray-badge/10' },
  ]

  const statusLabels: Record<string, string> = {
    OPEN: 'Abierto',
    IN_PROGRESS: 'En Progreso',
    RESOLVED: 'Resuelto',
    CLOSED: 'Cerrado',
  }

  const statusDotColors: Record<string, string> = {
    OPEN: 'bg-blue',
    IN_PROGRESS: 'bg-yellow',
    RESOLVED: 'bg-green',
    CLOSED: 'bg-gray-badge',
  }

  const priorityLabels: Record<string, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    CRITICAL: 'Crítica',
  }

  const priorityDotColors: Record<string, string> = {
    LOW: 'bg-gray-badge',
    MEDIUM: 'bg-blue',
    HIGH: 'bg-orange',
    CRITICAL: 'bg-red',
  }

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Hola, {session.user?.name}
          </h1>
          <p className="mt-1 text-sm text-light">
            Aquí tienes un resumen de tu actividad reciente.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/tickets/new"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-all duration-200 shadow-sm shadow-accent/20"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Ticket
          </Link>
          {isAdmin && <NotificationBell />}
          <DashboardActions />
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Link
            href="/tickets"
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 hover:bg-surface-hover hover:border-accent/30 transition-all duration-300"
          >
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">Ver Tickets</p>
              <p className="text-xs text-light">Gestionar todos los tickets</p>
            </div>
          </Link>
          <Link
            href="/admin/users"
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 hover:bg-surface-hover hover:border-accent/30 transition-all duration-300"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-light flex items-center justify-center group-hover:bg-blue/20 transition-colors">
              <svg className="h-5 w-5 text-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-blue transition-colors">Gestionar Usuarios</p>
              <p className="text-xs text-light">Administrar cuentas</p>
            </div>
          </Link>
          <Link
            href="/admin/settings"
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 hover:bg-surface-hover hover:border-accent/30 transition-all duration-300"
          >
            <div className="h-10 w-10 rounded-lg bg-yellow-light flex items-center justify-center group-hover:bg-yellow/20 transition-colors">
              <svg className="h-5 w-5 text-yellow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-yellow transition-colors">Configuración</p>
              <p className="text-xs text-light">Ajustes del sistema</p>
            </div>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`group relative rounded-xl border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 overflow-hidden ${stat.name === 'Total' ? 'border-accent/30 ring-1 ring-accent/10' : 'border-border hover:border-border/80'}`}
          >
            <div className={`absolute top-0 left-0 h-full w-1 rounded-l-xl ${stat.name === 'Total' ? 'bg-accent' : stat.color.replace('text-', 'bg-')}`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center ring-1 ${stat.ring} transition-transform duration-300 group-hover:scale-110`}>
                <svg className={`h-6 w-6 ${stat.color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={stat.icon} />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{stat.value}</p>
            <p className="text-xs font-medium text-light mt-1 uppercase tracking-wider">{stat.name}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-4xl rounded-xl bg-surface border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">Tickets Recientes</h2>
          <TicketSearch defaultValue={q} />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider hidden sm:table-cell">
                  Empresa
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider hidden md:table-cell">
                  Asignado
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
                        <svg className="h-8 w-8 text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{q ? 'No se encontraron resultados' : 'No hay tickets aún'}</p>
                      <p className="text-xs text-light mb-4">{q ? 'Intenta con otro término de búsqueda' : 'Crea tu primer ticket para comenzar'}</p>
                      {!q && (
                        <Link
                          href="/tickets/new"
                          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-all duration-200"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Crear primer ticket
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                recentTickets.map((ticket, idx) => (
                  <tr key={ticket.id} className={`hover:bg-surface-hover transition-colors duration-150 group ${idx % 2 === 1 ? 'bg-surface-hover/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <Link href={`/tickets/${ticket.id}`} className="text-sm font-medium text-foreground hover:text-accent transition-colors duration-200">
                          {ticket.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-xs text-light">
                          <span>{ticket.creator.name}</span>
                          <span>·</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-muted">{ticket.company || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ticket.status === 'OPEN' ? 'bg-blue-light text-blue' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-yellow-light text-yellow' :
                        ticket.status === 'RESOLVED' ? 'bg-green-light text-green' :
                        'bg-gray-light text-gray-badge'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDotColors[ticket.status]}`} />
                        {statusLabels[ticket.status] || ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ticket.priority === 'CRITICAL' ? 'bg-red-light text-red' :
                        ticket.priority === 'HIGH' ? 'bg-orange-light text-orange' :
                        ticket.priority === 'MEDIUM' ? 'bg-blue-light text-blue' :
                        'bg-gray-light text-gray-badge'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${priorityDotColors[ticket.priority]}`} />
                        {priorityLabels[ticket.priority] || ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {ticket.assignee?.name ? (
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[10px] font-semibold shrink-0">
                            {getInitials(ticket.assignee.name)}
                          </span>
                          <span className="text-sm text-muted">{ticket.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-light">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="rounded-md p-1.5 text-light hover:text-foreground hover:bg-background transition-all duration-150"
                          title="Ver detalle"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="rounded-md p-1.5 text-light hover:text-accent hover:bg-accent/10 transition-all duration-150"
                          title="Editar"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
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
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-light">
              Mostrando {recentTickets.length} de {total} tickets
            </p>
            <Link
              href="/tickets"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              Ver todos los tickets
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
