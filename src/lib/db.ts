import { Pool } from 'pg'

const globalForPool = globalThis as unknown as { pool: Pool }

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  })
}

export const pool = globalForPool.pool || createPool()

if (process.env.NODE_ENV !== 'production') globalForPool.pool = pool

export interface DbUser {
  id: string
  email: string
  name: string
  password: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const result = await pool.query(
    'SELECT id, email, name, password, role, "createdAt", "updatedAt" FROM "User" WHERE email = $1',
    [email]
  )
  return result.rows[0] || null
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const result = await pool.query(
    'SELECT id, email, name, password, role, "createdAt", "updatedAt" FROM "User" WHERE id = $1',
    [id]
  )
  return result.rows[0] || null
}

export async function createUser(data: { email: string; name: string; password: string; role?: string }): Promise<DbUser> {
  const result = await pool.query(
    'INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW()) RETURNING id, email, name, role, "createdAt", "updatedAt"',
    [data.email, data.name, data.password, data.role || 'user']
  )
  return result.rows[0]
}
