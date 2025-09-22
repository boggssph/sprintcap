const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main(){
  const users = await prisma.user.findMany()
  console.log(users)
  await prisma.$disconnect()
}

main().catch(e=>{console.error(e); process.exit(1)})
