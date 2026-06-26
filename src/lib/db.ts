export const SUPABASE_URL = 'https://jogaegabfafghmphzdvb.supabase.co'
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZ2FlZ2FiZmFmZ2htcGh6ZHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDYwNTUsImV4cCI6MjA5Nzk4MjA1NX0.Kb9u7TzIKWs-yxrJS79FljQ70Mi3medhCYb99qypPcc'

const headers: Record<string, string> = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

export interface DbUser {
  id: string
  email: string
  name: string
  password: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface DbTicket {
  id: string
  ticketNumber: number
  title: string
  description: string
  status: string
  priority: string
  phone: string | null
  company: string | null
  clientName: string | null
  reportTo: string | null
  attachmentUrl: string | null
  creatorId: string
  assigneeId: string | null
  createdAt: string
  updatedAt: string
  creator?: { id: string; name: string; email: string }
  assignee?: { id: string; name: string; email: string } | null
}

export interface DbNotification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  ticketId: string | null
  read: boolean
  createdAt: string
}

async function rest<T = Record<string, unknown>>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}${path}`, { headers, ...init })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`REST ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const rows = await rest<DbUser[]>(`/rest/v1/User?select=*&email=eq.${encodeURIComponent(email)}&limit=1`)
  return rows[0] || null
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const rows = await rest<DbUser[]>(`/rest/v1/User?select=*&id=eq.${encodeURIComponent(id)}&limit=1`)
  return rows[0] || null
}

export async function createUser(data: { email: string; name: string; password: string; role?: string }): Promise<DbUser> {
  const now = new Date().toISOString()
  const rows = await rest<DbUser[]>(`/rest/v1/User?select=*`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({ id: crypto.randomUUID(), ...data, role: data.role || 'user', createdAt: now, updatedAt: now }),
  })
  return rows[0]
}

export async function countTickets(where?: string): Promise<number> {
  const q = where || ''
  const rows = await rest<{ count: number }[]>(`/rest/v1/Ticket?select=count${q ? '&' + q : ''}`, {
    headers: { ...headers, Prefer: 'count=exact' },
  })
  return rows[0]?.count ?? 0
}

export async function findTickets(opts: {
  select?: string
  where?: string
  order?: string
  limit?: number
  offset?: number
}): Promise<Record<string, unknown>[]> {
  const params = new URLSearchParams()
  params.set('select', opts.select || '*')
  if (opts.where) opts.where.split('&').forEach(p => { const [k, v] = p.split('='); params.set(k, v) })
  params.set('order', opts.order || 'createdAt.desc')
  if (opts.limit) params.set('limit', String(opts.limit))
  if (opts.offset) { params.set('offset', String(opts.offset)); params.set('order', `${opts.order || 'createdAt.desc'}`) }
  return rest(`/rest/v1/Ticket?${params.toString()}`)
}

export async function findTicketById(id: string): Promise<DbTicket | null> {
  const rows = await rest<DbTicket[]>(`/rest/v1/Ticket?select=id,ticketNumber,title,description,status,priority,phone,company,clientName,reportTo,attachmentUrl,creatorId,assigneeId,createdAt,updatedAt,creator:User!Ticket_creatorId_fkey(id,name,email),assignee:User!Ticket_assigneeId_fkey(id,name,email)&id=eq.${encodeURIComponent(id)}&limit=1`)
  return rows[0] || null
}

export async function updateTicket(id: string, data: Record<string, unknown>): Promise<DbTicket> {
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date().toISOString() }
  if (updateData.assigneeId === '' || updateData.assigneeId === undefined) {
    updateData.assigneeId = null
  }
  const rows = await rest<DbTicket[]>(`/rest/v1/Ticket?select=id,ticketNumber,title,description,status,priority,phone,company,clientName,reportTo,attachmentUrl,creatorId,assigneeId,createdAt,updatedAt,creator:User!Ticket_creatorId_fkey(id,name,email),assignee:User!Ticket_assigneeId_fkey(id,name,email)&id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({ ...data, updatedAt: new Date().toISOString() }),
  })
  return rows[0]
}

export async function deleteTicket(id: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/Ticket?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE', headers,
  })
}

export async function createTicket(data: Record<string, unknown>): Promise<DbTicket> {
  const now = new Date().toISOString()

  const rows = await rest<DbTicket[]>(`/rest/v1/Ticket?select=id,title,description,status,priority,phone,company,attachmentUrl,creatorId,assigneeId,createdAt,updatedAt`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({ id: crypto.randomUUID(), ...data, createdAt: now, updatedAt: now }),
  })
  return rows[0]
}

export async function findNotifications(userId: string): Promise<DbNotification[]> {
  return rest(`/rest/v1/Notification?select=*&userId=eq.${encodeURIComponent(userId)}&order=createdAt.desc&limit=50`)
}

export async function updateNotification(id: string, data: Record<string, unknown>): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/Notification?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH', headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(data),
  })
}

export async function updateManyNotifications(where: Record<string, unknown>, data: Record<string, unknown>): Promise<void> {
  const params = new URLSearchParams()
  Object.entries(where).forEach(([k, v]) => params.set(k, `eq.${v}`))
  await fetch(`${SUPABASE_URL}/rest/v1/Notification?${params.toString()}`, {
    method: 'PATCH', headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(data),
  })
}

export async function createNotification(data: Record<string, unknown>): Promise<void> {
  const now = new Date().toISOString()
  await fetch(`${SUPABASE_URL}/rest/v1/Notification`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({ id: crypto.randomUUID(), ...data, read: data.read ?? false, createdAt: now }),
  })
}

export async function findUsers(): Promise<DbUser[]> {
  return rest(`/rest/v1/User?select=id,email,name,role,createdAt&order=createdAt.desc`)
}

export async function updateUserRole(id: string, role: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/User?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({ role, updatedAt: new Date().toISOString() }),
  })
}

export async function deleteUser(id: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/Notification?userId=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers })
  await fetch(`${SUPABASE_URL}/rest/v1/User?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers })
}

export async function findEmailConfig(): Promise<Record<string, unknown> | null> {
  const rows = await rest<Record<string, unknown>[]>(`/rest/v1/EmailConfig?select=*&limit=1&order=createdAt.desc`)
  return rows[0] || null
}

export async function getTicketStatsByPeriod(period: 'day' | 'week' | 'month', limit: number, isAdmin: boolean, userId?: string): Promise<{ label: string; value: number }[]> {
  const now = new Date()
  const results: { label: string; value: number }[] = []

  for (let i = limit - 1; i >= 0; i--) {
    const start = new Date(now)
    const end = new Date(now)
    let label = ''

    if (period === 'day') {
      start.setDate(now.getDate() - i)
      start.setHours(0, 0, 0, 0)
      end.setDate(now.getDate() - i)
      end.setHours(23, 59, 59, 999)
      label = start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    } else if (period === 'week') {
      start.setDate(now.getDate() - (i * 7) - now.getDay())
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      label = `S${limit - i}`
    } else {
      start.setMonth(now.getMonth() - i, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(now.getMonth() - i + 1, 0)
      end.setHours(23, 59, 59, 999)
      label = start.toLocaleDateString('es-ES', { month: 'short' })
    }

    const startISO = start.toISOString()
    const endISO = end.toISOString()

    let where = `createdAt=gte.${startISO}&createdAt=lte.${endISO}`
    if (!isAdmin && userId) where += `&creatorId=eq.${userId}`

    const rows = await rest<{ count: number }[]>(`/rest/v1/Ticket?select=count&${where}`, {
      headers: { ...headers, Prefer: 'count=exact' },
    })
    results.push({ label, value: rows[0]?.count ?? 0 })
  }

  return results
}

export async function upsertEmailConfig(data: Record<string, unknown>): Promise<void> {
  const existing = await findEmailConfig()
  if (existing) {
    await fetch(`${SUPABASE_URL}/rest/v1/EmailConfig?id=eq.${existing.id}`, {
      method: 'PATCH', headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ ...data, updatedAt: new Date().toISOString() }),
    })
  } else {
    const now = new Date().toISOString()
    await fetch(`${SUPABASE_URL}/rest/v1/EmailConfig`, {
      method: 'POST', headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ id: crypto.randomUUID(), ...data, createdAt: now, updatedAt: now }),
    })
  }
}
