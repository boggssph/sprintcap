// Lightweight ResizeObserver polyfill for jsdom tests that need it.
/* eslint-disable @typescript-eslint/no-explicit-any */
export default function installResizeObserver() {
  const g = globalThis as unknown as { ResizeObserver?: unknown }
  if (typeof g.ResizeObserver === 'undefined') {
    // Minimal polyfill
    (g as unknown as { ResizeObserver: any }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
}
