import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { countTickets, findTickets, getTicketStatsByPeriod, SUPABASE_URL, SUPABASE_KEY } from '@/lib/db'
import Link from 'next/link'
import { TicketSearch } from '@/components/dashboard/ticket-search'
import { BarChart } from '@/components/charts/bar-chart'
import { TicketTable } from '@/components/dashboard/ticket-table'

interface DashboardTicket {
  id: string
  ticketNumber: number
  title: string
  status: string
  priority: string
  company: string | null
  clientName: string | null
  reportTo: string | null
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
  const role = session.user.role
  const isAdmin = role === 'admin'
  const isTecnico = role === 'tecnico'
  const canSeeAll = isAdmin || isTecnico
  const userId = session.user.id

  const whereParts: string[] = []
  if (!canSeeAll) whereParts.push(`creatorId=eq.${userId}`)

  const countWhere = whereParts.length > 0 ? whereParts.join('&') : undefined

  const [total, open, inProgress, resolved, closed] = await Promise.all([
    countTickets(countWhere),
    countTickets(countWhere ? `${countWhere}&status=eq.OPEN` : 'status=eq.OPEN'),
    countTickets(countWhere ? `${countWhere}&status=eq.IN_PROGRESS` : 'status=eq.IN_PROGRESS'),
    countTickets(countWhere ? `${countWhere}&status=eq.RESOLVED` : 'status=eq.RESOLVED'),
    countTickets(countWhere ? `${countWhere}&status=eq.CLOSED` : 'status=eq.CLOSED'),
  ])

  const select = 'id,ticketNumber,title,status,priority,company,clientName,reportTo,phone,createdAt,creator:User!Ticket_creatorId_fkey(name),assignee:User!Ticket_assigneeId_fkey(name)'

  let recentTickets: DashboardTicket[]
  if (q) {
    const eq = encodeURIComponent(q)
    const fetchHeaders = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }
    const searchWhere = !canSeeAll ? `&creatorId=eq.${userId}` : ''
    const url = `${SUPABASE_URL}/rest/v1/Ticket?select=${select}&or=(title.ilike.*${eq}*,company.ilike.*${eq}*,phone.ilike.*${eq}*,description.ilike.*${eq}*)${searchWhere}&order=createdAt.desc&limit=10`
    recentTickets = await fetch(url, { headers: fetchHeaders }).then(r => r.json())
  } else {
    const ticketWhere = !canSeeAll ? `creatorId=eq.${userId}` : undefined
    recentTickets = await findTickets({ select, where: ticketWhere, order: 'createdAt.desc', limit: 10 }) as unknown as DashboardTicket[]
  }

  const [dailyData, weeklyData, monthlyData] = await Promise.all([
    getTicketStatsByPeriod('day', 7, canSeeAll, canSeeAll ? undefined : userId),
    getTicketStatsByPeriod('week', 4, canSeeAll, canSeeAll ? undefined : userId),
    getTicketStatsByPeriod('month', 6, canSeeAll, canSeeAll ? undefined : userId),
  ])

  const stats = [
    { name: 'Total', value: total, dotColor: 'bg-accent' },
    { name: 'Abiertos', value: open, dotColor: 'bg-blue' },
    { name: 'En Progreso', value: inProgress, dotColor: 'bg-yellow' },
    { name: 'Resueltos', value: resolved, dotColor: 'bg-green' },
    { name: 'Cerrados', value: closed, dotColor: 'bg-gray-badge' },
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
      <div className="flex items-center gap-4 mb-8 rounded-[6px] bg-surface border border-border p-5">
        <div className="h-12 w-12 rounded-full bg-[#3ecf8e]/10 text-[#3ecf8e] flex items-center justify-center text-lg font-semibold shrink-0">
          {getInitials(session.user?.name || 'U')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-semibold text-foreground tracking-tight">
              Hola, {session.user?.name}
            </h1>
            {isAdmin && (
              <span className="inline-flex items-center rounded-full bg-[#3ecf8e]/10 px-2 py-0.5 text-[11px] font-medium text-[#3ecf8e]">
                Admin
              </span>
            )}
          </div>
          <p className="text-[13px] text-muted mt-0.5">
            {isAdmin
              ? `Tienes ${total} ticket${total !== 1 ? 's' : ''} en el sistema. ${open > 0 ? `${open} abiert${open !== 1 ? 'os' : 'o'}.` : 'Todo al día.'}`
              : `Tienes ${total} ticket${total !== 1 ? 's' : ''}. ${open > 0 ? `${open} abiert${open !== 1 ? 'os' : 'o'}.` : 'Todo al día.'}`
            }
          </p>
        </div>
        <Link
          href="/tickets/new"
          className="inline-flex items-center gap-2 rounded-[6px] bg-accent px-4 py-2 text-[13px] font-medium text-background hover:bg-accent-hover transition-colors duration-150 shrink-0"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Ticket
        </Link>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/tickets"
            className="group flex flex-col items-start gap-3 rounded-md border border-border bg-surface p-6 hover:bg-surface-hover transition-colors duration-150"
          >
            <div className="h-10 w-10 rounded-md bg-[#3ecf8e]/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-[#3ecf8e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">Ver Tickets</p>
              <p className="text-[13px] text-muted mt-0.5">Administra y revisa todos los tickets</p>
            </div>
          </Link>
          <Link
            href="/admin/users"
            className="group flex flex-col items-start gap-3 rounded-md border border-border bg-surface p-6 hover:bg-surface-hover transition-colors duration-150"
          >
            <div className="h-10 w-10 rounded-md bg-[#3ecf8e]/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-[#3ecf8e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">Gestionar Usuarios</p>
              <p className="text-[13px] text-muted mt-0.5">Promueve o elimina usuarios del sistema</p>
            </div>
          </Link>
          <Link
            href="/admin/settings"
            className="group flex flex-col items-start gap-3 rounded-md border border-border bg-surface p-6 hover:bg-surface-hover transition-colors duration-150"
          >
            <div className="h-10 w-10 rounded-md bg-[#3ecf8e]/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-[#3ecf8e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">Configuración</p>
              <p className="text-[13px] text-muted mt-0.5">Ajustes del sistema de email y notificaciones</p>
            </div>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="group relative rounded-[6px] border border-border bg-surface p-4 transition-colors duration-[120ms] hover:bg-surface-hover overflow-hidden"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <span className={`h-1 w-1 rounded-full ${stat.dotColor}`} />
              <p className="text-[11px] font-medium text-muted uppercase tracking-[0.08em]">{stat.name}</p>
            </div>
            <p className="text-[24px] font-semibold text-foreground tabular-nums leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-[6px] bg-surface border border-border p-4">
          <p className="text-[11px] font-medium text-muted uppercase tracking-[0.08em] mb-3">Últimos 7 días</p>
          <BarChart data={dailyData} color="#3ecf8e" height={100} />
        </div>
        <div className="rounded-[6px] bg-surface border border-border p-4">
          <p className="text-[11px] font-medium text-muted uppercase tracking-[0.08em] mb-3">Últimas 4 semanas</p>
          <BarChart data={weeklyData} color="#3b82f6" height={100} />
        </div>
        <div className="rounded-[6px] bg-surface border border-border p-4">
          <p className="text-[11px] font-medium text-muted uppercase tracking-[0.08em] mb-3">Últimos 6 meses</p>
          <BarChart data={monthlyData} color="#f59e0b" height={100} />
        </div>
      </div>

      <div className="mx-auto max-w-4xl rounded-[6px] bg-surface border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-3 border-b border-border">
          <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-[0.08em]">Tickets Recientes</h2>
          <TicketSearch defaultValue={q} />
        </div>
        <TicketTable tickets={recentTickets} isAdmin={isAdmin} />
        {recentTickets.length > 0 && (
          <div className="px-6 py-3 border-t border-border flex items-center justify-between">
            <p className="text-[11px] text-muted">
              Mostrando {recentTickets.length} de {total} tickets
            </p>
            <Link href="/tickets" className="text-[13px] font-medium text-link hover:text-link transition-colors">
              Ver todos los tickets →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
