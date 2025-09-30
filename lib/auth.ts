// Normalize environment variables early to avoid empty-string URL parsing
import './normalizeEnv'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextAuthOptions } from 'next-auth'
import { prisma } from './prisma'
import { authLog, hashPII } from './logger'
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
  authLog('signIn_attempt', { provider: typeof user === 'object' && user !== null && 'provider' in user ? (user as { provider?: string }).provider : 'unknown', emailHash: hashPII(user?.email || undefined) })
        if (!user?.email) {
          authLog('signIn_failed_no_email', { emailHash: hashPII(typeof user === 'object' && user !== null && 'email' in user ? (user as { email?: string }).email : undefined) })
          return false
        }

        // canonicalize email
        const email = user.email.toLowerCase().trim()

        // provider id (e.g., Google sub) may be available on user.id or user.providerId depending on NextAuth provider
        const providerId = typeof user === 'object' && user !== null
          ? ((user as { id?: string }).id || (user as { sub?: string }).sub || (user as { providerId?: string }).providerId || null)
          : null

        // Try providerId first to avoid email aliasing issues
        let existing: User | null = null
        if (providerId) {
          existing = await prisma.user.findFirst({ where: { providerId: { equals: providerId } } })
        }

        // Fallback to email match
        if (!existing) {
          existing = await prisma.user.findUnique({ where: { email } })
        }

        if (existing) {
          try {
            const updateData: Partial<User> = { name: user.name ?? existing.name, image: user.image ?? existing.image }
            // persist providerId when available
            if (providerId && !existing.providerId) updateData.providerId = providerId
            await prisma.user.update({ where: { id: existing.id }, data: updateData })
          } catch (e) {
            console.warn('Failed to update existing user metadata', e)
          }
          
          // Ensure Scrum Masters have at least one squad in development
          if (existing.role === 'SCRUM_MASTER' && process.env.NODE_ENV !== 'production') {
            const squadCount = await prisma.squad.count({ where: { scrumMasterId: existing.id } })
            if (squadCount === 0) {
              // Create a default squad for the Scrum Master
              await prisma.squad.create({
                data: {
                  name: `${existing.name || existing.email}'s Squad`,
                  alias: `DEV-${existing.id.slice(0, 8)}`,
                  scrumMasterId: existing.id
                }
              })
              console.log(`Created default squad for Scrum Master: ${existing.email}`)
            }
          }
          
          authLog('signIn_success', { emailHash: hashPII(email || undefined), userId: existing.id, role: existing.role })

          // Don't redirect from server-side callback, let client handle it
          return true
        }

        // New user: bootstrap the first signer as ADMIN (application admin)
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' as UserRole } })
        if (adminCount === 0) {
          const created = await prisma.user.create({ data: { email, name: user.name, image: user.image, providerId: providerId ?? undefined, role: 'ADMIN' as UserRole } })
          authLog('signIn_bootstrap_admin', { emailHash: hashPII(email || undefined), userId: created.id })
          return true
        }

        // Otherwise, allow registration only if there's a pending invitation for this email
        const invite = await prisma.invitation.findFirst({ where: { email, status: 'PENDING' } })
        if (invite) {
          const created = await prisma.user.create({ data: { email, name: user.name, image: user.image, providerId: providerId ?? undefined, role: 'MEMBER' as UserRole } })
          try {
            if (invite.squadId) {
              await prisma.squadMember.create({ data: { userId: created.id, squadId: invite.squadId } })
            }
            await prisma.invitation.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } })
          } catch (e) {
            console.warn('Failed to attach invited user to squad or update invitation', e)
          }
          authLog('signIn_success_invite', { emailHash: hashPII(email || undefined), userId: created.id, inviteId: invite.id })
          return true
        }

        // No invite and not the bootstrap scenario — allow sign-in but require access request
        authLog('signIn_access_request_needed', { emailHash: hashPII(email || undefined), providerId })
        // Return a special URL that will show the access request dialog
        return '/auth/request-access?email=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(user.name || '') + '&image=' + encodeURIComponent(user.image || '') + '&providerId=' + encodeURIComponent(providerId || '')
    },
    async jwt({ token, user }) {
      // When a user signs in, attach their DB role and display name to the token
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } })
        if (dbUser) {
          (token as { [key: string]: unknown }).role = dbUser.role ?? 'MEMBER';
          (token as { [key: string]: unknown }).displayName = dbUser.displayName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof session.user === 'object') {
        (session.user as { [key: string]: unknown }).role = (token as { [key: string]: unknown }).role ?? 'MEMBER';
        (session.user as { [key: string]: unknown }).displayName = (token as { [key: string]: unknown }).displayName;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt'
  }
  ,
  // Use secure cookies in production
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: process.env.NODE_ENV === 'production' ? undefined : undefined,
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
