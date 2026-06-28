'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ChangePasswordPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  if (!session) {
    router.push('/auth/login')
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    const res = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setSuccess('Contraseña cambiada correctamente')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setError(data.error || 'Error al cambiar contraseña')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-0">
      <div className="mb-6 sm:mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-light hover:text-foreground transition-colors mb-3">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Volver
        </Link>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Cambiar Contraseña</h1>
        <p className="mt-1 text-sm text-light">Actualiza tu contraseña de acceso</p>
      </div>

      <div className="rounded-xl bg-surface border border-border p-4 sm:p-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-light border border-red/20 px-4 py-3 text-sm text-red">{error}</div>
        )}
        {success && (
          <div className="mb-6 rounded-md bg-green-light border border-green/20 px-4 py-3 text-sm text-green">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 transition-all"
          >
            {loading ? 'Guardando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
