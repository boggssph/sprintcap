import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, makeScrumMaster } = body
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name, role: makeScrumMaster ? 'SCRUM_MASTER' : 'MEMBER' }
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
