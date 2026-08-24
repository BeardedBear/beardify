---
target: src/components/dialog/SearchDialog.vue
total_score: 12
max_score: 40
na_heuristics: 
p0_count: 3
p1_count: 1
timestamp: 2026-08-24T21-03-05Z
slug: src-components-dialog-searchdialog-vue
---
Method: dual-agent (A: design review, B: deterministic evidence)
Surface: the search modal. Anchor SearchDialog.vue; real scope = dialog + input + 4 result columns + store (602 lines). Mode: Operate.

## Design Health Score - 12/40

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 1 | No loading state. 500ms debounce + network during which the screen shows either four "No X found" or the previous query's results. |
| 2 | Match with real world | 2 | isSingle speaks the collector's language, but "Collection" is absent from the whole surface, and the heading says "Songs" while the empty state says "No track found". |
| 3 | User control and freedom | 2 | Escape/backdrop/close work (native dialog), but every exit burns an API request and no result is actionable without dismissing. |
| 4 | Consistency and standards | 2 | Two search idioms in the app. `type="search"` adds the browser's native clear x under the custom one. The `big` prop is dead. |
| 5 | Error prevention | 1 | SearchSongs.vue:4 gates on `albums` while rendering `tracks`. SearchArtists.vue:39 throws on "  &  " without ":". No sequence guard. |
| 6 | Recognition over recall | 2 | Covers and genres help, but the `artist:X & album:Y` syntax is undiscoverable and Collections live in a different box. |
| 7 | Flexibility and efficiency | 0 | No shortcut opens it. No arrow navigation. 2 of 4 columns are not tabbable. No keyboard path from open to play. |
| 8 | Aesthetic and minimalist | 1 | 90dvh x 90dvw for at most 23 results. On open with no query: four negations, full screen. |
| 9 | Diagnose and recover | 0 | `catch { // silent }`. A 429, a dead token and a genuine zero-result are pixel-identical. |
| 10 | Help and documentation | 1 | A hidden query DSL with no hint at all. |

No heuristic n/a. Cognitive load: 5 of 8 failures -> HIGH (single focus, visual hierarchy, one thing at a time, minimal choices with 23 simultaneous targets, working memory, progressive disclosure).

## Design specificity verdict

Half-grounded, and the grounded half is one line long.

The real product signature is SearchStore.ts:34 - `.filter((album) => !isSingle(album))`. Spotify buries a discography under singles; this refuses to. Plus the genre chips on artist rows (a collector's exact disambiguator) and the `artist:X & album:Y` exact-match protocol.

Everything else is generic:
- Four co-equal columns for four co-equal types (0.9fr 1fr 0.8fr 0.8fr). For an album-first product Albums should dominate; a 20% difference reads as identical.
- Flat arbitrary caps 6/6/6/5, and B found there is no `limit=` in the request at all - it over-fetches ~20 per category to display 5-6.
- "Collection" appears nowhere in this surface. The one thing Beardify has that Spotify lacks is missing from Beardify's search.
- 90% of the viewport for <=23 results: the least dense surface in the app that sells density.

4/10 specific.

Deterministic scan: detector 0 findings with AND without project config - nothing suppressed. Lint, 142 tests and build all pass. Search code has no chunk of its own; it bundles into DialogList-*.js (22.20 kB / 7.02 kB gzip) with every other dialog.

Browser overlays: UNAVAILABLE (no puppeteer/playwright, no browser tool). No overlay exists in the user's browser.

B corrects two things: bearded-ui installed is 0.1.21 and its dist does expose both `height` and `width`, so the earlier "won't work until a release" caveat is stale - the user republished. But DialogWrap does NOT declare a `width` prop; it only reaches BdDialog through attribute fallthrough, untyped at that boundary unlike height/maxHeight/maxWidth.

## What is working

1. The isSingle filter on the album column (SearchStore.ts:34) - one line, and the entire reason this search beats Spotify's for this user.
2. The focus/select choreography on open (SearchInput.vue:14 + :57) - someone traced the real conflict (showModal()'s focusing steps handing focus to the header close button) and used `autofocus` rather than fighting it with focus(), then nextTick(select()) so a repeat search overwrites.
3. Standing on native <dialog> (BdDialog) - focus trap, Escape, inert background, top layer, all correct and free. The backdrop-dismiss guard requires both pointerdown and click to land outside, so a text selection dragged out of the panel does not destroy the search.

## Priority issues

### [P0] Two rendering bugs, one of them a crash
SearchSongs.vue:4 does `v-if="searchStore.albums.length"` while rendering `searchStore.tracks`. Since albums are additionally filtered by isSingle, any query whose albums are all singles gives albums=[] while tracks is full - the column reports "No track found" over live data.
SearchArtists.vue:39 does `query.split(":")[1].split("&")`. Reproduced:
  "artist:opeth  &  album:damnation" -> "opeth"
  "opeth  &  damnation"              -> CRASH: TypeError
A query containing "  &  " without a colon throws during render.
Fix: `v-if="searchStore.tracks.length"` (one word) and optional chaining plus a first-segment fallback in the computed.

### [P0] Every failure is silent, and the empty state doubles as the loading state
SearchStore.ts:37-39 swallows all errors. No `loading` flag exists. No sequence guard, so out-of-order responses win. The four columns render "No X found" whenever their array is empty - which is exactly the state during the 500ms debounce plus the request.
On every first search the user is told "not found" while the search is still running. On a 429 (Spotify rate-limits search aggressively) stale results present as fresh. CLAUDE.md requires notification() for errors; this file opts out.
Fix: loading + failed in state, BdLoader in place of the four negations, notification() in the catch, and capture `const q = this.query` before the await, bail if `q !== this.query` after.

### [P0] No keyboard path, in or out
Nothing opens the modal from the keyboard - four click handlers, and useKeyboardEvents.ts binds only volume and Space. Inside: tabindex, @keydown and role are at ZERO occurrences across the surface. Artists and Podcasts are router-links so reachable; Albums and Songs are <div @click> and do not exist for the keyboard. Even made focusable, an album's play button is display:none until hover.
Fix: useKeyboardEvents.ts already imports useMagicKeys - Ctrl/Meta+K is four lines. Then roving tabindex + arrows across columns with Enter to activate, and reveal play on :focus-within alongside :hover.

### [P1] 90dvh x 90dvw contradicts the density it was meant to serve
~90% of the viewport for content capped at 23 items split four ways. On 1440x900 that is ~1300x810 px, two thirds empty.
MY RESPONSIBILITY: the comment I left in SearchDialog.vue diagnoses the jump correctly, but a fixed height is one of two possible answers and I picked the wrong size - I fixed the jump by making the box too large for any content to fill.
Fix - pick one direction, not both:
  Palette (fits the "jump mid-listen" scene): size="big", height="min(38rem, 78dvh)", no width override, two columns - Artists+Albums primary, Songs+Podcasts on a narrower rail. Listening context stays visible around it.
  Browser: keep 90dvh/90dvw but raise the caps to actually fill it (12/18/12/6) and give Albums visible dominance (2fr).
Either way delete the inert `big` prop: size="big" sets width: min(90vw,56rem) in a stylesheet rule, which the inline width: 90dvw overrides.

### [P2] reset() re-runs the search it claims to reset
`reset() { this.search(); useDialog().close(); }` - called from all four columns and from SearchIndex's Escape listener, which also duplicates what native <dialog> already does and bypasses DialogWrap's isClosing guard. Dozens of wasted requests per session against the endpoint most likely to 429. The function that actually resets is called clear().
Fix: reset() keeps only useDialog().close(). Delete the Escape listener entirely.

## Persona red flags

Alex (power user): cannot open it from the keyboard; 500ms of silence with no indicator, and retyping restarts the debounce so fast typing is actively punished; no first-result default so every search ends in a mouse click; the input scrolls out of view (.search has flex:1/overflow-y:auto without min-height:0, so the dialog body scrolls instead, input included).

Sam (accessibility-dependent): two of four columns invisible to the keyboard - tab order is input -> clear -> close -> back; an album has no pointer-free path to playback; the field has no accessible name (BdInput renders its label only if given one, placeholder is the fallback); SearchPodcasts.vue:12 is an <img> with no alt so the URL is announced; silent errors are worst here - no aria-live on the results region either.

Germain (collector, mid-listen): the modal takes 90% of the screen and blurs the rest, erasing the discography he was comparing; the column he wants gives him six albums in a box that could show forty; he cannot search his own Collections - the feature the app exists for; half-remembering `artist: & album:` crashes the screen.

## Minor observations

- Dead CSS: SearchIndex.vue:53-56 sets top/left/right/z-index on a position:static grid - all four inert. Leftover from when results were an anchored dropdown.
- `:key="index"` on all four lists - Vue reuses nodes between searches, so there is a visible moment of the old cover under the new name. Key by .id.
- Duplicate clear controls: type="search" gives Chromium/WebKit a native clear x under the custom one pinned at right: 1.8rem.
- "Songs" heading vs "No track found" empty state - same entity, two names.
- No `market` param: tracks unplayable in the user's market can surface and then fail silently at play time.
- Unbounded genre chips make artist rows wildly uneven in the narrowest column; slice(0,3) keeps the density benefit.
- SearchTitle renders no count - "ALBUMS (6 of 20)" would cost nothing and say the list is truncated.
- Backspacing to empty leaves stale results: updateQuery only searches `if (this.query.length)`; only the clear button calls clear().
- scale(1.03) on hover, duplicated across all four columns - text jitters as the pointer crosses rows in a dense list.
- DialogWrap does not declare `width`; it works only via attribute fallthrough. Should be declared like the other three - my omission.

## Questions to consider

1. Should this be a modal at all? The scene is a command palette, not a browsing surface. A 40rem panel leaves the discography visible behind it. The recent change went the other way - on what evidence?
2. If Collections are the reason the app exists, why is the search that cannot find them the one bound to the magnifier? The sidebar filter already has the data in memory and could answer in zero milliseconds while the network columns fill - which would also solve half the loading-state problem.
3. Who is the Podcasts column for? It takes 0.8fr of permanent width and five slots on every search, forever. What would Albums look like with that space back?
4. isSingle proves someone thought hard about what a collector wants - so why is the cap six? Six is a dropdown's number.
5. Every result click fires a Spotify request that is thrown away, and nobody noticed because catch {} guarantees no failure is ever visible. How many other things are broken and silent for the same reason - is "silent fail" (also in DialogStore.ts) a house pattern to revisit?
