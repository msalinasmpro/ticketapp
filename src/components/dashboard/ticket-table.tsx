'use client'

import { useState } from 'react'
import Link from 'next/link'

interface TicketRow {
  id: string
  ticketNumber: number
  title: string
  status: string
  priority: string
  company?: string | null
  clientName?: string | null
  reportTo?: string | null
  phone?: string | null
  createdAt: string
  creator: { name: string }
  assignee?: { name: string } | null
}

interface TicketTableProps {
  tickets: TicketRow[]
  isAdmin: boolean
  canSeeAll?: boolean
}

type SortKey = 'ticketNumber' | 'title' | 'company' | 'clientName' | 'status' | 'priority' | 'assignee' | 'createdAt'
type SortDir = 'asc' | 'desc'

const statusLabels: Record<string, string> = {
  OPEN: 'Abierto', IN_PROGRESS: 'En Progreso', RESOLVED: 'Resuelto', CLOSED: 'Cerrado',
}
const priorityLabels: Record<string, string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica',
}
const statusDotColors: Record<string, string> = {
  OPEN: 'bg-blue', IN_PROGRESS: 'bg-yellow', RESOLVED: 'bg-green', CLOSED: 'bg-gray-badge',
}
const priorityDotColors: Record<string, string> = {
  LOW: 'bg-gray-badge', MEDIUM: 'bg-blue', HIGH: 'bg-orange', CRITICAL: 'bg-red',
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg className={`h-3 w-3 ml-1 inline-block transition-transform duration-150 ${active ? 'text-foreground' : 'text-muted'} ${active && dir === 'desc' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 15l-6-6-6 6" />
    </svg>
  )
}

export function TicketTable({ tickets, isAdmin, canSeeAll = isAdmin }: TicketTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('ticketNumber')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'ticketNumber' || key === 'createdAt' ? 'desc' : 'asc')
    }
  }

  function getSortValue(ticket: TicketRow, key: SortKey): string | number {
    switch (key) {
      case 'ticketNumber': return ticket.ticketNumber || 0
      case 'title': return ticket.title.toLowerCase()
      case 'company': return (ticket.company || '').toLowerCase()
      case 'clientName': return (ticket.clientName || '').toLowerCase()
      case 'status': return ticket.status
      case 'priority': return ticket.priority
      case 'assignee': return ticket.assignee?.name?.toLowerCase() || 'zzz'
      case 'createdAt': return new Date(ticket.createdAt).getTime()
      default: return 0
    }
  }

  const sorted = [...tickets].sort((a, b) => {
    const aVal = getSortValue(a, sortKey)
    const bVal = getSortValue(b, sortKey)
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  function Header({ label, sortId, className = '' }: { label: string; sortId: SortKey; className?: string }) {
    return (
      <th
        className={`px-6 py-2 text-left text-[11px] font-medium text-muted uppercase tracking-[0.08em] cursor-pointer hover:text-foreground select-none transition-colors duration-150 ${className}`}
        onClick={() => toggleSort(sortId)}
      >
        {label}<SortIcon active={sortKey === sortId} dir={sortDir} />
      </th>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-border">
            <Header label="Nº / Ticket" sortId="ticketNumber" />
            <Header label="Empresa" sortId="company" className="hidden sm:table-cell" />
            {canSeeAll && <Header label="Cliente" sortId="clientName" className="hidden md:table-cell" />}
            <Header label="Estado" sortId="status" />
            <Header label="Prioridad" sortId="priority" />
            {canSeeAll && <Header label="Reportar a" sortId="clientName" className="hidden lg:table-cell" />}
            {canSeeAll && <Header label="Asignado" sortId="assignee" className="hidden md:table-cell" />}
            <th className="px-6 py-2 text-left text-[11px] font-medium text-muted uppercase tracking-[0.08em]">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <svg className="h-6 w-6 text-muted mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-[13px] text-muted mb-1">No hay tickets</p>
                </div>
              </td>
            </tr>
          ) : (
            sorted.map((ticket, idx) => (
              <tr key={ticket.id} className={`hover:bg-surface-hover transition-colors duration-[120ms] group ${idx % 2 === 1 ? 'bg-surface-hover/30' : ''}`}>
                <td className="px-6 py-2">
                  <div>
                    <Link href={`/tickets/${ticket.id}`} className="text-[13px] font-medium text-foreground hover:text-link transition-colors duration-[120ms]">
                      <span className="text-muted mr-1.5">#{ticket.ticketNumber}</span>
                      {ticket.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted">
                      <span>{ticket.creator.name}</span>
                      <span>·</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-2 hidden sm:table-cell">
                  <span className="text-[13px] text-muted">{ticket.company || '-'}</span>
                </td>
                {canSeeAll && (
                  <td className="px-6 py-2 hidden md:table-cell">
                    <span className="text-[13px] text-muted">{ticket.clientName || '-'}</span>
                  </td>
                )}
                <td className="px-6 py-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
                    <span className={`h-1 w-1 rounded-full ${statusDotColors[ticket.status]}`} />
                    {statusLabels[ticket.status] || ticket.status}
                  </span>
                </td>
                <td className="px-6 py-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
                    <span className={`h-1 w-1 rounded-full ${priorityDotColors[ticket.priority]}`} />
                    {priorityLabels[ticket.priority] || ticket.priority}
                  </span>
                </td>
                {canSeeAll && (
                  <td className="px-6 py-2 hidden lg:table-cell">
                    <span className="text-[13px] text-muted">{ticket.reportTo || '-'}</span>
                  </td>
                )}
                {canSeeAll && (
                  <td className="px-6 py-2 hidden md:table-cell">
                    {ticket.assignee?.name ? (
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-surface-hover text-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
                          {ticket.assignee.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                        <span className="text-[13px] text-muted">{ticket.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted">Sin asignar</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-2">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-[120ms]">
                    <Link href={`/tickets/${ticket.id}`} className="rounded-[4px] p-1.5 text-muted hover:text-foreground hover:bg-surface-hover transition-all duration-[120ms]" title="Ver detalle">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </Link>
                    <Link href={`/tickets/${ticket.id}`} className="rounded-[4px] p-1.5 text-muted hover:text-accent hover:bg-accent/10 transition-all duration-[120ms]" title="Editar">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
