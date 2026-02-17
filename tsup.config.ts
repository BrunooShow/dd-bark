export default {
  entry: ['src/cli.ts'],
  format: ['esm'],
  outDir: 'build',
  banner: { js: '#!/usr/bin/env node' },
}
