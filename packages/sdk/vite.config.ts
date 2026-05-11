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
  iife: {
    entry: resolve(dirname, 'src/iife.ts'),
    formats: ['iife'] as const,
    name: 'Feedbakery',
    fileName: () => 'feedbakery.iife.js',
  },
  element: {
    entry: resolve(dirname, 'src/element.ts'),
    formats: ['es'] as const,
    fileName: () => 'element.mjs',
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
        output: {
          inlineDynamicImports: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: false,
      include: ['src/**/*.test.ts'],
    },
  }
})
