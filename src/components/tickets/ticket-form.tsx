'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface TicketFormProps {
  initialData?: {
    title?: string
    description?: string
    priority?: string
    status?: string
    assigneeId?: string | null
    phone?: string | null
    company?: string | null
    attachmentUrl?: string | null
  }
  onSubmit: (data: Record<string, string | undefined>) => Promise<void>
}

export function TicketForm({ initialData, onSubmit }: TicketFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState<string>(initialData?.attachmentUrl || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  function handleRemoveFile() {
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const file = formData.get('attachment') as File | null
    let attachmentUrl = initialData?.attachmentUrl || undefined

    if (file && file.size > 0) {
      attachmentUrl = file.name
    }

    try {
      await onSubmit({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        priority: formData.get('priority') as string,
        status: formData.get('status') as string || undefined,
        assigneeId: formData.get('assigneeId') as string || undefined,
        phone: formData.get('phone') as string || undefined,
        company: formData.get('company') as string || undefined,
        attachmentUrl,
      })
    } catch {
      setError('Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-light border border-red/20 p-4 text-sm text-red">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
            Título del ticket *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={initialData?.title}
            placeholder="Ej: Computador no enciende"
            className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-foreground mb-1.5">
            Empresa *
          </label>
          <input
            id="company"
            name="company"
            type="text"
            required
            defaultValue={initialData?.company || ''}
            placeholder="Nombre de la empresa"
            className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
            Teléfono de contacto
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            pattern="^\+?[\d\s-]*$"
            defaultValue={initialData?.phone || ''}
            placeholder="+56 9 1234 5678"
            className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
          Descripción del problema *
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          defaultValue={initialData?.description}
          placeholder="Describe el problema con el mayor detalle posible..."
          className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-1.5">
            Prioridad *
          </label>
          <select
            id="priority"
            name="priority"
            required
            defaultValue={initialData?.priority || 'MEDIUM'}
            className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="CRITICAL">Crítica</option>
          </select>
        </div>

        {initialData?.status && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1.5">
              Estado
            </label>
            <select
              id="status"
              name="status"
              defaultValue={initialData.status}
              className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="OPEN">Abierto</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="RESOLVED">Resuelto</option>
              <option value="CLOSED">Cerrado</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Archivo adjunto
        </label>
        {fileName ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
            <svg className="h-5 w-5 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="flex-1 text-sm text-foreground truncate">{fileName}</span>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-light hover:text-red transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background px-4 py-8 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all duration-200"
          >
            <svg className="h-8 w-8 text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Haz clic para adjuntar</p>
              <p className="text-xs text-light mt-0.5">Imágenes, documentos (máx. 10MB)</p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          name="attachment"
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-muted hover:bg-surface-hover transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50 transition-all duration-200 shadow-sm"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </span>
          ) : 'Crear Ticket'}
        </button>
      </div>
    </form>
  )
}
