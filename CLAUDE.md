# AGENTS

This file consolidates guidance for AI agents working with this repository. Use the sections below for project information, agent-specific rules, and general guidelines to follow when making code changes.

## Project Overview

Beardify is a custom Spotify web client built with Vue 3 + TypeScript that enhances the official Spotify experience. The key innovation is the "Collections" feature - transforming regular playlists into album collections using the "#Collection" naming convention.

## Core Technologies

- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** (strict mode)
- **Vite 8** for build/dev server
- **Pinia** for state management with persistence
- **SCSS** with CSS custom properties for theming
- **ky v2** for HTTP requests (via `instance()` helper)
- **Spotify Web API + Web Playback SDK**

## Essential Commands

```bash
# Development
bun run dev           # Start dev server (port 3000)
bun run lint          # Run all linting (TypeScript + ESLint + Stylelint)
bun run fix           # Auto-fix all linting issues
bun run build         # Build for production (includes linting)
bun run preview       # Preview production build
```

**Always run `bun run lint` before committing changes.**

## General agent guidance

These guidelines apply to all AI agents working on this repository:

- Follow project conventions: Vue 3 Composition API, `<script setup>`, TypeScript strict mode, scoped styles, alphabetical import ordering, and Unix (LF) line endings.
- Always run `bun run lint` and fix reported issues before committing.
- Use the `instance()` helper from `src/api.ts` for all Spotify Web API calls (do not call `ky` directly). Exception: `discogs.ts` and external APIs use `ky` or `http` directly because they target non-Spotify endpoints.
- Use `notification()` helper for user-facing messages and errors.
- Use `sleep()` from `src/helpers/sleep.ts` for async delays — do not inline `new Promise(resolve => setTimeout(resolve, ms))`.
- Use `BEARDIFY_USER_AGENT` from `src/helpers/http.ts` as the User-Agent header for external API calls.
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
- Run `bun run lint` before committing
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

**Note**: Prettier has been removed from the project; formatting is now enforced via ESLint stylistic rules. Use `bun run fix` to auto-fix JS/TS/Vue and SCSS style issues.

### Stylelint Configuration

- **Extends**: `stylelint-config-standard-scss` + Vue/HTML support
- **Property ordering**: Alphabetical order enforced
- **Declaration order**: Custom properties first, then declarations
- **SCSS support**: Full SCSS syntax support with `stylelint-scss` plugin
- **Ignores**: `/public/` directory excluded

## Player Architecture

### Optimistic Updates

Player controls update state immediately before the API call completes, then revert on failure. This eliminates visual latency.

- `play()` / `pause()` / `next()`: set `playerState.paused` immediately
- `seek()`: set `currentlyPlaying.progress_ms` and `playerState.position` before `await`
- `toggleShuffle()` / `toggleRepeat()`: update state immediately, revert on API failure or `!ok`
- Volume: `DeviceVolume.vue` sets `volume_percent` optimistically; `setVolume()` sets `volumeLockUntil = Date.now() + VOLUME_LOCK_DURATION_MS` to block the external polling from overwriting the value while the API call is in-flight

### Loading Watchdog

`PlayerIndex.vue` watches `playerState.track_window.current_track.id`. If it stays null for 5 seconds while no device switch is in progress (`!isSettingDevice`), it calls `getExternalPlayerState()` to force-recover from stuck loading states (e.g. SDK stall after device switch).

### Device Heartbeat

`startDeviceHeartbeat()` runs every 4 minutes to keep the active device alive. It pings the SDK, checks the device list, and calls `setDevice()` if the active device disappears. Consecutive failures increment `heartbeatFailureCount`; after 3 failures it notifies the user and attempts reconnection (with a 5-minute cooldown on repeat notifications).

### Device Switching State Machine

`setDevice()` queues requests via `lastRequestedDeviceId` — if a switch is already in progress (`isSettingDevice = true`), the new target is stored and picked up by `_finalizeDeviceSwitch()` when the current switch completes. `_executeDeviceSwitch()` resets `playerState` to `defaultPlaybackState` while switching, then the loading watchdog recovers if the SDK never fires.

## Spotify Integration

### Authentication

- OAuth 2.0 with PKCE flow
- Token refresh every 30 minutes
- Persistent session with localStorage

### Collections System

The core feature: playlists with "#Collection" in the name are treated as album collections, providing functionality not available in the official Spotify client.

## Static Assets

Flag SVG files (`flag-icons` package) are served via:
- **Dev**: Vite middleware in `vite.config.ts` serves `/flags/*.svg` from `node_modules/flag-icons/flags/4x3/`
- **Prod**: `vite-plugin-static-copy` + explicit `cp` in `netlify.toml` build command copy files to `dist/flags/`

## Important Notes

- **Premium users only**: Spotify Web API restrictions
- **No test framework**: Linting serves as primary quality assurance
- **Modern browsers required**: ES modules, CSS custom properties, Widevine DRM
- **Error suppression**: Non-critical Spotify SDK errors are intentionally suppressed (see `main.ts:19`)
