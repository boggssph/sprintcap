const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main(){
  const email = process.argv[2] || 'scrum-master@example.com'
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: 'Scrum Master' },
    create: { email, name: 'Scrum Master', role: 'SCRUM_MASTER' }
  })
  const scrumMasterCount = await prisma.user.count({ where: { role: 'SCRUM_MASTER' } })
  console.log('Upserted user:', user)
  console.log('Scrum Master count:', scrumMasterCount)
  await prisma.$disconnect()
}

main().catch(e=>{console.error(e); process.exit(1)})