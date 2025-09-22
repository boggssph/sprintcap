import '@testing-library/jest-dom'

// mock next/navigation's useRouter used in the admin page
import * as nextNavigation from 'next/navigation'
try {
  // Some environments already define this; avoid redefining.
  ;(nextNavigation as any).useRouter = (nextNavigation as any).useRouter || (() => ({ push: () => {} }))
} catch (e) {
  // ignore; tests can still proceed without overriding
}
