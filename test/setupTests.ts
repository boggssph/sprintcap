import '@testing-library/jest-dom'

// mock next/navigation's useRouter used in the admin page
import * as nextNavigation from 'next/navigation'
try {
  // Some environments already define this; avoid redefining.
  ;(nextNavigation as unknown as { useRouter?: () => { push: () => void } }).useRouter = (nextNavigation as unknown as { useRouter?: () => { push: () => void } }).useRouter || (() => ({ push: () => {} }))
} catch (e) {
  // ignore; tests can still proceed without overriding
}

// jsdom doesn't implement matchMedia; some hooks use it (use-mobile)
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  // basic polyfill that supports addEventListener/removeEventListener and matches property
  window.matchMedia = (query: string) => {
    const mql: MediaQueryList = {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    } as unknown as MediaQueryList
    return mql
  }
}
