---
target: podcast page/sous pages
total_score: 13
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 4
target_identity: "file:C:\\Users\\germa\\wwwwin\\beardify\\src\\views\\podcasts"
timestamp: 2026-09-17T19-06-28Z
slug: src-views-podcasts
---
Method: dual-agent (A: revue design, B: détecteur + preuves). Mode Operate.
Navigateur non disponible : aucun outil d'automatisation exposé. Zéro pixel observé, zéro overlay, zéro contraste mesuré. Tout est ancré source/CSS/tokens.

## Design Health Score

| # | Heuristique | Score | Problème clé |
|---|---|---|---|
| 1 | Visibilité de l'état système | 1 | Épisode en lecture = `BdLoader` permanent (`PodcastEpisode.vue:43`) ; aucune classe `.active` |
| 2 | Correspondance monde réel | 2 | « Resume » sans timecode ; `PlayerControls.vue:5-47` retire shuffle/repeat/prev/next quand `isEpisode` et ne met rien à la place |
| 3 | Contrôle et liberté | 1 | Unfollow sans undo ; pause impossible depuis la liste ; pas de retour vers `/podcasts` |
| 4 | Cohérence et standards | 1 | `variant` inversé vs `ArtistOptions.vue:9` ; follow non optimiste ; `PageFit` au lieu de `PageScroller` ; `--bd-space-6` au lieu de `--page-inset` |
| 5 | Prévention des erreurs | 1 | `episode.is_playable` jamais testé ; `duration_ms: 0` → `width: Infinity%` (`PodcastEpisode.vue:24,31`) |
| 6 | Reconnaissance vs rappel | 2 | Carte = pochette + nom ; page cible ne remontre pas la pochette |
| 7 | Flexibilité et efficacité | 1 | Pas de clic-sur-ligne, pas de tri/filtre, pas de file d'attente, pas de tooltip |
| 8 | Esthétique et minimalisme | 2 | Pochette répétée 50× ; taille de bouton variable d'une ligne à l'autre |
| 9 | Récupération d'erreur | 0 | 5 `catch` = `console.error` en DEV seulement (`PodcastsStore.ts:46,59,68,80,93`). En prod : échec = spinner infini muet |
| 10 | Aide et documentation | 2 | L'état vide est bon ; seule aide de la surface |
| **Total** | | **13/40** | **Poor** (12-19) |

Aucune heuristique `n/a` : mode Operate, les dix s'appliquent.

## Verdict de spécificité

**Sous-traitée.** La surface consomme bien le design system (`--bd-*`, `bd-font-bold`, `BdButton`/`BdLoader`/`BdEmptyState`) mais n'hérite d'aucune décision produit des surfaces sœurs. `ReleaseListPage.vue:2-27` a trois états (loading / erreur + `Try again` / vide) et un dénominateur « N of M listened » ; podcast n'a qu'un état vide et un loader piloté par la mauvaise variable. `AlbumHead.vue:7-15` a métas denses + partage ; `PodcastPage.vue:6-18` a un `<h1>` et une boucle, alors que `images`, `publisher`, `description`, `total_episodes`, `external_urls` sont tous dans le type (`Podcast.ts:31-49`).

**Scan déterministe : 0 finding sur les 4 cibles, exit 0.** Validé non-muet (exit 2 / `bounce-easing` sur `src/components/player/device/QueuedTracks.vue:300`, hors périmètre). Le détecteur ne voit pas ce qui casse ici : la surface est propre (0 couleur en dur, 0 breakpoint px, tokens partout, `--played-size` namespacée, `instance()` à 100 %) et creuse. Convergences A/B : absence d'état d'erreur, `list` mort, `:key="index"` sur listes paginées, condition dupliquée 4-5×, `<img>` brut dans `SearchPodcasts.vue:13`.

Faux positifs à écarter, signalant une dérive de doc : `bd-font-bold` et les tokens `--bd-*` sont conformes, c'est `CLAUDE.md` qui est périmé (il prescrit `src/assets/css/utilities.css`, supprimé, et les préfixes `--bg-color-*`/`--font-color-*`/`--primary-color-*`, 0 occurrence dans `src/`). Le focus est couvert par le reset `bearded-ui` (`:focus-visible`). Signalé, non corrigé.

## Impression générale

Ce qui marche : le CSS. Ce qui ne marche pas : tout ce qui relève d'une décision produit. Plus grosse opportunité : la surface ne sait pas dire qu'elle a échoué, ni ce qui joue.

## Ce qui fonctionne

1. `PodcastListPage.vue:60-67` — grid corrigé et documenté par le bug corrigé (« Was repeat(4, 1fr): four 55px columns at 390px wide »), override 2 colonnes mobile avec raison arithmétique.
2. `PodcastEpisode.vue:183-195` — troncature passée de `slice(0, 200)` JS à `-webkit-line-clamp: 2`, raisonnement écrit. CSS plutôt que JS.
3. `PodcastEpisode.vue:21-34` — la barre bascule entre `playerState.position` (live) et `resume_point.resume_position_ms`. Seule idée qui exploite la donnée podcast. Bonus : coin corné `clip-path` (`:157-176`).

## Problèmes prioritaires

### [P0] Le loader de la liste est piloté par une requête morte
`PodcastListPage.vue:2` + `PodcastsStore.ts:84-95`. `getPodcasts()` fetche un show hardcodé (`5JxGy243aIXNWg6HSeV627 // La Pifotheque`) jamais affiché nulle part ; `list` ne sert qu'à conditionner le spinner.
Pourquoi : si la requête échoue (show retiré, market-restricted, 429), un utilisateur qui ne suit aucun podcast voit un spinner éternel et l'état vide devient inatteignable. Si elle réussit avant la pagination récursive de `me/shows`, l'état vide s'affiche puis est remplacé.
Fix : supprimer `getPodcasts()`, `list` (store l.120) et `PodcastsPage.list` (`Podcast.ts:61`) — code mort. Ajouter `loading` remis à `false` en `finally` + troisième état erreur en `BdEmptyState` avec `action-label="Try again"`, modèle `ReleaseListPage.vue:5-12`.
Commande : `/impeccable harden`

### [P1] Zéro état d'erreur sur toute la surface
`PodcastsStore.ts:58-60, 67-69, 79-81, 92-94` + `PodcastPage.vue:13-17`. Quatre lectures avalent l'exception dans un `catch` qui ne log qu'en DEV ; aucun flag d'erreur dans l'état. En production, tout échec = spinner infini (page émission) ou `<div>` vide (émission sans épisode). `SearchIndex.vue:20-28` a déjà le pattern `failed` + `BdEmptyState` + `Try again`.
Fix : `error` + `loading` dans `PodcastsPage`, `finally`, trois états distincts dans les deux vues, état vide pour la liste d'épisodes.
Commande : `/impeccable harden`

### [P1] L'épisode en cours est rendu comme un chargement
`PodcastEpisode.vue:43-46, 93-96`. Le bouton de l'épisode courant est remplacé par un `BdLoader` : spinner permanent qui mentit sur l'état système et supprime la seule action de la ligne — seul endroit de l'app où on ne peut pas mettre en pause ce qu'on vient de lancer. Pire : `isPlayingThisEpisode` exige `!paused` (l.95), donc un épisode en pause redevient indiscernable dans 50 lignes.
Fix : garder le `BdButton`, identifier l'épisode courant sur `current_track.id === episode.id` sans le test `paused`, marquer la carte `.active` (modèle `PlaylistTracks.vue:4`), icône pause/play → `playerStore.pause()`/`play()`. `BdButton` a déjà `active` et `loading`.
Commande : `/impeccable harden`

### [P1] Aucun contrôle de transport podcast
`PlayerControls.vue:5-47` (vérifié). Sous `isEpisode`, 4 contrôles sur 6 disparaissent et rien ne les remplace : play/pause seulement. Reculer de 15 s n'existe pas ; il faut viser la `SeekBar` à la souris. Sur la surface où la session dure 90 min.
Fix : sous `isEpisode`, deux `IconButton` skip-back/skip-forward → `playerStore.seek(position ∓ 15000 / ± 30000)`. `seek()` est déjà optimiste, `IconButton` et `isPodcastTrack` sont en place : ~15 lignes.
Commande : `/impeccable shape` puis `/impeccable harden`

### [P1] La page d'émission n'a pas de header, et le bouton Follow contredit l'app
`PodcastPage.vue:6-18` : `images`, `publisher`, `description`, `total_episodes`, `external_urls` dans le type, aucun affiché. On clique une pochette et la page cible ne la remontre pas.
`PodcastFollowButton.vue:3` : `variant="primary"` = non suivi, alors que `ArtistOptions.vue:9` utilise `primary` = suivi. Même app, sens inversé de la couleur d'accent. Et le follow n'est pas optimiste (`PodcastsStore.ts:24-25` : `await` puis flip), seule surface à violer le principe produit n°4 — `ArtistStore.switchFollow` fait l'inverse avec rollback. S'ajoute `myPodcasts = []` + repagination complète de `me/shows` pour ajouter un item (l.27-28), alors qu'`unfollowPodcast` fait déjà un `filter` (l.102).
Fix : `PodcastHeader.vue` calqué sur `AlbumHead.vue` (cover + `publisher · {total_episodes} episodes` + description + `ShareContent`) ; `PageScroller` au lieu de `PageFit` ; flip optimiste + garde dans le store ; `variant="success"` pour l'état suivi.
Commande : `/impeccable shape` puis `/impeccable polish`

## Charge cognitive — 3 échecs / 8 (modérée, limite haute)

- ÉCHEC Hiérarchie visuelle : `variant="primary"` s'applique à tout épisode reprenable (`PodcastEpisode.vue:49-53`) — dans 50 lignes, vingt actions primaires. `bd-font-bold` porte le nom (l.9) et les métas (l.37).
- ÉCHEC Mémoire de travail : la page d'émission jette pochette + publisher + description que la liste montrait, sans lien retour ; un épisode en pause redevient indiscernable.
- ÉCHEC Divulgation progressive : 50 descriptions simultanées, back-catalogue fetché récursivement d'un coup (`PodcastsStore.ts:78`), sans « charger plus » ni virtualisation.

## Persona red flags

**Alex (power user)** : pas de clic-sur-ligne pour lancer (`PlaylistTracks.vue:8` le fait) ; le bouton change de taille et de libellé d'une ligne à l'autre (`PodcastEpisode.vue:54-58`) ; zéro accélérateur (menu contextuel, file d'attente, lien Spotify, tri dans 50 émissions) ; pause impossible depuis la liste.

**Sam (a11y)** : l'état « écouté » n'existe pas pour un lecteur d'écran (`<i class="icon-check" />`, `PodcastEpisode.vue:4`, sans `aria-hidden` ni équivalent texte) ; barre de progression = deux `<div>` nus (`:19-34`, pas de `role="progressbar"`/`aria-valuenow`) ; liste d'épisodes sans sémantique (`<div v-for>`, `PodcastPage.vue:14`, pas de `<ul>/<li>`, pas de `<h2>`) ; `will-change: transform` + `scale(1.03)` sans garde reduced-motion (`PodcastCard.vue:34-38`). 0 occurrence de `aria-*`/`role`/`tabindex` dans tout le périmètre.

**Riley (edge cases)** : émission à 0 épisode → `<div>` vide ; émission à 800 épisodes → 16 requêtes séquentielles, 800 cartes en DOM, aucun indicateur ; changer de podcast pendant la pagination → aucun `AbortController`, la récursion de A `concat` ses épisodes dans la liste de B après le `clean()` (`ArtistStore.ts:191,196` a cette garde) ; `duration_ms: 0` → `width: Infinity%`/`NaN%` ; aucun test sur la surface alors que `ReleasesStore.test.ts` existe.

**Le mainteneur collectionneur (écoute longue desktop)** : il a construit « 12 of 340 listened » pour les albums (`ReleaseListPage.vue:37`) et rien pour les podcasts, alors que `fully_played` est dans chaque payload et déjà utilisé pour le coin corné. Densité perdue là où la session est la plus longue : une carte d'épisode ≈ 10,7rem contre ≈ 3,9rem pour une ligne de morceau — ~2,7× la hauteur pour moins d'information exploitable, dont la moitié vient de la pochette répétée 50 fois. Principe produit n°2 inversé sur sa propre surface.

## Observations mineures

- Le ternaire du `@click` est un no-op (vérifié) : `playSong(uri)` et `playSong(uri, 0)` envoient le même payload, `play.ts:19` teste `position ?` et `0` est falsy. Fix : `position !== undefined`.
- Navigation cassée depuis le player : `PlayerMetas.vue:35` route vers `/album/${transformUriToid(currentTrack.album.uri)}` → `/album/<showId>` pour un épisode ; `ArtistList.vue:3` → `/artist/<showId>`. Deux impasses.
- Même condition `!fully_played && (resume_position_ms || 0) > 0` réécrite 5 fois (`PodcastEpisode.vue:18,50,55,60,66`) sans `computed`.
- `--page-inset` ignoré : les deux pages écrivent `padding: var(--bd-space-6)` alors que `layout.css:1-18` dit de lire le token. 2rem d'inset là où le reste passe à 1rem en mobile.
- `overflow-y: scroll` (`PodcastPage.vue:49`) vs `auto` (`PodcastListPage.vue:52`).
- `.infos` en `space-between` sans `flex-wrap` et sans media query (`PodcastEpisode.vue:131-136`) ; `.cover { height: 5rem }` sans `width` ni `flex-shrink: 0` (`:178-181`). Non mesuré, faute de navigateur.
- `PlayerEpisode.vue:45-51` perd la bascule mobile de `PlayerSong.vue:63-68`, et son `interactiveSelector` liste `.area-device`, classe que son propre template ne rend pas. Le composant ne porte aucune des vraies différences podcast (`PlayerControls`, `PlayerMetas`) : il duplique et régresse.
- `PodcastFollowButton.vue:63-66` réécrit à la main le `:disabled { opacity: .6 }` que le prop `loading` de `BdButton` fournit. Icon-font `icon-podcast` (`PodcastListPage.vue:15`) alors que les surfaces récentes sont passées à `@lucide/vue`.
- `SearchPodcasts.vue:13` utilise un `<img>` brut là où `SearchArtists.vue` et `PodcastCard.vue` passent par `Cover` : perte du fallback `PLACEHOLDER`, `loading="lazy"` et `referrerpolicy` d'`AlbumCover.vue`.

## Questions à creuser

1. `getPodcasts()` fetche « La Pifotheque » depuis un id hardcodé, ne l'affiche nulle part, et pilote quand même l'écran de chargement. Combien de temps ce résidu a tenu parce que personne ne regarde cette page ?
2. Si la page d'émission n'affiche ni publisher, ni description, ni compteur — à quoi sert-elle ? Pour les albums la réponse Beardify est `#Collection`. Quel est l'équivalent podcast, ou faut-il assumer que c'est une file d'écoute et la réduire franchement à ça (liste dense d'épisodes non écoutés, toutes émissions confondues) ?
3. « Dense par choix » vaut-il pour les podcasts ? 2,7× la hauteur d'une ligne de morceau : décision assumée ou oubli ?
4. Pourquoi `PlayerEpisode.vue` existe-t-il ? Le supprimer et router les deux cas vers `PlayerSong` retirerait du code et corrigerait le layout mobile.
