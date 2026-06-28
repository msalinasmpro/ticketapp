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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isAdmin = session?.user?.role === 'admin'

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-9 items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-[4px] bg-accent flex items-center justify-center">
                <svg className="h-3 w-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-[16px] font-semibold tracking-tight text-accent">TicketApp</span>
            </Link>
            <div className="hidden sm:flex items-center gap-0.5">
              <Link href="/" className="rounded-[4px] px-3 py-1 text-[13px] font-medium text-muted hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/tickets" className="rounded-[4px] px-3 py-1 text-[13px] font-medium text-muted hover:text-foreground transition-colors">Tickets</Link>
              {isAdmin && (
                <>
                  <Link href="/admin/users" className="rounded-[4px] px-3 py-1 text-[13px] font-medium text-muted hover:text-foreground transition-colors flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    Usuarios
                  </Link>
                  <Link href="/admin/settings" className="rounded-[4px] px-3 py-1 text-[13px] font-medium text-muted hover:text-foreground transition-colors flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    Config
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {session && (
              <>
                <NotificationBell />
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 rounded-[4px] px-2 py-1 text-[13px] text-muted hover:bg-surface-hover transition-colors duration-150">
                    <span className="h-6 w-6 rounded-full bg-surface-hover text-muted flex items-center justify-center text-[10px] font-semibold">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden sm:inline text-foreground text-[13px]">{session.user?.name}</span>
                    <svg className={`h-3 w-3 text-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-[4px] bg-surface border border-border py-1 shadow-xl shadow-black/30">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-[13px] font-medium text-foreground truncate">{session.user?.name}</p>
                        <p className="text-[11px] text-muted truncate">{session.user?.email}</p>
                      </div>
                      <div className="px-3 py-1.5 border-b border-border">
                        <span className="inline-flex items-center rounded-[3px] bg-surface-hover px-2 py-0.5 text-[10px] font-medium text-muted">{session.user?.role}</span>
                      </div>
                      <Link
                        href="/account/change-password"
                        onClick={() => setMenuOpen(false)}
                        className="w-full text-left px-3 py-2 text-[13px] text-muted hover:text-foreground hover:bg-surface-hover flex items-center gap-2 transition-colors duration-150"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                        Cambiar Contraseña
                      </Link>
                      <button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="w-full text-left px-3 py-2 text-[13px] text-muted hover:text-red hover:bg-red-light flex items-center gap-2 transition-colors duration-150">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
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
