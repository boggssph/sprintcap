import '@testing-library/jest-dom'

// mock next/navigation's useRouter used in the admin page
import * as nextNavigation from 'next/navigation'
try {
  // Some environments already define this; avoid redefining.
  (nextNavigation as unknown as { useRouter?: () => { push: () => void } }).useRouter = (nextNavigation as unknown as { useRouter?: () => { push: () => void } }).useRouter || (() => ({ push: () => {} }))
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

// jsdom doesn't implement Pointer Events API; vaul drawer uses it
if (typeof window !== 'undefined' && typeof window.Element !== 'undefined') {
  const originalAddEventListener = window.Element.prototype.addEventListener
  window.Element.prototype.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    // Mock pointer events that vaul uses
    if (type.startsWith('pointer')) {
      // Don't add the listener to avoid vaul trying to use pointer events
      return
    }
    return originalAddEventListener.call(this, type, listener, options)
  }

  // Mock setPointerCapture method
  if (!window.Element.prototype.setPointerCapture) {
    window.Element.prototype.setPointerCapture = function() {
      // No-op implementation
    }
  }

  // Mock releasePointerCapture method
  if (!window.Element.prototype.releasePointerCapture) {
    window.Element.prototype.releasePointerCapture = function() {
      // No-op implementation
    }
  }
}

// jsdom doesn't implement ResizeObserver; cmdk uses it
if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'undefined') {
  window.ResizeObserver = class ResizeObserver {
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb
    }
    cb: ResizeObserverCallback
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// jsdom doesn't implement scrollIntoView; cmdk uses it
if (typeof window !== 'undefined' && typeof window.Element !== 'undefined') {
  if (!window.Element.prototype.scrollIntoView) {
    window.Element.prototype.scrollIntoView = function() {
      // No-op implementation
    }
  }
}
