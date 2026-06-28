'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { NotificationBell } from '@/components/notifications/notification-bell'

interface EmailConfig {
  id?: string
  provider: string
  host: string
  port: number
  user: string
  from: string
  enabled: boolean
}

export default function EmailSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [config, setConfig] = useState<EmailConfig>({
    provider: 'google',
    host: 'smtp.gmail.com',
    port: 587,
    user: '',
    from: '',
    enabled: true,
  })

  useEffect(() => {
    async function loadConfig() {
      setLoading(true)
      try {
        const res = await fetch('/api/email-config')
        const data = await res.json()
        if (data) {
          setConfig(data)
        }
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  async function handleOAuthEmail(provider: 'google' | 'azure-ad') {
    const callbackUrl = '/admin/settings?connected=' + provider
    await signIn(provider, { callbackUrl })
  }

  async function handleSave() {
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (res.ok) {
        setMessage('Configuración guardada correctamente')
      } else {
        setMessage('Error al guardar la configuración')
      }
    } catch {
      setMessage('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-light">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-light hover:text-foreground transition-colors mb-3">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Configuración de Correo
          </h1>
          <p className="mt-1 text-sm text-light">
            Configura el correo para recibir notificaciones de nuevos tickets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
        </div>
      </div>

      {message && (
        <div className={`mb-6 rounded-xl p-4 text-sm ${
          message.includes('Error')
            ? 'bg-red-light border border-red/20 text-red'
            : 'bg-green-light border border-green/20 text-green'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        <div className="rounded-xl bg-surface border border-border p-4 sm:p-8 shadow-sm">
          <h2 className="text-lg font-medium text-foreground mb-2">Configuración de Correo</h2>
          <p className="text-sm text-light mb-6">
            Configura el servidor SMTP para recibir notificaciones de nuevos tickets.
          </p>

          <div className="space-y-6">
            <div>
              <label htmlFor="host" className="block text-sm font-medium text-foreground mb-1.5">
                Host del servidor
              </label>
              <input
                id="host"
                type="text"
                value={config.host}
                onChange={(e) => setConfig((prev) => ({ ...prev, host: e.target.value }))}
                placeholder="smtp.tudominio.com"
                className="block w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="port" className="block text-sm font-medium text-foreground mb-1.5">
                  Puerto
                </label>
                <input
                  id="port"
                  type="number"
                  value={config.port}
                  onChange={(e) => setConfig((prev) => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
                  className="block w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="provider-select" className="block text-sm font-medium text-foreground mb-1.5">
                  Protocolo
                </label>
                <select
                  id="provider-select"
                  value={config.provider}
                  onChange={(e) => setConfig((prev) => ({ ...prev, provider: e.target.value }))}
                  className="block w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="smtp">SMTP</option>
                  <option value="pop">POP3</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="user" className="block text-sm font-medium text-foreground mb-1.5">
                Usuario / Email
              </label>
              <input
                id="user"
                type="email"
                value={config.user}
                onChange={(e) => setConfig((prev) => ({ ...prev, user: e.target.value }))}
                placeholder="correo@tudominio.com"
                className="block w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                onChange={(e) => setConfig((prev) => ({ ...prev, password: e.target.value }))}
                placeholder={config.id ? '•••••••• (dejar vacío para mantener)' : 'Tu contraseña'}
                className="block w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="from" className="block text-sm font-medium text-foreground mb-1.5">
                Email remitente
              </label>
              <input
                id="from"
                type="email"
                value={config.from}
                onChange={(e) => setConfig((prev) => ({ ...prev, from: e.target.value }))}
                placeholder="notificaciones@tudominio.com"
                className="block w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Notificaciones por correo</p>
                <p className="text-xs text-light">Recibir email cuando se cree un ticket</p>
              </div>
              <button
                onClick={() => setConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  config.enabled ? 'bg-accent' : 'bg-light/50'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform duration-200 ${
                    config.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-muted hover:bg-surface-hover transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50 transition-all duration-200 shadow-sm"
          >
            {saving ? 'Guardando...' : 'Guardar configuración SMTP'}
          </button>
        </div>
      </div>
    </div>
  )
}
