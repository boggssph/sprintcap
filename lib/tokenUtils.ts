import crypto from 'crypto'

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString('hex')
}
