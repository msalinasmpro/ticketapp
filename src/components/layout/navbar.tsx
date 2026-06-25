'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { NotificationBell } from '@/components/notifications/notification-bell'

export function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isAdmin = session?.user?.role === 'admin'

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-base font-semibold tracking-tight text-foreground">
                TicketApp
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-hover transition-all duration-200"
              >
                Dashboard
              </Link>
              <Link
                href="/tickets"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-hover transition-all duration-200"
              >
                Tickets
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/settings"
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-hover transition-all duration-200"
                >
                  Configuración
                </Link>
              )}
            </div>
          </div>

          {session && (
            <div className="flex items-center gap-2">
              <NotificationBell />

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted hover:bg-surface-hover transition-all duration-200"
                >
                  <span className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-red-400 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline text-foreground">{session.user?.name}</span>
                  <svg className={`h-4 w-4 text-light transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-border py-1.5 shadow-lg shadow-black/5">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">{session.user?.name}</p>
                      <p className="text-xs text-light truncate">{session.user?.email}</p>
                    </div>
                    <div className="px-4 py-2 border-b border-border">
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                        {session.user?.role}
                      </span>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin/settings"
                        onClick={() => setMenuOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-surface-hover flex items-center gap-2 transition-colors duration-150"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                        </svg>
                        Configuración
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: '/auth/login' })}
                      className="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-red hover:bg-red-light flex items-center gap-2 transition-colors duration-150"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
