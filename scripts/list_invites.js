const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main(){
  const invites = await prisma.invitation.findMany()
  console.log(JSON.stringify(invites, null, 2))
  await prisma.$disconnect()
}

main().catch(e=>{console.error(e); process.exit(1)})
