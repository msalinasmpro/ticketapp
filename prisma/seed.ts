import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { hash } from 'bcryptjs'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.ticket.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.user.deleteMany()

  const admin = await prisma.user.create({
    data: {
      email: 'msalinas@tecnodior.cll',
      name: 'Matías Salinas',
      password: await hash('$$Stadmin.26', 12),
      role: 'admin',
    },
  })

  const user = await prisma.user.create({
    data: {
      email: 'user@ticketapp.com',
      name: 'Usuario Test',
      password: await hash('user123', 12),
      role: 'user',
    },
  })

  await prisma.ticket.createMany({
    data: [
      {
        title: 'Computador no enciende',
        description: 'El equipo de contabilidad no enciende. Se revisó cable de poder y funciona.',
        status: 'OPEN',
        priority: 'HIGH',
        creatorId: user.id,
      },
      {
        title: 'Instalar TeamViewer',
        description: 'Necesito TeamViewer instalado en mi equipo para soporte remoto.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        creatorId: user.id,
        assigneeId: admin.id,
      },
      {
        title: 'Problema con Outlook',
        description: 'Outlook se cierra inesperadamente al abrir correos con archivos adjuntos.',
        status: 'RESOLVED',
        priority: 'LOW',
        creatorId: user.id,
        assigneeId: admin.id,
      },
    ],
  })

  console.log('Seed completado')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
