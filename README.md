# Beardify

## Features

- **Collections** — turn playlists into album collections via the `#Collection` naming convention
- Easier and faster search (albums, artists, songs, podcasts) with a compact, distraction-free layout
- UI more compact than the official client
- Rich artist view: related artists, discography, members timeline, Wikipedia bio/timeline, concerts, external links
- New releases feed for followed artists
- Genre browsing
- Podcast support
- Multi-device playback control with live queue view
- Playback history
- Sharing (Spotify and Beardify links)
- Light/dark themes with multiple color schemes
- Desktop app (Tauri) with auto-update

## Roadmap

- [x] Add songs to song playlists
- [x] Sharing
- [x] Integrate my other client to check the new album releases

## Collections

Beardify is a Spotify web client that fixes one of the biggest issues for me: the possibility to create **album playlists** (called "Collections" in Beardify) in addition to **song playlists**.

<img src="https://github.com/BeardedBear/beardify/blob/master/public/img/readme/collection.png" />

## Artist vue

Beardify also adds other features that I feel are missing, like **artist related links**, and a **more readable view of their discography** than the current official client.

<img src="https://github.com/BeardedBear/beardify/blob/master/public/img/readme/artist.png" />

## Search

In the official client, the search returns information that doesn't interest me, so I made sure to keep only the essential, in a compact view

<img src="https://github.com/BeardedBear/beardify/blob/master/public/img/readme/search.png" />

## The trick

The trick is to base it on the user's playlists, and check if the keyword "#Collection" exists in the name, and if it does, it becomes a collection. The advantage is that we can transform on the fly existing playlists of songs into a collection and vice versa, and that I do not break the current organization of users, since they are only "classic" playlists.

## Technical restrictions:

Spotify's web API doesn't expose folder management, so I can't manage them on my end, so the playlist is flat.

Spotify web API does not allow non-premium users

## Dev

```bash
bun install           # install dependencies
bun run dev           # web dev server (port 3000)
bun run tauri:dev     # desktop app with hot-reload
bun run lint          # TypeScript + ESLint + Stylelint
bun run fix           # auto-fix lint issues
bun run build         # production web build (runs lint first)
bun run tauri:build   # production desktop build
bunx netlify functions:serve # serve Netlify functions locally (testing share)
```

## Releasing a new version

Releases are automated via GitHub Actions. The workflow triggers on version tags and produces a signed Windows installer + `latest.json` for the in-app updater.

### Prerequisites

Two secrets must be set in the GitHub repository settings:

| Secret | Description |
|---|---|
| `TAURI_SIGNING_PRIVATE_KEY` | Minisign private key used to sign update artifacts |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Password for the private key (leave empty if none) |

To generate a keypair: `bun run tauri signer generate -- -w tauri.key`

### Create a release

```bash
bun run scripts/release.ts patch   # 0.1.2 → 0.1.3
bun run scripts/release.ts minor   # 0.1.2 → 0.2.0
bun run scripts/release.ts major   # 0.1.2 → 1.0.0
bun run scripts/release.ts 1.2.3   # explicit version
```

The script bumps the version in `package.json` and `src-tauri/tauri.conf.json`, commits, tags, and pushes — which triggers the GitHub Actions release workflow. The workflow builds the app, signs the artifacts, and publishes a GitHub Release with a `latest.json` manifest.

### In-app updater

On startup (5-second delay), the desktop app checks:

```
https://github.com/BeardedBear/beardify/releases/latest/download/latest.json
```

If a newer version is available, a toast appears in the bottom-right corner. The update is cryptographically verified before installation. The updater only runs inside the Tauri desktop app, not in the browser.
