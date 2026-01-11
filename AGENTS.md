# AGENTS

This file consolidates guidance for AI agents working with this repository. Use the sections below for project information, agent-specific rules, and general guidelines to follow when making code changes.

## Project Overview

Beardify is a custom Spotify web client built with Vue 3 + TypeScript that enhances the official Spotify experience. The key innovation is the "Collections" feature - transforming regular playlists into album collections using the "#Collection" naming convention.

## Core Technologies

- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** (strict mode)
- **Vite** for build/dev server
- **Pinia** for state management with persistence
- **SCSS** with CSS custom properties for theming
- **Spotify Web API + Web Playback SDK**

## Essential Commands

```bash
# Development
npm run dev           # Start dev server (port 3000)
npm run lint          # Run all linting (TypeScript + ESLint + Stylelint)
npm run fix           # Auto-fix all linting issues
npm run build         # Build for production (includes linting)
npm run preview       # Preview production build
```

**Always run `npm run lint` before committing changes.**

## General agent guidance

These guidelines apply to all AI agents working on this repository:

- Follow project conventions: Vue 3 Composition API, `<script setup>`, TypeScript strict mode, scoped styles, alphabetical import ordering, and Unix (LF) line endings.
- Always run `npm run lint` and fix reported issues before committing.
- Use the `instance()` helper from `src/api.ts` for all Spotify Web API calls (do not call `ky` directly).
- Use `notification()` helper for user-facing messages and errors.
- The `#Collection` naming convention is core business logic. Do not change Collection-related behavior without explicit approval from the maintainers.
- Do not commit secrets, credentials, or environment variables into the repository.
- Follow the commit message format in "Commit message formatting (Conventional Commits)" below.
- Keep changes small and focused; prefer creating a pull request rather than pushing large, sweeping changes directly.
- When unsure, open an issue or ask a maintainer for clarification.

## Commit message formatting (Conventional Commits)

We follow the Conventional Commits specification. Use the header format:
`<type>(<scope>): <short summary>`

Rules:
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`, `revert`
- Scope: optional but recommended (e.g. `player`, `auth`, `playlist`, `collection`, `api`, `styles`)
- Summary: imperative mood, concise (<=50 chars), no trailing period
- Body (optional): explain the "what" and "why" (not "how"); wrap lines at ~72 chars; leave one blank line between header and body
- Footer: reference issues (e.g. `Closes #123`) or breaking changes using `BREAKING CHANGE: description`

Examples:
- `feat(collection): add #Collection marker when creating playlists`
- `fix(api): handle 429 rate limits on playback requests`
- `docs: update README with dev commands`
- `chore(deps): bump pinia to 2.0.0`

Best practices:
- Run `npm run lint` before committing
- Prefer "Squash and merge" for pull requests to keep history clean; use the PR title (following the spec) as the commit message when squashing
- When introducing breaking changes, add `BREAKING CHANGE: ...` in the footer and describe the impact

## Architecture

### Directory Structure

- `src/components/` - Feature-organized Vue components (album/, artist/, player/, etc.)
- `src/views/` - Route-level components, each with corresponding Pinia store
- `src/helpers/` - Utility functions
- `src/@types/` - TypeScript type definitions
- `src/assets/scss/` - Global SCSS with theming system

### State Management (Pinia)

Each feature has its own store: `AuthStore`, `PlayerStore`, `PlaylistStore`, `SearchStore`, `ConfigStore`. All stores use `pinia-plugin-persistedstate` for persistence.

### Styling System

Uses CSS custom properties with consistent naming:

- `--bg-color-*` (darker, dark, default, light, lighter)
- `--font-color-*` (dark, default, light)
- `--primary-color-*` (darker, dark, default, light, lighter)

## Code Conventions

- Use Vue 3 Composition API with `<script setup>` syntax
- TypeScript strict mode with explicit return types
- Scoped styles for all Vue components
- Simple kebab-case naming for CSS classes (e.g., `player-button`, `track-icon`, `section-title`)
- Alphabetical import sorting (enforced by ESLint perfectionist plugin)
- Unix line endings (LF)

### ESLint Configuration

- **Explicit function return types**: Warning enforced
- **No explicit any**: Warning (prefer proper typing)
- **No unused variables**: Warning
- **Unix line endings**: Error (LF required)
- **Console/debugger**: Warnings allowed
- **Perfectionist plugin**: Alphabetical ordering for imports/exports
- **Vue files**: Currently ignored for parsing (TypeScript handled separately)

### Formatting (ESLint stylistic rules)

- **Enforced by**: ESLint (stylistic rules) — see `eslint.config.js`
- **Print width**: 120 characters (`max-len`)
- **Semicolons**: Required (`semi`)
- **Arrow parens**: Always use parentheses (`arrow-parens`)
- **End of line**: LF (Unix) (`linebreak-style`)
- **HTML whitespace**: Ignored in Vue templates (template whitespace rules are deliberately permissive)
- **Tab width**: 2 spaces (enforced via `indent`; JSON/YAML files maintain 2 spaces)

**Note**: Prettier has been removed from the project; formatting is now enforced via ESLint stylistic rules. Use `npm run fix` to auto-fix JS/TS/Vue and SCSS style issues.

### Stylelint Configuration

- **Extends**: `stylelint-config-standard-scss` + Vue/HTML support
- **Property ordering**: Alphabetical order enforced
- **Declaration order**: Custom properties first, then declarations
- **SCSS support**: Full SCSS syntax support with `stylelint-scss` plugin
- **Ignores**: `/public/` directory excluded

## Spotify Integration

### Authentication

- OAuth 2.0 with PKCE flow
- Token refresh every 30 minutes
- Persistent session with localStorage

### Collections System

The core feature: playlists with "#Collection" in the name are treated as album collections, providing functionality not available in the official Spotify client.

## Important Notes

- **Premium users only**: Spotify Web API restrictions
- **No test framework**: Linting serves as primary quality assurance
- **Modern browsers required**: ES modules, CSS custom properties, Widevine DRM
- **Error suppression**: Non-critical Spotify SDK errors are intentionally suppressed (see `main.ts:19`)
