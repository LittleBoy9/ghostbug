import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: true,
    treeshake: true,
    target: 'es2020',
    outDir: 'dist',
    splitting: false,
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'ghostbug',
    outDir: 'dist',
    minify: true,
    sourcemap: true,
    target: 'es2020',
    outExtension: () => ({ js: '.iife.js' }),
  },
]);
