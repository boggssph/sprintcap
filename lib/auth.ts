import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextAuthOptions } from 'next-auth'
import { prisma } from './prisma'
import type { UserRole, User } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  providers: [
    // Enable Google provider if keys provided
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    // Credentials provider for local dev/testing only
    ...(process.env.NODE_ENV !== 'production'
      ? [
          CredentialsProvider({
            name: 'Dev Sign-in',
            credentials: {
              email: { label: 'Email', type: 'text' },
              name: { label: 'Name', type: 'text' }
            },
            async authorize(credentials) {
              if (!credentials?.email) return null
              return { id: credentials.email, email: credentials.email, name: credentials.name || credentials.email }
            }
          })
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user }) {
        if (!user?.email) return false

        // canonicalize email
        const email = user.email.toLowerCase().trim()

        // provider id (e.g., Google sub) may be available on user.id or user.providerId depending on NextAuth provider
        const providerId = (user as any).id || (user as any).sub || (user as any).providerId || null

        // Try providerId first to avoid email aliasing issues
        let existing: any = null
        if (providerId) {
          existing = await prisma.user.findFirst({ where: { providerId } as any })
        }

        // Fallback to email match
        if (!existing) {
          existing = await prisma.user.findUnique({ where: { email } })
        }

        if (existing) {
          try {
            const updateData: any = { name: user.name ?? existing.name, image: user.image ?? existing.image }
            // persist providerId when available
            if (providerId && !existing.providerId) updateData.providerId = providerId
            await prisma.user.update({ where: { id: existing.id }, data: updateData })
          } catch (e) {
            console.warn('Failed to update existing user metadata', e)
          }
          return true
        }

        // New user: bootstrap the first signer as ADMIN (application admin)
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' as unknown as UserRole } })
        if (adminCount === 0) {
          await prisma.user.create({ data: { email, name: user.name, image: user.image, providerId: providerId ?? undefined, role: 'ADMIN' as unknown as UserRole } })
          return true
        }

        // Otherwise, allow registration only if there's a pending invitation for this email
        const invite = await prisma.invitation.findFirst({ where: { email, status: 'PENDING' } })
        if (invite) {
          const created = await prisma.user.create({ data: { email, name: user.name, image: user.image, providerId: providerId ?? undefined, role: 'MEMBER' as unknown as UserRole } })
          try {
            if (invite.squadId) {
              await prisma.squadMember.create({ data: { userId: created.id, squadId: invite.squadId } })
            }
            await prisma.invitation.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } })
          } catch (e) {
            console.warn('Failed to attach invited user to squad or update invitation', e)
          }
          return true
        }

        // No invite and not the bootstrap scenario — block sign in and redirect to a friendly page
        return '/auth/no-access'
    },
    async jwt({ token, user }) {
      // When a user signs in, attach their DB role to the token
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } })
        ;(token as any).role = dbUser?.role ?? 'MEMBER'
      }
      return token
    },
    async session({ session, token }) {
      ;(session.user as any).role = (token as any).role ?? 'MEMBER'
      return session
    }
  },
  session: {
    strategy: 'jwt'
  }
}

// Expose secret and debug flag for NextAuth when imported elsewhere
export const nextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
}

export function validateAuthEnv() {
  const missing: string[] = []
  if (!process.env.NEXTAUTH_SECRET) missing.push('NEXTAUTH_SECRET')
  if (!process.env.NEXTAUTH_URL && !process.env.VERCEL_URL)
    missing.push('NEXTAUTH_URL')
  // Google provider requires both keys when enabled
  if (process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_SECRET)
    missing.push('GOOGLE_CLIENT_SECRET')
  if (process.env.GOOGLE_CLIENT_SECRET && !process.env.GOOGLE_CLIENT_ID)
    missing.push('GOOGLE_CLIENT_ID')

  if (missing.length) {
    const msg = `Missing required env vars for NextAuth: ${missing.join(', ')}`
    if (process.env.NODE_ENV === 'production') {
      console.error(msg)
    } else {
      console.warn(msg)
    }
  }
  return missing
}
