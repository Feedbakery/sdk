import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const dirname = new URL('.', import.meta.url).pathname

const entries = {
  esm: {
    entry: resolve(dirname, 'src/index.ts'),
    formats: ['es'] as const,
    fileName: () => 'index.mjs',
  },
  cjs: {
    entry: resolve(dirname, 'src/index.ts'),
    formats: ['cjs'] as const,
    fileName: () => 'index.cjs',
  },
} as const

type Mode = keyof typeof entries

export default defineConfig(({ mode }) => {
  const m = (mode ?? 'esm') as Mode
  const config = entries[m] ?? entries.esm

  return {
    build: {
      emptyOutDir: m === 'esm',
      lib: config,
      minify: 'esbuild',
      target: 'es2020',
      sourcemap: true,
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', '@feedbakery/sdk'],
      },
    },
    test: {
      environment: 'jsdom',
      globals: false,
      include: ['src/**/*.test.{ts,tsx}'],
    },
  }
})
