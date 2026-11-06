# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is an unmodified Vite + React + TypeScript template. `src/App.tsx` and `src/App.css` still contain the starter page, so don't treat their contents as established project conventions. There is no component library structure yet.

## Commands

- `npm run dev`: start the Vite dev server with HMR
- `npm run build`: type-check with `tsc -b`, then bundle to `dist/`
- `npm run lint`: run ESLint on `.ts` and `.tsx` files
- `npm run preview`: serve the production build locally
- `npx tsc -b`: type-check only

No test runner is configured, so there is no test command yet.

`vite dev` does not type-check. Use `npx tsc -b` to check types; plain `npx tsc` checks nothing because the root `tsconfig.json` has `"files": []` and only references the other two configs.

## Architecture

- **Entry flow:** `index.html` loads `src/main.tsx`, which mounts `App` into `#root` inside `StrictMode`.
- **TypeScript projects:** `tsconfig.app.json` covers `src/` (browser code), and `tsconfig.node.json` covers `vite.config.ts` (Node code).
- **React Compiler:** it runs through the Babel plugin in `vite.config.ts`, so memoization is handled automatically. Don't add `useMemo`, `useCallback`, or `memo` by default. The README notes that this slows dev and build.
- **Styling:** `src/index.css` defines global design tokens as CSS custom properties on `:root` and overrides them for dark mode with `prefers-color-scheme`. Use these tokens rather than hard-coded colors.
- **Assets:** files in `src/assets/` are imported from code. Files in `public/` are served from the root URL, such as the SVG sprite used as `<use href="/icons.svg#github-icon">`.

## Compiler and lint constraints

These settings can fail a build or lint run:

- `verbatimModuleSyntax`: type-only imports must use `import type`.
- `erasableSyntaxOnly`: no `enum`, `namespace`, or constructor parameter properties.
- `noUnusedLocals` and `noUnusedParameters`: unused code is a type error.
- `eslint-plugin-react-refresh`: component files should export only components, so Fast Refresh can preserve state.

Local imports in `src/` include the file extension, as in `import App from './App.tsx'`. `allowImportingTsExtensions` permits this.
