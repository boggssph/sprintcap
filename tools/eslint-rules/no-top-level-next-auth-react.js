// ESLint rule to disallow top-level `import ... from 'next-auth/react'` in app/ files.
// It allows dynamic `await import('next-auth/react')` or imports inside functions.
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow top-level imports from next-auth/react to avoid prerender-time initialization',
      recommended: 'error'
    },
    schema: []
  },
  create(context) {
    const filename = context.getFilename()
    if (!filename.includes('/app/') && !filename.includes('\\app\\')) return {}

    return {
      ImportDeclaration(node) {
        if (node.source && node.source.value === 'next-auth/react') {
          context.report({ node, message: "Do not import 'next-auth/react' at module top-level. Use dynamic import inside handlers (e.g. `const {{ signIn }} = await import('next-auth/react')`)." })
        }
      }
    }
  }
}
