# Copilot Instructions for Beardify

## Project Overview
Beardify is a Vue 3 + TypeScript Spotify web client that enhances the official experience. The core innovation is **"Collections"** - album playlists created by adding "#Collection" to playlist names, enabling functionality not available in the official Spotify client.

## Essential Commands
```bash
npm run dev          # Start dev server (auto-detects port, usually 3000)
npm run lint         # Critical: Run ALL linting (TypeScript + ESLint + Prettier + Stylelint)
npm run fix          # Auto-fix all linting issues
npm run build        # Production build (includes linting validation)
npm run preview      # Preview production build
```
**Always run `npm run lint` before commits - no test framework exists, linting is primary QA.**

## Core Technologies

- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** (strict mode)
- **Vite** for build/dev server
- **Pinia** for state management with persistence
- **SCSS** with CSS custom properties for theming
- **Spotify Web API + Web Playback SDK**

## Architecture Patterns

### Directory Structure
- `src/components/` - Feature-organized Vue components (album/, artist/, player/, etc.)
- `src/views/` - Route-level components, each with corresponding Pinia store
- `src/helpers/` - Utility functions
- `src/@types/` - TypeScript type definitions
- `src/assets/scss/` - Global SCSS with theming system

### State Management (Pinia)
- **Feature-based stores**: Each major section has its own store (`AuthStore`, `PodcastsStore`, `PlaylistStore`, `PlayerStore`, `SearchStore`, `ConfigStore`)
- **Persistent state**: All stores use `pinia-plugin-persistedstate` for automatic localStorage persistence
- **Store pattern**: `defineStore("name", { actions: {...}, state: () => ({...}) })`

Example store action pattern:
```typescript
async followPodcast(podcastId: string) {
  try {
    await instance().put(`me/shows?ids=${podcastId}`);
    this.isFollowing = true;
    notification({ msg: "Success message", type: NotificationType.Success });
  } catch (error) {
    console.error("Error description:", error);
    notification({ msg: "Error message", type: NotificationType.Error });
  }
}
```

### Component Structure
- **Feature organization**: `src/components/album/`, `src/components/artist/`, etc.
- **Route-level components**: `src/views/` with corresponding Pinia stores
- **Composition API**: Always use `<script setup>` syntax with TypeScript
- **Props pattern**: `defineProps<{ propName: Type }>()` with explicit typing

### API Layer (`src/api.ts`)
- **Centralized instance**: Use `instance()` for all Spotify API calls
- **Automatic auth**: Token refresh and error handling built-in
- **Method pattern**: `instance().get<ResponseType>(url)` with explicit response typing
- **Scopes**: All required Spotify permissions already configured

## Critical Conventions

### Code Conventions
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

### TypeScript
- **Strict mode**: Explicit return types required (ESLint enforced)
- **Type definitions**: All types in `src/@types/` organized by feature
- **No `any`**: ESLint warning enforced, prefer proper typing

### Styling System
- **CSS Custom Properties**: Use existing design tokens
  - `--bg-color-*` (darker, dark, default, light, lighter)
  - `--font-color-*` (dark, default, light)
  - `--primary-color-*` (darker, dark, default, light, lighter)
- **Scoped styles**: Required for all Vue components
- **BEM methodology**: For CSS class naming

### Collections Feature Logic
The "#Collection" convention is core business logic:
```typescript
// Check if playlist is a collection
const isCollection = playlist.name.includes("#Collection");
// Transform playlist to collection or vice versa
const newName = isCollection ? name.replace("#Collection", "") : `${name} #Collection`;
```

## Spotify Integration Specifics

### Authentication Flow
- **OAuth 2.0 PKCE**: Implemented in `AuthStore` with token refresh
- **Token refresh**: Every 30 minutes
- **Persistent session**: With localStorage
- **Premium required**: Web API limitations, handle gracefully
- **Environment variables**: `VITE_SPOTIFY_CLIENT_ID`, `VITE_REDIRECT_URI_DEV/PROD`

### Player Features
- Spotify Web Playbook SDK integration
- Active device polling every 5 minutes
- Widevine DRM support detection for Brave browser
- Premium-only features (Spotify API limitation)

### Web Playback SDK
- **Device detection**: Active device polling every 5 minutes
- **Widevine DRM**: Special handling for Brave browser compatibility
- **Error suppression**: Non-critical SDK errors intentionally suppressed (see `main.ts:19`)

## Development Gotchas

### API Request Patterns
- **Follow/Unfollow**: Use query params (`me/shows?ids=${id}`) not request body
- **PUT requests**: For following, use `instance().put(url)` without body
- **DELETE requests**: For unfollowing, use query params in URL

### Build System (Vite)
- **Port detection**: Dev server auto-increments if 3000 is busy
- **ES Modules**: Modern browser target, no legacy support needed
- **Source maps**: Enabled for CSS in development

### Error Handling
- **User notifications**: Always provide user feedback via `notification()` helper
- **Console logging**: Allowed for debugging, use `console.error` for errors
- **Graceful degradation**: Handle Spotify API limitations (premium-only features)

## Important Notes

- **Premium users only**: Spotify Web API restrictions
- **No test framework**: Linting serves as primary quality assurance
- **Modern browsers required**: ES modules, CSS custom properties, Widevine DRM
- **Error suppression**: Non-critical Spotify SDK errors are intentionally suppressed (see `main.ts:19`)

When working on this codebase, prioritize the Collections feature logic and ensure all Spotify API interactions follow the established patterns for authentication and error handling.
