'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { TicketForm } from '@/components/tickets/ticket-form'

export default function NewTicketPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const role = session?.user?.role
  const isAdmin = role === 'admin'
  const isTecnico = role === 'tecnico'
  const [assignableUsers, setAssignableUsers] = useState<{ id: string; name: string; email: string }[]>([])

  useEffect(() => {
    if (isAdmin || isTecnico) {
      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => setAssignableUsers(data.filter((u: { role: string }) => u.role === 'admin' || u.role === 'tecnico')))
    }
  }, [isAdmin])

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
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/tickets" className="inline-flex items-center gap-1.5 text-sm text-light hover:text-foreground transition-colors mb-3">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Tickets
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Nuevo Ticket
        </h1>
        <p className="mt-1 text-sm text-light">
          Describe el problema que necesitas resolver.
        </p>
      </div>
      <div className="rounded-xl bg-surface border border-border p-8 shadow-sm">
        <TicketForm onSubmit={handleSubmit} showClientName={isAdmin || isTecnico} assignees={assignableUsers} />
      </div>
    </div>
  )
}
