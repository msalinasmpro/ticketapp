'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  ticketId: string | null
  read: boolean
  createdAt: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch {}
  }

  useEffect(() => {
    async function init() {
      await fetchNotifications()
    }
    init()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function markAsRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  async function markAllAsRead() {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllAsRead: true }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function getTimeAgo(dateStr: string) {
    const now = new Date()
    const date = new Date(dateStr)
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'Ahora'
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`
    return `Hace ${Math.floor(diff / 86400)}d`
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative h-8 w-8 rounded-md flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-hover active:scale-95 transition-all duration-150"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-black text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-80 rounded-lg bg-surface border border-border shadow-xl shadow-black/30 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-xs font-medium text-foreground uppercase tracking-widest">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
              >
                Marcar todo leído
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <svg className="h-7 w-7 text-light/30 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-xs text-light">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id)
                    if (notif.ticketId) {
                      setOpen(false)
                    }
                  }}
                  className={`flex items-start gap-2.5 px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-surface-hover transition-colors duration-100 ${
                    !notif.read ? 'bg-accent/5' : ''
                  }`}
                >
                  <div className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${!notif.read ? 'bg-accent' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{notif.title}</p>
                    <p className="text-xs text-light mt-0.5 line-clamp-2">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-light font-tabular">{getTimeAgo(notif.createdAt)}</span>
                      {notif.ticketId && (
                        <Link
                          href={`/tickets/${notif.ticketId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-medium text-accent hover:text-accent-hover"
                        >
                          Ver ticket →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
