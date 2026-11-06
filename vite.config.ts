import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vitest/config'

// Peer dependencies and @mui/utils, including their subpaths such as
// react/jsx-runtime and react/compiler-runtime. Consumers install these, so
// none of them may end up in dist.
const external = /^(react|react-dom)($|\/)|^@mui\/|^@emotion\//

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    // Consumers' bundlers minify. Keeping this off leaves published code readable.
    minify: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
    rolldownOptions: {
      external,
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          setupFiles: ['src/test-setup.ts'],
        },
      },
      {
        test: {
          name: 'dist',
          include: ['tests/**/*.test.ts'],
          environment: 'node',
        },
      },
    ],
  },
})
