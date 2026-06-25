'use client'

import { useRouter } from 'next/navigation'
import { TicketForm } from '@/components/tickets/ticket-form'

export default function NewTicketPage() {
  const router = useRouter()

  async function handleSubmit(data: Record<string, unknown>) {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error('Error al crear ticket')
    }

    router.push('/tickets')
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Nuevo Ticket
        </h1>
        <p className="mt-1 text-sm text-light">
          Describe el problema que necesitas resolver.
        </p>
      </div>
      <div className="rounded-2xl bg-surface border border-border p-8 shadow-sm">
        <TicketForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
