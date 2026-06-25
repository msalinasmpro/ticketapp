import { NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const results: Record<string, unknown> = {}
  results.envUrl = process.env.DATABASE_URL ? 'SET_len_' + process.env.DATABASE_URL.length : 'NOT_SET'

  try {
    const pool = getPool()
    const r = await pool.query('SELECT id, email, role FROM "User" LIMIT 5')
    results.users = r.rows
    results.count = r.rowCount
  } catch (e) {
    results.dbError = (e as Error).message
  }

  try {
    const { default: bcrypt } = await import('bcryptjs')
    const h = await bcrypt.hash('test', 10)
    results.bcrypt = 'ok'
    results.testCompare = await bcrypt.compare('test', h)
  } catch (e) {
    results.bcryptError = (e as Error).message
  }

  return NextResponse.json(results)
}
