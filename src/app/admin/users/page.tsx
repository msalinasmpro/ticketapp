'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const isAdmin = session?.user?.role === 'admin'

  useEffect(() => {
    if (session && !isAdmin) {
      router.push('/')
      return
    }
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [session, isAdmin, router])

  async function toggleRole(user: User) {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    setSaving(user.id)
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, role: newRole }),
    })
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
    setSaving(null)
  }

  async function handleDelete(id: string) {
    setSaving(id)
    await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setUsers(prev => prev.filter(u => u.id !== id))
    setConfirmDelete(null)
    setSaving(null)
  }

  if (!isAdmin) return null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Gestionar Usuarios</h1>
        <p className="mt-1 text-sm text-light">Administra los roles de los usuarios registrados</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex items-center gap-3 text-light">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando...
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-surface border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-light uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                        <span className="text-sm font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-gray-light text-gray-badge'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-light">
                      {new Date(user.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {user.id !== session?.user?.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRole(user)}
                            disabled={saving === user.id}
                            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                              user.role === 'admin'
                                ? 'border border-border text-muted hover:bg-surface-hover hover:text-foreground'
                                : 'bg-accent/10 text-accent hover:bg-accent/20'
                            } disabled:opacity-50`}
                          >
                            {user.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                          </button>

                          {confirmDelete === user.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(user.id)}
                                disabled={saving === user.id}
                                className="rounded-md bg-red/10 px-2.5 py-1.5 text-xs font-medium text-red hover:bg-red/20 transition-colors disabled:opacity-50"
                              >
                                {saving === user.id ? '...' : 'Confirmar'}
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-light hover:text-foreground hover:bg-surface-hover transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(user.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:border-red/50 hover:text-red hover:bg-red-light transition-all duration-200"
                            >
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                              Eliminar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
