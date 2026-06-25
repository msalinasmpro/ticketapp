const SUPABASE_URL = 'https://jogaegabfafghmphzdvb.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZ2FlZ2FiZmFmZ2htcGh6ZHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDYwNTUsImV4cCI6MjA5Nzk4MjA1NX0.Kb9u7TzIKWs-yxrJS79FljQ70Mi3medhCYb99qypPcc'

const headers = {
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

async function restQuery(table: string, params: string): Promise<unknown[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers })
  if (!res.ok) throw new Error(`REST ${res.status}: ${await res.text()}`)
  return res.json()
}

async function restInsert(table: string, data: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`REST ${res.status}: ${await res.text()}`)
  const rows = await res.json()
  return rows[0]
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const rows = await restQuery('User', `select=id,email,name,password,role,"createdAt","updatedAt"&email=eq.${encodeURIComponent(email)}&limit=1`)
  return (rows[0] as DbUser) || null
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const rows = await restQuery('User', `select=id,email,name,password,role,"createdAt","updatedAt"&id=eq.${encodeURIComponent(id)}&limit=1`)
  return (rows[0] as DbUser) || null
}

export async function createUser(data: { email: string; name: string; password: string; role?: string }): Promise<DbUser> {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const row = await restInsert('User', {
    id, email: data.email, name: data.name, password: data.password, role: data.role || 'user',
    createdAt: now, updatedAt: now,
  })
  return row as DbUser
}
