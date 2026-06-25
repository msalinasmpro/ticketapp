import { Pool, QueryResultRow } from 'pg'

let _pool: Pool | null = null

function getPool(): Pool {
  if (_pool) return _pool
  const url = process.env.DATABASE_URL || (process.env.DATABASE_URL_B64 ? Buffer.from(process.env.DATABASE_URL_B64, 'base64').toString() : null)
  if (!url) throw new Error('DATABASE_URL not set')
  _pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 8000,
  })
  return _pool
}

export interface DbUser {
  id: string
  email: string
  name: string
  password: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export async function dbQuery(text: string, params?: unknown[]): Promise<{ rows: QueryResultRow[] }> {
  const p = getPool()
  return p.query(text, params)
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const result = await dbQuery(
    'SELECT id, email, name, password, role, "createdAt", "updatedAt" FROM "User" WHERE email = $1',
    [email]
  )
  return (result.rows[0] as DbUser) || null
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const result = await dbQuery(
    'SELECT id, email, name, password, role, "createdAt", "updatedAt" FROM "User" WHERE id = $1',
    [id]
  )
  return (result.rows[0] as DbUser) || null
}

export async function createUser(data: { email: string; name: string; password: string; role?: string }): Promise<DbUser> {
  const id = crypto.randomUUID()
  const result = await dbQuery(
    'INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, name, role, "createdAt", "updatedAt"',
    [id, data.email, data.name, data.password, data.role || 'user']
  )
  return result.rows[0] as DbUser
}
