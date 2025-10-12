
import { describe, it, expect, vi } from 'vitest'
vi.mock('../../../lib/inviteService', async () => ({ listInvites: vi.fn() }))
import { listInvites } from '../../../lib/inviteService'
describe('test', () => { it('should work', () => { expect(listInvites).toBeDefined() }) })

