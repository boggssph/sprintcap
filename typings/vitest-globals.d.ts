// Ambient declarations for vitest globals so TypeScript typecheck passes in CI
declare global {
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void): void;
  function test(name: string, fn: () => void): void;
  function beforeAll(fn: () => any | Promise<any>): void;
  function afterAll(fn: () => any | Promise<any>): void;
  function beforeEach(fn: () => any | Promise<any>): void;
  function afterEach(fn: () => any | Promise<any>): void;
  function expect(actual: any): any;

  // Minimal vi mock used by tests
  const vi: {
    clearAllMocks: () => void;
    spyOn?: (...args: any[]) => any;
    fn?: (...args: any[]) => any;
  };
}
export {};
