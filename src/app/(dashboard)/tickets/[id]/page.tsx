'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TicketForm } from '@/components/tickets/ticket-form'

interface Ticket {
  id: string
  title: string
  description: string
  status: string
  priority: string
  phone: string | null
  company: string | null
  attachmentUrl: string | null
  creatorId: string
  assigneeId: string | null
  creator: { id: string; name: string; email: string }
  assignee: { id: string; name: string; email: string } | null
  createdAt: string
  updatedAt: string
}

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

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    fetch(`/api/tickets/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTicket(data)
        setLoading(false)
      })
  }, [id])

  async function handleUpdate(data: Record<string, unknown>) {
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error('Error al actualizar')
    }

    const updated = await res.json()
    setTicket(updated)
    setEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('¿Estás seguro de eliminar este ticket?')) return

    const res = await fetch(`/api/tickets/${id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      router.push('/tickets')
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-light">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <svg className="h-10 w-10 text-light/30 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm text-light mb-4">Ticket no encontrado</p>
        <Link href="/tickets" className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">
          Volver a tickets
        </Link>
      </div>
    )
  }

  if (editing) {
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Editar Ticket
          </h1>
          <p className="mt-1 text-sm text-light">
            Actualiza la información del ticket
          </p>
        </div>
        <div className="rounded-lg bg-surface border border-border p-6">
          <TicketForm
            initialData={ticket}
            onSubmit={handleUpdate}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/tickets" className="inline-flex items-center gap-1.5 text-xs text-light hover:text-foreground transition-colors mb-2">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Tickets
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {ticket.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-hover active:scale-[0.97] transition-all duration-150"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-md border border-red/20 bg-red-light px-3 py-2 text-sm font-medium text-red hover:bg-red/10 active:scale-[0.97] transition-all duration-150"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot[ticket.status] || 'bg-gray-badge'}`} />
              {statusLabels[ticket.status] || ticket.status}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[ticket.priority] || 'bg-gray-badge'}`} />
              {priorityLabels[ticket.priority] || ticket.priority}
            </span>
          </div>

          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </div>
        </div>

        <div className="border-t border-border bg-surface-2 px-6 py-4">
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            <div>
              <dt className="text-[11px] font-medium text-light uppercase tracking-widest mb-1">Empresa</dt>
              <dd className="text-sm text-foreground">
                {ticket.company || (
                  <span className="text-light">No especificada</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-light uppercase tracking-widest mb-1">Teléfono</dt>
              <dd className="text-sm text-foreground">
                {ticket.phone || (
                  <span className="text-light">No proporcionado</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-light uppercase tracking-widest mb-1">Creador</dt>
              <dd className="text-sm text-foreground">{ticket.creator.name}</dd>
              <dd className="text-xs text-light">{ticket.creator.email}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-light uppercase tracking-widest mb-1">Asignado a</dt>
              <dd className="text-sm text-foreground">
                {ticket.assignee?.name || (
                  <span className="text-light">Sin asignar</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-light uppercase tracking-widest mb-1">Creado</dt>
              <dd className="text-sm text-foreground font-tabular">
                {new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-light uppercase tracking-widest mb-1">Actualizado</dt>
              <dd className="text-sm text-foreground font-tabular">
                {new Date(ticket.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </dd>
            </div>
          </dl>
          {ticket.attachmentUrl && (
            <div className="mt-4 pt-4 border-t border-border">
              <dt className="text-[11px] font-medium text-light uppercase tracking-widest mb-2">Archivo adjunto</dt>
              <div className="inline-flex items-center gap-2 rounded-md bg-background border border-border px-3 py-2">
                <svg className="h-3.5 w-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-sm text-foreground">{ticket.attachmentUrl}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
