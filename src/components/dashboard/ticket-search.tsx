'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

export function TicketSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [value, setValue] = useState(defaultValue || '')

  function handleSearch(term: string) {
    setValue(term)
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    startTransition(() => {
      router.replace(`/?${params.toString()}`)
    })
  }

  return (
    <div className="relative w-full sm:w-64">
      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-light pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar tickets..."
        className="w-full rounded-md bg-surface-2 pl-8 pr-8 py-1.5 text-sm text-foreground placeholder:text-light border border-transparent focus:border-border focus:outline-none transition-all duration-150"
      />
      {value && (
        <button
          onClick={() => handleSearch('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-light hover:text-foreground transition-colors"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
