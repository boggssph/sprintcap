const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main(){
  const email = process.argv[2] || 'admin@example.com'
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: 'Local Admin' },
    create: { email, name: 'Local Admin', role: 'ADMIN' }
  })
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
  console.log('Upserted user:', user)
  console.log('Admin count:', adminCount)
  await prisma.$disconnect()
}

main().catch(e=>{console.error(e); process.exit(1)})
