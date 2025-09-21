const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main(){
  const user = await prisma.user.upsert({
    where: { email: 'scrum.master@example.com' },
    update: {},
    create: { email: 'scrum.master@example.com', name: 'Scrum Master', role: 'SCRUM_MASTER' }
  })

  const squad = await prisma.squad.create({ data: { name: 'FM Browse & Shop Squad', scrumMasterId: user.id } })

  console.log('seeded', { user: user.email, squad: squad.name })
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async ()=> { await prisma.$disconnect() })
