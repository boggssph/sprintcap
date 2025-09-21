import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextAuthOptions } from 'next-auth'

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
      return true
    }
  },
  session: {
    strategy: 'jwt'
  }
}
