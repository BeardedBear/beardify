# Copilot Instructions for Beardify

Beardify is a Vue 3 + TypeScript Spotify web client. The core innovation is **"Collections"** - album playlists created by adding "#Collection" to playlist names, enabling functionality not available in the official Spotify client.

## Essential Commands
```bash
npm run dev          # Start dev server (port 3000, auto-increments if busy)
npm run lint         # Run ALL linting: TypeScript + ESLint + Prettier + Stylelint
npm run fix          # Auto-fix all linting issues
npm run build        # Production build (includes linting validation)
```
**Always run `npm run lint` before commits - no test framework exists, linting is primary QA.**

## Tech Stack
Vue 3 (Composition API + `<script setup>`) • TypeScript (strict) • Vite • Pinia (with persistence) • SCSS • Spotify Web API + Web Playback SDK

## Architecture

### Directory Structure
```
src/
├── components/        # Feature-organized (album/, artist/, player/, etc.)
│   └── */Store.ts    # Component-level Pinia stores
├── views/            # Route-level components with corresponding Store.ts
├── helpers/          # Utility functions (play.ts, playlist.ts, notifications.ts)
├── @types/           # TypeScript types organized by feature
└── assets/scss/      # Global SCSS with theming system
```

### State Management (Pinia)
- **View-based stores**: `src/views/auth/AuthStore.ts`, `src/views/playlist/PlaylistStore.ts`
- **Component-based stores**: `src/components/player/PlayerStore.ts`, `src/components/config/ConfigStore.ts`
- **All stores use `pinia-plugin-persistedstate`** for automatic localStorage persistence
- **Store action pattern**:
```typescript
async followPodcast(podcastId: string) {
  try {
    await instance().put(`me/shows?ids=${podcastId}`);
    this.isFollowing = true;
    notification({ msg: "Success message", type: NotificationType.Success });
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error description:", error);
    notification({ msg: "Error message", type: NotificationType.Error });
  }
}
```

### API Layer (`src/api.ts`)
- **Use `instance()` for all Spotify API calls** - never use `ky` directly
- **Automatic token refresh** and error handling built-in
- **Method pattern**: `instance().get<ResponseType>(url)` with explicit typing
- **All Spotify scopes already configured** in `api.scopes`

Example:
```typescript
const { data } = await instance().get<Playlist>(`playlists/${id}`);
await instance().put(`playlists/${id}/followers`); // No body for follow actions
```

### Collections Feature Logic (CRITICAL)
The "#Collection" naming convention is **core business logic**:
```typescript
// Check if playlist is a collection
function isACollection(playlist: SimplifiedPlaylist): boolean {
  return playlist.name.toLowerCase().includes("#collection");
}

// Transform playlist to collection or vice versa
const newName = isCollection ? `#Collection ${name}` : name;

// Display name (strip the marker)
const displayName = playlist.name.replace("#Collection ", "");
```
**Examples**: `src/components/sidebar/SidebarStore.ts:15`, `src/components/dialog/DialogStore.ts:37`

## Code Conventions

### TypeScript
- **Explicit return types required** (ESLint warning enforced)
- **No `any`** (warning enforced, prefer proper typing)
- **Types in `src/@types/`** organized by feature (Album.ts, Playlist.ts, etc.)

### Vue Components
- **Always use `<script setup>` syntax**
- **Scoped styles required** for all components
- **Props pattern**: `defineProps<{ propName: Type }>()`
- **Alphabetical import sorting** (enforced by ESLint perfectionist plugin)

### Styling
- **CSS Custom Properties** (existing design tokens):
  - `--bg-color-*` (darker, dark, default, light, lighter)
  - `--font-color-*` (dark, default, light)
  - `--primary-color-*` (darker, dark, default, light, lighter)
- **BEM methodology** for CSS class naming
- **Stylelint**: Alphabetical property ordering enforced

### Formatting
- **Print width**: 120 characters
- **Semicolons required**
- **Unix line endings (LF)** - error level
- **Arrow parens**: Always use parentheses

## Spotify Integration

### Authentication (OAuth 2.0 PKCE)
- **Token refresh**: Every 30 minutes (handled in `AuthStore`)
- **Persistent session**: With localStorage via Pinia plugin
- **Environment variables**: `VITE_SPOTIFY_CLIENT_ID`, `VITE_REDIRECT_URI_DEV/PROD`
- **Premium users only**: Web API limitation, handle gracefully

### Web Playback SDK
- **Error suppression**: Non-critical SDK errors intentionally suppressed in `main.ts:15-45`
- **PlayLoad 404 errors**: Expected during playback transitions, completely silent
- **Device polling**: Every 5 minutes for active device detection
- **Widevine DRM**: Special handling for Brave browser compatibility

### API Request Patterns
- **Follow/Unfollow**: Use query params (`me/shows?ids=${id}`) **not request body**
- **PUT for following**: `instance().put(url)` without body
- **DELETE for unfollowing**: Query params in URL

## Development Gotchas

1. **No test framework exists** - linting is primary QA
2. **User feedback required**: Always use `notification()` helper for user-facing actions
3. **Console warnings allowed**: `console.error` for errors, `console.log` for debugging
4. **URL cleaning**: Use `cleanUrl()` helper from `src/helpers/urls.ts` for Spotify API URLs
5. **Premium-only features**: Gracefully degrade for non-premium limitations
6. **Modern browsers required**: ES modules, CSS custom properties, Widevine DRM

## Key Files to Reference
- `src/api.ts` - API instance and configuration
- `src/views/auth/AuthStore.ts` - OAuth flow and token management
- `src/components/sidebar/SidebarStore.ts` - Collections feature implementation
- `src/helpers/notifications.ts` - User notification pattern
- `eslint.config.js` - Linting rules and conventions
