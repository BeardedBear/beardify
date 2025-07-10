# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
npm run serve          # Start dev server (port 3000)
npm run lint          # Run all linting (TypeScript + ESLint + Prettier + Stylelint)
npm run fix           # Auto-fix all linting issues
npm run build         # Build for production (includes linting)
npm run preview       # Preview production build
```

**Always run `npm run lint` before committing changes.**

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
- BEM methodology for CSS class naming
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

### Prettier Configuration
- **Print width**: 120 characters
- **Semicolons**: Required
- **Arrow parens**: Always use parentheses
- **End of line**: LF (Unix)
- **HTML whitespace**: Ignore for Vue templates
- **Tab width**: 2 spaces (JSON/YAML files)

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

### Player Features
- Spotify Web Playback SDK integration
- Active device polling every 5 minutes
- Widevine DRM support detection for Brave browser
- Premium-only features (Spotify API limitation)

### Collections System
The core feature: playlists with "#Collection" in the name are treated as album collections, providing functionality not available in the official Spotify client.

## Important Notes

- **Premium users only**: Spotify Web API restrictions
- **No test framework**: Linting serves as primary quality assurance
- **Modern browsers required**: ES modules, CSS custom properties, Widevine DRM
- **Error suppression**: Non-critical Spotify SDK errors are intentionally suppressed (see `main.ts:19`)