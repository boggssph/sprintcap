import NextAuth from 'next-auth'
import { authOptions, nextAuthConfig, validateAuthEnv } from '../../../lib/auth'

// Validate env on module load so errors show in server logs
validateAuthEnv()

export default NextAuth({
	...authOptions,
	secret: nextAuthConfig.secret,
	debug: nextAuthConfig.debug,
})
