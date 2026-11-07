# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is a React component library built on Material UI, to be published to npm. The scaffolding, default theme, `CmThemeProvider` and Button are in place. The next item is Button group, which needs a spec first. See `docs/specs/roadmap.md`.

The package is named `@cmotino/cm-web-components`. Releases to npm go through the Changesets workflow in `.github/workflows/release.yml`.

## Specifications

Work in this repo is spec-driven. Specs live in `docs/specs/`; start with `docs/specs/README.md`.

- `docs/specs/0000-architecture.md` holds library-wide decisions. Follow it for all library work.
- Only build a component from an `Accepted` spec, in the order set by `docs/specs/roadmap.md`.
- Update a component's spec before changing its public API.

## Commands

Use the Node version in `.nvmrc` (`nvm use`). Vitest, jsdom, jest-dom and Changesets don't run on Node 20.

- `npm run dev`: start Storybook on port 6006
- `npm run build`: type-check, bundle to `dist/`, then emit declarations
- `npm run build-storybook`: build the static Storybook site
- `npm run lint`: run ESLint on `.ts` and `.tsx` files
- `npm run typecheck`: type-check only
- `npm test`: run unit tests once
- `npx vitest run --project unit src/theme/createCmTheme.test.ts`: run one test file
- `npm run test:watch`: run unit tests in watch mode
- `npm run test:dist`: check the built output in `dist/`, so build first
- `npm run changeset`: add a changelog entry, which every user-facing pull request needs

Storybook doesn't type-check. Plain `npx tsc` checks nothing because the root `tsconfig.json` has `"files": []` and only references the other two configs.

## Architecture

- **Public API:** `src/index.ts` is the only entry point. Anything it doesn't export is private.
- **Build:** `vite.config.ts` builds ES modules with `preserveModules`, leaving peer dependencies and `@mui/*` external. The same file configures Vitest, with a `unit` project for `src/` and a `dist` project for `tests/`.
- **TypeScript projects:** `tsconfig.app.json` covers `src/` and `.storybook/` (browser code), and `tsconfig.node.json` covers `vite.config.ts` and `tests/` (Node code). `tsconfig.build.json` only emits declarations for the published code, so it's run by `npm run build` and isn't a project reference.
- **React Compiler:** it runs through the Babel plugin in `vite.config.ts`, so memoization is handled automatically. Don't add `useMemo`, `useCallback`, or `memo` by default. The README notes that this slows dev and build.
- **Styling:** Emotion through MUI, with no global CSS. Colors, spacing and radii come from the theme, as described in section 3 of the architecture spec. The default theme's tokens are ported from `references/theme/themePrimitives.ts`, so every new component's default look is built from them. That file is reference material only: it isn't built, type-checked or linted.
- **Server Components:** a module that uses hooks or browser APIs starts with `'use client'`. Add new ones to `tests/dist.test.ts`.

## Compiler and lint constraints

These settings can fail a build or lint run:

- `verbatimModuleSyntax`: type-only imports must use `import type`.
- `erasableSyntaxOnly`: no `enum`, `namespace`, or constructor parameter properties.
- `noUnusedLocals` and `noUnusedParameters`: unused code is a type error.
- `eslint-plugin-react-refresh`: component files should export only components, so Fast Refresh can preserve state.

Local imports in `src/` include the file extension, as in `import { createCmTheme } from './createCmTheme.ts'`. `allowImportingTsExtensions` permits this.
