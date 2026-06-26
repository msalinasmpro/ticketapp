'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { useTheme } from '@/components/providers/theme-provider'

export function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isAdmin = session?.user?.role === 'admin'

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-[var(--color-background)]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center">
                <svg className="h-3.5 w-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">TicketApp</span>
            </Link>
            <div className="hidden sm:flex items-center gap-0.5">
              <Link href="/" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/tickets" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground transition-colors">Tickets</Link>
              {isAdmin && <Link href="/admin/settings" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground transition-colors">Config</Link>}
              {isAdmin && <Link href="/admin/users" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground transition-colors">Usuarios</Link>}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {session && (
              <>
                <button onClick={toggle} className="h-8 w-8 rounded-md flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-hover transition-all" title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
                  {theme === 'dark' ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </button>
                <NotificationBell />
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted hover:bg-surface-hover transition-all">
                    <span className="h-7 w-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden sm:inline text-foreground text-sm">{session.user?.name}</span>
                    <svg className={`h-3.5 w-3.5 text-light transition-transform ${menuOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl bg-surface border border-border py-1 shadow-xl shadow-black/30">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">{session.user?.name}</p>
                        <p className="text-xs text-light truncate">{session.user?.email}</p>
                      </div>
                      <div className="px-3 py-1.5 border-b border-border">
                        <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">{session.user?.role}</span>
                      </div>
                      <Link
                        href="/account/change-password"
                        onClick={() => setMenuOpen(false)}
                        className="w-full text-left px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-hover flex items-center gap-2 transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                        Cambiar Contraseña
                      </Link>
                      <button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="w-full text-left px-3 py-2 text-sm text-muted hover:text-red hover:bg-red-light flex items-center gap-2 transition-colors">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
