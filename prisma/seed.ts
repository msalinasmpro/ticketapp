import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { hash } from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ticketapp.com' },
    update: {},
    create: {
      email: 'admin@ticketapp.com',
      name: 'Admin',
      password: await hash('admin123', 12),
      role: 'admin',
    },
  })

  const user = await prisma.user.upsert({
    where: { email: 'user@ticketapp.com' },
    update: {},
    create: {
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
  })
