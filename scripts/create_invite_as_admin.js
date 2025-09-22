const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')
const prisma = new PrismaClient()

async function main(){
  const actorEmail = process.argv[2] || 'admin@local.test'
  const email = process.argv[3] || 'new.member@local.test'
  const role = process.argv[4] || 'MEMBER'

  const actor = await prisma.user.findUnique({ where: { email: actorEmail } })
  if (!actor) return console.error('actor not found')

  if ((role === 'SCRUM_MASTER' || role === 'ADMIN') && actor.role !== 'ADMIN') return console.error('actor not allowed')

  const token = crypto.randomBytes(24).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 7*24*60*60*1000)

  const invite = await prisma.invitation.create({ data: { email, squadId: null, tokenHash, expiresAt, invitedRole: role } })
  await prisma.auditLog.create({ data: { actorId: actor.id, action: 'CREATE_INVITE', meta: { inviteId: invite.id, email, role } } })

  console.log('Created invite', invite.id, 'token:', token)
  await prisma.$disconnect()
}

main().catch(e=>{console.error(e);process.exit(1)})
