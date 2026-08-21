# Graph Report - .  (2026-08-21)

## Corpus Check
- 290 files · ~166,129 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1043 nodes · 1966 edges · 100 communities (95 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.83)
- Token cost: 117,657 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Album & Artist Pages|Album & Artist Pages]]
- [[_COMMUNITY_Collections & Dialogs|Collections & Dialogs]]
- [[_COMMUNITY_Devices & Queue UI|Devices & Queue UI]]
- [[_COMMUNITY_Band Members & Wikidata|Band Members & Wikidata]]
- [[_COMMUNITY_Windows Thumbar (Rust)|Windows Thumbar (Rust)]]
- [[_COMMUNITY_Project Architecture Docs|Project Architecture Docs]]
- [[_COMMUNITY_Desktop Auto-Updater|Desktop Auto-Updater]]
- [[_COMMUNITY_Dev Dependencies & Linting|Dev Dependencies & Linting]]
- [[_COMMUNITY_Genre Browsing & Library|Genre Browsing & Library]]
- [[_COMMUNITY_Tauri App Config|Tauri App Config]]
- [[_COMMUNITY_Artist Store & MusicBrainz|Artist Store & MusicBrainz]]
- [[_COMMUNITY_Scroll Restore & Podcasts|Scroll Restore & Podcasts]]
- [[_COMMUNITY_Spotify Domain Types|Spotify Domain Types]]
- [[_COMMUNITY_Collection Detection & Paging|Collection Detection & Paging]]
- [[_COMMUNITY_Discogs Client|Discogs Client]]
- [[_COMMUNITY_Album & Playback Types|Album & Playback Types]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_TypeScript App Config|TypeScript App Config]]
- [[_COMMUNITY_Wikipedia Timeline Parser|Wikipedia Timeline Parser]]
- [[_COMMUNITY_UI Screenshots & Layout|UI Screenshots & Layout]]
- [[_COMMUNITY_Spotify Playback SDK Types|Spotify Playback SDK Types]]
- [[_COMMUNITY_Store Default Values|Store Default Values]]
- [[_COMMUNITY_Route-Level Views & Tier Lists|Route-Level Views & Tier Lists]]
- [[_COMMUNITY_Album Variant Grouping|Album Variant Grouping]]
- [[_COMMUNITY_Search UI|Search UI]]
- [[_COMMUNITY_Auth & API Client|Auth & API Client]]
- [[_COMMUNITY_Tauri Desktop Bridge|Tauri Desktop Bridge]]
- [[_COMMUNITY_Build & Release Scripts|Build & Release Scripts]]
- [[_COMMUNITY_App Bootstrap & Theming|App Bootstrap & Theming]]
- [[_COMMUNITY_Tooltip Positioning|Tooltip Positioning]]
- [[_COMMUNITY_External Artist Resolution|External Artist Resolution]]
- [[_COMMUNITY_Auth Store & HTTP Retry|Auth Store & HTTP Retry]]
- [[_COMMUNITY_Release Type Heuristics|Release Type Heuristics]]
- [[_COMMUNITY_Theme & Color Schemes|Theme & Color Schemes]]
- [[_COMMUNITY_Root State Types|Root State Types]]
- [[_COMMUNITY_Spotify Search Store|Spotify Search Store]]
- [[_COMMUNITY_Release Popover|Release Popover]]
- [[_COMMUNITY_Version Bump Script|Version Bump Script]]
- [[_COMMUNITY_Node TS Config|Node TS Config]]
- [[_COMMUNITY_Last.fm Client|Last.fm Client]]
- [[_COMMUNITY_Release Packaging Script|Release Packaging Script]]
- [[_COMMUNITY_Scripts TS Config|Scripts TS Config]]
- [[_COMMUNITY_Social Link Detection|Social Link Detection]]
- [[_COMMUNITY_Stylelint Config|Stylelint Config]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Misc Utilities|Misc Utilities]]
- [[_COMMUNITY_Tauri Capabilities|Tauri Capabilities]]
- [[_COMMUNITY_Member Popover & Timeline|Member Popover & Timeline]]
- [[_COMMUNITY_Player Track Metadata|Player Track Metadata]]
- [[_COMMUNITY_Vite Build Config|Vite Build Config]]
- [[_COMMUNITY_Artist Profile Header|Artist Profile Header]]
- [[_COMMUNITY_Code of Conduct|Code of Conduct]]
- [[_COMMUNITY_Vite Env Types|Vite Env Types]]

## God Nodes (most connected - your core abstractions)
1. `instance()` - 29 edges
2. `notification()` - 29 edges
3. `usePlayer` - 25 edges
4. `Image` - 23 edges
5. `AlbumSimplified` - 20 edges
6. `ExternalUrls` - 20 edges
7. `NotificationType` - 19 edges
8. `Track` - 18 edges
9. `Artist` - 17 edges
10. `compilerOptions` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Inline App Shell Loader` --semantically_similar_to--> `Native CSS Theming System`  [INFERRED] [semantically similar]
  index.html → CLAUDE.md
- `Flag SVG Asset Pipeline` --semantically_similar_to--> `Beardify Icon Font`  [INFERRED] [semantically similar]
  CLAUDE.md → public/icons/demo.html
- `Flag SVG Asset Pipeline` --conceptually_related_to--> `GitHub Actions Release Workflow`  [INFERRED]
  CLAUDE.md → .github/workflows/release.yml
- `Spotify Web Playback SDK Script Tag` --references--> `Beardify Icon Font`  [AMBIGUOUS]
  index.html → public/icons/demo.html
- `Beardify Icon Font` --conceptually_related_to--> `Social Sharing Meta Tags`  [AMBIGUOUS]
  public/icons/demo.html → index.html

## Import Cycles
- 1-file cycle: `src-tauri/src/thumbar.rs -> src-tauri/src/thumbar.rs`
- 3-file cycle: `src/router.ts -> src/views/auth/AuthPage.vue -> src/views/auth/AuthStore.ts -> src/router.ts`
- 3-file cycle: `src/router.ts -> src/views/releases/ReleaseListPage.vue -> src/views/auth/AuthStore.ts -> src/router.ts`
- 3-file cycle: `src/router.ts -> src/views/LoginPage.vue -> src/views/auth/AuthStore.ts -> src/router.ts`
- 3-file cycle: `src/components/player/PlayerStore.ts -> src/spotify.ts -> src/views/auth/AuthStore.ts -> src/components/player/PlayerStore.ts`
- 3-file cycle: `src/components/artist/ArtistList.vue -> src/router.ts -> src/views/album/AlbumPage.vue -> src/components/artist/ArtistList.vue`
- 3-file cycle: `src/components/dialog/DialogStore.ts -> src/router.ts -> src/views/album/AlbumPage.vue -> src/components/dialog/DialogStore.ts`
- 4-file cycle: `src/components/dialog/DialogStore.ts -> src/views/playlist/PlaylistStore.ts -> src/router.ts -> src/views/album/AlbumPage.vue -> src/components/dialog/DialogStore.ts`
- 4-file cycle: `src/router.ts -> src/views/releases/ReleaseListPage.vue -> src/views/releases/ReleasesStore.ts -> src/views/auth/AuthStore.ts -> src/router.ts`
- 4-file cycle: `src/components/dialog/DialogStore.ts -> src/components/sidebar/SidebarStore.ts -> src/router.ts -> src/views/album/AlbumPage.vue -> src/components/dialog/DialogStore.ts`
- 4-file cycle: `src/components/artist/ArtistList.vue -> src/components/dialog/DialogStore.ts -> src/router.ts -> src/views/album/AlbumPage.vue -> src/components/artist/ArtistList.vue`
- 5-file cycle: `src/components/dialog/DialogStore.ts -> src/views/playlist/PlaylistStore.ts -> src/components/sidebar/SidebarStore.ts -> src/router.ts -> src/views/album/AlbumPage.vue -> src/components/dialog/DialogStore.ts`
- 5-file cycle: `src/components/artist/ArtistList.vue -> src/components/dialog/DialogStore.ts -> src/views/playlist/PlaylistStore.ts -> src/router.ts -> src/views/album/AlbumPage.vue -> src/components/artist/ArtistList.vue`
- 5-file cycle: `src/components/dialog/DialogStore.ts -> src/components/sidebar/SidebarStore.ts -> src/views/auth/AuthStore.ts -> src/router.ts -> src/views/album/AlbumPage.vue -> src/components/dialog/DialogStore.ts`
- 5-file cycle: `src/components/artist/ArtistList.vue -> src/components/dialog/DialogStore.ts -> src/components/sidebar/SidebarStore.ts -> src/router.ts -> src/views/album/AlbumPage.vue -> src/components/artist/ArtistList.vue`
- 5-file cycle: `src/components/player/PlayerStore.ts -> src/spotify.ts -> src/views/auth/AuthStore.ts -> src/router.ts -> src/views/album/AlbumPage.vue -> src/components/player/PlayerStore.ts`

## Hyperedges (group relationships)
- **Player Resilience Stack (optimistic UI + recovery)** — claude_optimistic_updates, claude_volume_lock, claude_loading_watchdog, claude_device_heartbeat, claude_device_switch_state_machine [INFERRED 0.85]
- **Signed Desktop Release & Update Pipeline** — readme_release_script, workflows_release_release_workflow, workflows_release_signing_secrets, workflows_release_package_release_script, readme_in_app_updater, src_tauri_readme_desktop_wrapper [EXTRACTED 1.00]
- **Preprocessor-Free Styling Conventions** — claude_styling_system, claude_font_utility_classes, claude_custom_media_breakpoints, claude_lint_pipeline [INFERRED 0.85]
- **Persistent App Shell across all views** — readme_shared_topbar, readme_shared_sidebar, readme_shared_playerbar, readme_artist_screenshot, readme_collection_screenshot, readme_search_screenshot [EXTRACTED 1.00]
- **Discovery flow: search an artist, open the artist page, add albums to a #Collection** — readme_search_modaloverlay, readme_search_threecolumnresults, readme_artist_discographysections, readme_shared_collectionsfeature, readme_collection_albumgrid [INFERRED 0.85]
- **Shared album-card visual pattern reused across artist, collection and search grids** — readme_shared_albumcard, readme_artist_discographysections, readme_collection_albumgrid, readme_search_threecolumnresults [INFERRED 0.95]

## Communities (100 total, 5 thin omitted)

### Community 0 - "Album & Artist Pages"
Cohesion: 0.06
Nodes (51): albumStore, currentTrack, dialogStore, { onScroll, restoreScroll }, playerStore, props, route, useAlbum (+43 more)

### Community 1 - "Collections & Dialogs"
Cohesion: 0.05
Nodes (37): CollectionRanking, collectionName, dialogStore, sidebarStore, dialogStore, playlistName, sidebarStore, dialogStore (+29 more)

### Community 2 - "Devices & Queue UI"
Cohesion: 0.06
Nodes (29): deviceListFiltered, isMobile, nameCounts, playerStore, { width }, normalizedType, currentTrack, isPlayingPodcast (+21 more)

### Community 3 - "Band Members & Wikidata"
Cohesion: 0.08
Nodes (31): combine(), mergeBandMembers(), normalizeName(), cleanWikipediaHtml(), EXCLUDED_WIKIPEDIA_SECTION_PATTERNS, EXCLUDED_WIKIPEDIA_SECTIONS, fetchWikidataEntities(), getClaimEntityIds() (+23 more)

### Community 4 - "Windows Thumbar (Rust)"
Cohesion: 0.11
Nodes (35): HFONT, HICON, HWND, LPARAM, LRESULT, Option, Send, AppHandle (+27 more)

### Community 5 - "Project Architecture Docs"
Cohesion: 0.07
Nodes (35): GitHub Sponsors Funding (BeardedBear), instance() API Helper, Beardify (Vue 3 Spotify Client), Collections System (#Collection convention), Conventional Commits Policy, Custom Media Breakpoints, Device Heartbeat, Device Switching State Machine (+27 more)

### Community 6 - "Desktop Auto-Updater"
Cohesion: 0.07
Nodes (22): checkForUpdate(), devSimulateUpdate(), dismissed, downloadAndInstall(), DownloadEvent, downloadProgress, errorMessage, status (+14 more)

### Community 7 - "Dev Dependencies & Linting"
Cohesion: 0.06
Nodes (32): devDependencies, @csstools/postcss-global-data, eslint, @eslint/js, eslint-plugin-perfectionist, eslint-plugin-vue, globals, netlify-cli (+24 more)

### Community 8 - "Genre Browsing & Library"
Cohesion: 0.13
Nodes (22): fetchPages(), GenreArtist, GenrePageState, getArtistsFromSpotifyGenreSearch(), sortByPopularity(), useGenre, isInLibrary(), LibraryItemType (+14 more)

### Community 9 - "Tauri App Config"
Cohesion: 0.07
Nodes (27): app, security, build, beforeBuildCommand, beforeDevCommand, devUrl, frontendDist, bundle (+19 more)

### Community 10 - "Artist Store & MusicBrainz"
Cohesion: 0.11
Nodes (23): discographyCache, navigationController, ReleaseLookupMaps, buildBaseTitleMap(), buildReleaseTypeMap(), extractBandMembers(), extractExternalIds(), fetchFromMusicBrainz() (+15 more)

### Community 11 - "Scroll Restore & Podcasts"
Cohesion: 0.11
Nodes (15): useScrollRestore(), useCheckLiveAlbum(), useCheckReissueAlbum(), useMergeReleaseSlugs(), { onScroll }, podcastsStore, usePodcasts, authStore (+7 more)

### Community 12 - "Spotify Domain Types"
Cohesion: 0.14
Nodes (19): DiscographySnapshot, MusicBrainzArtist, getRandomInt(), WikiTimeline, useHome, AlbumSimplified, ArtistPage, ArtistSimplified (+11 more)

### Community 13 - "Collection Detection & Paging"
Cohesion: 0.22
Nodes (15): isDescriptionCollection(), isACollection(), isLegacyCollectionName(), ExternalUrls, Paging, Playlist, PlaylistTrack, SimplifiedPlaylist (+7 more)

### Community 14 - "Discogs Client"
Cohesion: 0.11
Nodes (18): createDiscogsSearchLink(), DISCOGS_ENTITIES, discogsClient, escapeHtml(), fetchFromDiscogs(), getDiscogsArtist(), getDiscogsArtistReleases(), HTML_ENTITIES (+10 more)

### Community 15 - "Album & Playback Types"
Cohesion: 0.20
Nodes (16): ResolvedSpotifyArtist, AlbumGroup, AlbumType, Copyrights, ReleaseDatePrecision, ContextType, CurrentlyPlayingAlbum, CurrentlyPlayingItem (+8 more)

### Community 16 - "Runtime Dependencies"
Cohesion: 0.10
Nodes (21): dependencies, crypto-js, date-fns, dompurify, flag-icons, form-urlencoded, ky, @lucide/vue (+13 more)

### Community 17 - "TypeScript App Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, baseUrl, esModuleInterop, ignoreDeprecations, importHelpers, jsx, lib (+12 more)

### Community 18 - "Wikipedia Timeline Parser"
Cohesion: 0.19
Nodes (19): EASYTIMELINE_COLORS, extractTimelineBlock(), fetchWikitext(), findDedicatedMembersPage(), getWikipediaTimeline(), MAIN_ARTICLE_TEMPLATES, parseAttrs(), parseBandMembersSection() (+11 more)

### Community 19 - "UI Screenshots & Layout"
Cohesion: 0.16
Nodes (20): Discography Sections (Albums / EPs / Singles), Artist Genre Tags, Artist Header with External Link Icons, Artist Page Screenshot, Similar Artists Grid, Top Tracks Sidebar List, Collection Album Grid, Collection Header with Owner and Album Count (+12 more)

### Community 20 - "Spotify Playback SDK Types"
Cohesion: 0.10
Nodes (19): AddListenerFn, Album, Artist, Error, ErrorListener, ErrorTypes, Image, PlaybackContext (+11 more)

### Community 21 - "Store Default Values"
Cohesion: 0.10
Nodes (19): CurrentlyPlayingContext, defaultAlbum, defaultAlbumSimplified, defaultArtist, defaultCurrentlyPlaying, defaultCurrentlyPlayingContext, defaultDevice, defaultExternalUrls (+11 more)

### Community 22 - "Route-Level Views & Tier Lists"
Cohesion: 0.11
Nodes (6): authStore, syncTierSizesToDescription(), writeTierListDescription(), RouteMeta, router, routes

### Community 23 - "Album Variant Grouping"
Cohesion: 0.14
Nodes (9): DASH_PATTERNS, normalizeAlbumName(), OTHER_PATTERNS, PAREN_PATTERNS, STANDALONE_PATTERNS, VARIANT_KEYWORDS, VARIANT_PATTERNS, normalizeDiacritics() (+1 more)

### Community 24 - "Search UI"
Cohesion: 0.13
Nodes (5): exactAlbumSearched, searchStore, searchStore, searchStore, useSearch

### Community 25 - "Auth & API Client"
Cohesion: 0.21
Nodes (12): clearAuthData(), logoutAndRedirect(), api, ApiInstance, HttpMethod, RequestOptions, ApiResponse, SpotifyOptions (+4 more)

### Community 26 - "Tauri Desktop Bridge"
Cohesion: 0.22
Nodes (11): openLink(), isTauri(), TauriWindow, handleAuthUrl(), initTauriBridge(), setupDeepLink(), setupThumbarBridge(), setupWindowTitle() (+3 more)

### Community 27 - "Build & Release Scripts"
Cohesion: 0.13
Nodes (15): scripts, build, build:app, build:ci, dev, dev:functions, fix, lint (+7 more)

### Community 28 - "App Bootstrap & Theming"
Cohesion: 0.18
Nodes (9): useAuth, authStore, configStore, useConfig, createKyInstance(), app, handleSpotifySDKErrors(), pinia (+1 more)

### Community 29 - "Tooltip Positioning"
Cohesion: 0.21
Nodes (10): { bottom: wrapBottom, width: wrapWidth, x: wrapLeft, y: wrapTop }, calculateHorizontalPosition(), calculateVerticalPosition(), clamp(), cursorX, { height: tipHeight, width: tipWidth }, { height: viewportHeight, width: viewportWidth }, onMouseMove() (+2 more)

### Community 30 - "External Artist Resolution"
Cohesion: 0.23
Nodes (10): lookupReleaseType(), getDiscogsMemberInfo(), searchDiscogsArtistId(), normalizeString(), resolveArtistByName(), eventsCache, getTicketmasterEvents(), TicketmasterEvent (+2 more)

### Community 31 - "Auth Store & HTTP Retry"
Cohesion: 0.26
Nodes (8): DEFAULT_RETRY_METHODS, DEFAULT_RETRY_STATUS_CODES, http, Auth, AuthAPIResponse, StorageAuth, Config, Storage

### Community 32 - "Release Type Heuristics"
Cohesion: 0.17
Nodes (10): COMPILATION_KEYWORDS, COMPILATION_SPECIAL_PATTERNS, compilationAlbumRegex, isAlbum(), isEP(), isSingle(), LIVE_ALBUM_KEYWORDS, LIVE_ALBUM_SPECIAL_PATTERNS (+2 more)

### Community 33 - "Theme & Color Schemes"
Cohesion: 0.35
Nodes (9): schemeApple, schemeBlue, schemeCrimson, schemeDefault, SchemeLabel, ThemeColor, themeDark, ThemeLabel (+1 more)

### Community 34 - "Root State Types"
Cohesion: 0.33
Nodes (8): AlbumGroup, AlbumPage, Dialog, DialogType, NotificationStore, PlaylistPage, RootState, Sidebar

### Community 35 - "Spotify Search Store"
Cohesion: 0.40
Nodes (7): cache, pending, Album, Artist, Search, SearchFromAPI, TrackSimplified

### Community 36 - "Release Popover"
Cohesion: 0.22
Nodes (7): clamp(), { height: panelHeight, width: panelWidth }, { height: viewportHeight, width: viewportWidth }, string, updatePosition(), visible, { width: wrapWidth, x: wrapLeft, y: wrapTop }

### Community 37 - "Version Bump Script"
Cohesion: 0.20
Nodes (5): currentVersion, dirty, existingTag, pkg, tauriConf

### Community 38 - "Node TS Config"
Cohesion: 0.20
Nodes (9): compilerOptions, lib, module, moduleResolution, noUnusedLocals, noUnusedParameters, types, extends (+1 more)

### Community 39 - "Last.fm Client"
Cohesion: 0.28
Nodes (7): getDisplayName(), getTopAlbumRanks(), getTopArtistsByTag(), LastfmArtistTopAlbums, LastfmTagTopArtists, LastfmTopAlbum, LastfmTopArtist

### Community 40 - "Release Packaging Script"
Cohesion: 0.22
Nodes (8): artifacts, bundleDir, isDebug, msiDir, nsisDir, outDir, pkg, portableExe

### Community 41 - "Scripts TS Config"
Cohesion: 0.25
Nodes (7): compilerOptions, module, moduleResolution, skipLibCheck, target, types, include

### Community 42 - "Social Link Detection"
Cohesion: 0.43
Nodes (7): detectSocialLinkFromUrl(), extractUrl(), SOCIAL_PATTERNS, SocialLink, socialLinksFromDiscogs(), socialLinksFromMusicBrainz(), socialLinksFromWikidata()

### Community 43 - "Stylelint Config"
Cohesion: 0.25
Nodes (7): extends, ignoreFiles, plugins, rules, at-rule-no-unknown, order/order, order/properties-alphabetical-order

### Community 44 - "Package Metadata"
Cohesion: 0.29
Nodes (6): name, optionalDependencies, @esbuild/linux-x64, private, type, version

### Community 45 - "Misc Utilities"
Cohesion: 0.43
Nodes (5): open_spotify_auth(), set_play_state(), AppHandle, Result, String

### Community 46 - "Tauri Capabilities"
Cohesion: 0.33
Nodes (5): description, identifier, permissions, $schema, windows

### Community 51 - "Code of Conduct"
Cohesion: 0.67
Nodes (3): Contributor Covenant v2.0, Community Impact Enforcement Ladder, Mozilla Diversity Enforcement Ladder

## Ambiguous Edges - Review These
- `Spotify Web Playback SDK Script Tag` → `Beardify Icon Font`  [AMBIGUOUS]
  index.html · relation: references
- `Social Sharing Meta Tags` → `Beardify Icon Font`  [AMBIGUOUS]
  public/icons/demo.html · relation: conceptually_related_to
- `Artist Header with External Link Icons` → `#Collection Playlists as Album Collections`  [AMBIGUOUS]
  public/img/readme/artist.png · relation: conceptually_related_to
- `Top Tracks Sidebar List` → `Three-Column Results (Artists / Albums / Tracks)`  [AMBIGUOUS]
  public/img/readme/artist.png · relation: semantically_similar_to

## Knowledge Gaps
- **376 isolated node(s):** `extends`, `plugins`, `ignoreFiles`, `at-rule-no-unknown`, `order/order` (+371 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Spotify Web Playback SDK Script Tag` and `Beardify Icon Font`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Social Sharing Meta Tags` and `Beardify Icon Font`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Artist Header with External Link Icons` and `#Collection Playlists as Album Collections`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Top Tracks Sidebar List` and `Three-Column Results (Artists / Albums / Tracks)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `notification()` connect `Album & Artist Pages` to `Collections & Dialogs`, `Artist Store & MusicBrainz`, `Album & Playback Types`, `Auth & API Client`, `App Bootstrap & Theming`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `http` connect `Auth Store & HTTP Retry` to `Band Members & Wikidata`, `Last.fm Client`, `Genre Browsing & Library`, `Scroll Restore & Podcasts`, `Wikipedia Timeline Parser`, `Auth & API Client`, `External Artist Resolution`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `instance()` connect `Genre Browsing & Library` to `Album & Artist Pages`, `Collections & Dialogs`, `Spotify Search Store`, `Artist Store & MusicBrainz`, `Spotify Domain Types`, `Collection Detection & Paging`, `Album & Playback Types`, `Auth & API Client`, `App Bootstrap & Theming`, `Auth Store & HTTP Retry`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._