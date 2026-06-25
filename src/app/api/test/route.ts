import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
    })
    const result = await pool.query('SELECT 1 as ok')
    await pool.end()
    return NextResponse.json({ pg: true, dbUrl: process.env.DATABASE_URL?.substring(0, 40) })
  } catch (e) {
    return NextResponse.json({ pg: false, error: (e as Error).message })
  }
}
