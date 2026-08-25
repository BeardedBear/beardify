# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Utilisateur principal : le mainteneur lui-même — un collectionneur d'albums, abonné
Spotify Premium, qui écoute au quotidien et navigue par album et par discographie
plutôt que par titre isolé. D'autres auditeurs Premium utilisent l'app (build web
public + app desktop signée), mais en cas d'arbitrage ce sont les usages du
mainteneur qui tranchent, pas un public générique.

Situation d'usage : session d'écoute longue sur desktop (navigateur ou app Tauri),
avec exploration d'artistes en parallèle de la lecture. Le lecteur est toujours
présent ; la navigation ne l'interrompt jamais.

## Product Purpose

Beardify est un client web Spotify qui corrige ce que le client officiel ne fait pas
pour une écoute orientée album :

- **Collections** : des playlists d'albums, impossibles dans le client officiel.
- Vue artiste enrichie : discographie lisible, artistes liés, timeline des membres,
  bio/timeline Wikipedia, concerts, liens externes.
- Recherche compacte, sans le bruit du client officiel.
- Fil des nouvelles sorties des artistes suivis, navigation par genre, podcasts,
  contrôle multi-appareils avec file d'attente live, historique de lecture, partage.

Succès = le mainteneur n'a plus besoin d'ouvrir le client officiel pour son écoute
courante.

## Positioning

Le mécanisme différenciant est la convention `#Collection` : une playlist dont le nom
contient `#Collection` est traitée comme une collection d'albums. L'API Spotify
n'expose aucune notion de playlist d'albums ni de dossiers ; Beardify la simule sans
casser l'organisation existante de l'utilisateur, puisque ce restent des playlists
Spotify ordinaires — convertibles dans les deux sens à la volée, et lisibles depuis
le client officiel.

Second axe : densité d'information nettement supérieure au client officiel, à
surface d'écran égale.

## Operating Context

- Web (Netlify, `beardify.netlify.app`) et app desktop Tauri auto-updatée
  (Windows signé Minisign, toast de mise à jour au démarrage).
- Auth OAuth 2.0 PKCE, refresh toutes les 30 min, session persistée en localStorage.
- Lecture via le Web Playback SDK Spotify ; contrôle possible d'autres appareils
  Spotify actifs (heartbeat toutes les 4 min pour garder l'appareil vivant).
- Données externes hors Spotify : MusicBrainz, Discogs, Wikipedia, flag-icons.
- Les liens de partage (`/share/:id`) sont ouverts par des tiers non authentifiés :
  route chromeless, sans shell ni lecteur.

## Capabilities and Constraints

- **Premium obligatoire** : l'API Web Playback de Spotify refuse les comptes gratuits.
- **Pas de dossiers** : l'API Spotify n'expose pas la gestion des dossiers ; la liste
  de playlists est donc plate.
- Navigateurs modernes requis : modules ES, custom properties CSS, DRM Widevine.
- Pas de framework de test — le lint (`vue-tsc` + ESLint + Stylelint) est la seule
  barrière qualité.
- 13 routes : Home, Artist, Album, Playlist, Collection, Share, Genre, Podcasts,
  Podcast, Releases, User, Auth, Login.
- Vocabulaire produit : « Collection » = playlist d'albums ; « Playlist » = playlist
  de titres. Cette distinction est visible dans l'UI et ne doit pas être aplatie.

### Contraintes durables à préserver

1. **La convention `#Collection`** — logique métier centrale, aucune modification de
   comportement sans accord explicite du mainteneur.
2. **La densité compacte** — c'est le différenciateur revendiqué face au client
   officiel. Aucun travail de design ne doit aérer l'interface au point de perdre
   cet avantage.
3. **La parité web / desktop** — un seul langage visuel pour le build web et l'app
   Tauri ; pas de divergence par plateforme.

## Brand Commitments

- Nom : Beardify. Auteur : BeardedBear.
- Thèmes clair et sombre avec plusieurs schémas de couleurs (`ColorsTheme`), pilotés
  par custom properties (`--bg-color-*`, `--font-color-*`, `--primary-color-*`).
  Existant et fonctionnel, mais non déclaré intouchable par le mainteneur.
- Icônes : `@lucide/vue`.

## Evidence on Hand

- Captures d'écran réelles dans `public/img/readme/` (collection, artist, search),
  référencées par le README.
- Aucun témoignage, chiffre d'usage, benchmark, tarif ou étude de cas n'existe.
  Ne rien fabriquer de tel : projet personnel, non commercial (licence dans `LICENSE`).

## Product Principles

1. **Album d'abord.** L'unité mentale est l'album et la discographie, pas le titre.
2. **Dense par choix.** Plus d'information utile par écran que le client officiel ;
   la compacité est une fonctionnalité, pas un défaut à corriger.
3. **Ne rien casser côté Spotify.** Toute donnée reste une entité Spotify valide,
   lisible depuis le client officiel.
4. **La lecture ne s'interrompt jamais.** Le lecteur survit à toute navigation ; les
   contrôles sont optimistes (état mis à jour avant l'API, rollback en cas d'échec).
5. **Une seule app, deux enveloppes.** Web et desktop partagent le même design.

## Accessibility & Inclusion

Basiques uniquement, pas de standard formel visé : contraste lisible dans les deux
thèmes, focus visible au clavier, cibles cliquables correctement dimensionnées.
