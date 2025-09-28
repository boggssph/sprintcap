// Guard against empty-string environment variables which will cause new URL('')
// to throw during Next.js prerender/static generation. Some CI or local dev
// setups accidentally set env vars to an empty string instead of leaving them
// undefined. Delete those keys early so downstream code (including NextAuth
// internals) doesn't receive an empty string.

const KEYS_TO_NORMALIZE = [
  'NEXTAUTH_URL',
  'NEXTAUTH_URL_INTERNAL',
  'VERCEL_URL',
  'REDIS_URL',
  'BREVO_API_KEY',
  'NEXTAUTH_SECRET',
  'BASE_URL',
]

for (const k of KEYS_TO_NORMALIZE) {
  const v = process.env[k]
  if (typeof v === 'string' && v.trim() === '') {
    // eslint-disable-next-line no-console
    console.warn(`[env] ${k} is an empty string; treating as undefined to avoid URL parsing errors.`)
    // Remove the key so code that checks `if (process.env.X)` treats it as absent
    delete process.env[k as keyof NodeJS.ProcessEnv]
  }
}

export {}
