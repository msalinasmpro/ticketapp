import { Pool, QueryResult, QueryResultRow } from 'pg'

let _pool: Pool | null = null

export function getPool(): Pool {
  if (_pool) return _pool
  const url = process.env.DATABASE_URL
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

export async function dbQuery<T extends QueryResultRow = Record<string, unknown>>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
  const p = getPool()
  return p.query<T>(text, params)
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const result = await dbQuery<DbUser>(
    `SELECT id, email, name, password, role, "createdAt", "updatedAt" FROM "User" WHERE email = $1`,
    [email]
  )
  return result.rows[0] || null
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const result = await dbQuery<DbUser>(
    `SELECT id, email, name, password, role, "createdAt", "updatedAt" FROM "User" WHERE id = $1`,
    [id]
  )
  return result.rows[0] || null
}

export async function createUser(data: { email: string; name: string; password: string; role?: string }): Promise<DbUser> {
  const id = crypto.randomUUID()
  const result = await dbQuery<DbUser>(
    `INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING id, email, name, role, "createdAt", "updatedAt"`,
    [id, data.email, data.name, data.password, data.role || 'user']
  )
  return result.rows[0]
}
