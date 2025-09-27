#!/usr/bin/env node
// Simple source scanner that fails if a top-level `import ... from 'next-auth/react'`
// is found in any app/ client file. This helps prevent accidental prerender-time
// NextAuth initialization.
const fs = require('fs')
const path = require('path')

const root = process.cwd()
const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.next' || e.name === 'dist') continue
      walk(p)
    } else if (/\.(js|jsx|ts|tsx)$/.test(e.name)) {
      const src = fs.readFileSync(p, 'utf8')
      // naive check: top-level import statement (no leading spaces) or any import
      // that isn't inside an `await import(`
      const importRegex = /import\s+.*from\s+['"]next-auth\/react['"]/m
      const dynamicRegex = /await\s+import\(\s*['"]next-auth\/react['"]\s*\)/m
      if (importRegex.test(src) && !dynamicRegex.test(src)) {
        console.error(`Found top-level next-auth/react import in: ${p}`)
        process.exitCode = 2
      }
    }
  }
}

walk(path.join(root, 'app'))
if (process.exitCode) process.exit(process.exitCode)
