---
target: seekbar
total_score: 17
max_score: 36
na_heuristics: 10
p0_count: 1
p1_count: 3
timestamp: 2026-08-25T21-51-30Z
slug: src-components-player-seekbar-vue
---
`Method: dual-agent (A: design review · B: detector + static evidence) — isolés, en parallèle.`

# Critique — src/components/player/SeekBar.vue

Mode : **Operate**.

## Design Health Score

| # | Heuristique | Note | Problème clé |
|---|---|---|---|
| 1 | Visibilité de l'état système | 2 | Aucun état pendant le commit ; rubber-band sur device externe ; barre vivante avec `max=0` pendant un switch |
| 2 | Correspondance système / monde réel | 3 | `timecode(0)` renvoie `""` → aria-valuetext « of 3:45 » sans position |
| 3 | Contrôle et liberté | 2 | Pas de ±10 s ; Échap n'annule pas un drag |
| 4 | Cohérence et standards | 1 | DeviceVolume a reçu 4 correctifs, la seekbar 0 |
| 5 | Prévention des erreurs | 1 | `:max="duration || 0"` → contrôle dégénéré actif ; `disallows.seeking` jamais lu |
| 6 | Reconnaissance plutôt que rappel | 3 | Chiffres dans un autre composant, autre ticker |
| 7 | Flexibilité et efficacité | 1 | `step="1000"` ; aucun raccourci global de seek |
| 8 | Esthétique et minimalisme | 4 | Rail 2 px, pas de thumb, preview à la demande |
| 9 | Diagnostic et récupération d'erreur | 0 | `seek()` : ni try, ni rollback, ni notification |
| 10 | Aide et documentation | n/a | Affordance universelle, preview auto-documentante |
| **Total** | | **17/36** | **Poor (47 %)** |

## Design Specificity Verdict

Partiellement authored. Propre à Beardify : rail `0.2rem` sans thumb, et surtout le `scaleX` composité dont `transition: transform linear 0.2s` est calibrée sur `freq = 200`. Le reste est interchangeable — et le wedge `clip-path` qui signe DeviceVolume.vue:199 est absent ici : deux sliders côte à côte sans vocabulaire commun.

**Scan déterministe** : `detect.mjs` → 0 finding sur la cible, 0 sur `src/components/player`, EXIT=0. Contrôle vérifié (un `.vue` avec `font-family: Inter` déclenche bien `overused-font`), mais sur ~12 anti-patterns plantés seuls 3 remontent : depuis un fichier source seul le moteur `regex` est atteignable (`detector/registry/antipatterns.mjs:559`), donc contraste, layout et tailles calculées ne sont jamais évalués. EXIT=0 = « aucun motif source », pas « composant sain ».

**Overlays** : aucun. Pas d'outil navigateur exposé, cible derrière OAuth Premium. Ratios calculés hors ligne depuis les formules oklch de themes.css.

## Overall Impression

Soins de performance réels, soins d'interaction inexistants. `DeviceVolume.vue` est déjà la version corrigée de ce fichier : thumb zéro-largeur, preview au focus, verrou anti-resync, rollback + notification. La seekbar n'en a aucun, pour un contrôle dix fois plus utilisé.

## What's Working

1. `scaleX` synchronisé sur le ticker (SeekBar.vue:152-162 + 76-83) — transition 200 ms remplacée toutes les 200 ms, en `linear`, zéro layout.
2. Clamp défensif (SeekBar.vue:81 + 73) contre un SDK bloqué sur `paused: false`.
3. Split `onScrub`/`onCommit` (@input vs @change) — un seul appel API par drag ; le passage à un vrai `<input type=range>` a apporté clavier, tactile et ARIA.

## Priority Issues

### [P0] Le clic n'atterrit pas où pointe le curseur
SeekBar.vue:176-187 — `appearance: none` sans règle de thumb → thumb par défaut ~16-20 px, valeur répartie sur `width − thumbWidth`, alors que le tooltip utilise `elementX / elementWidth` (ligne 63). Erreur max 8 px = 0,57 % de la durée → ~1,4 s sur un titre, ~20 s sur un épisode d'1 h ; 8 px morts à chaque bord. Fix : `::-webkit-slider-thumb`/`::-moz-range-thumb` en `width: 0` (copie de DeviceVolume.vue:246-263). Commande : /impeccable harden

### [P1] `seek()` est le seul contrôle optimiste sans filet
PlayerStore.ts:283-287 — aucun try : unhandled rejection, aucun rollback, aucune notification. toggleShuffle (446-461), toggleRepeat et setVolumeOptimistic font les trois. Fix : prevPosition + try/catch + notification. Commande : /impeccable harden

### [P1] Rubber-band du seek sur device externe
PlayerIndex.vue:42-44 poll toutes les 2 s (device externe) → PlayerStore.ts:214 écrase `position` avec une valeur périmée → watch SeekBar.vue:88 (delta > 1500) ramène la barre en arrière puis en avant. Le mécanisme correct existe 4 lignes plus bas : `volumeLockUntil` (29, 218, 301). Fix : `seekLockUntil` + garde sur la ligne 214. Commande : /impeccable harden

### [P1] Pas de seek clavier praticable, ni read-out au focus
`step="1000"` (ligne 25) ; `.seek` seulement sur `:hover` (169-173) alors que DeviceVolume.vue:276-283 la révèle sur `:has(.range:focus-visible)` ; `useKeyboardEvents.ts` a Shift+↑/↓ pour le volume et rien pour le seek. Fix : step proportionnel, `.seek` dans le bloc `:has()` existant (ligne 189), ←/→ = ±10 s. Commande : /impeccable adapt

### [P2] Contrôle actif et dégénéré pendant le chargement
`:max="duration || 0"` (ligne 21) → min = max = 0, range interactif, tout clic = `seek(0)`. Plus PlayerStore.ts:52 : `this.playerState = defaultPlaybackState` assigne par référence l'objet module-level exporté, donc les mutations polluent le défaut partagé. Fix : `:disabled="!duration"` + `{ ...defaultPlaybackState }`. Commande : /impeccable harden

### [P3] Contraste du tooltip sous AA
SeekBar.vue:133-137 — `--font-color-light` sur `--primary-color` à 12,3 px : 3,20:1 vs 4,5 requis. `--bd-on-primary` vaut `#fff` → 3,85:1, insuffisant seul. Fix : assombrir le fond (`--primary-color-darker`, ~7:1, tient sur toutes les palettes). Commande : /impeccable colorize

## Persona Red Flags

**Alex (power user)** — 1 s par flèche, aucun raccourci de seek (le volume a Shift+↑/↓) ; cible de 18,3 px au pointeur fin (sous les 24 px de WCAG 2.5.8) ; aucun marqueur ni ±30 s ; la seekbar n'affiche même pas sa durée.

**Sam (clavier + lecteur d'écran)** — `aria-valuetext` « of 3:45 » à la position 0 (date.ts:68 ; le fallback existe déjà dans PlayerControls.vue:56) ; aucun read-out visible pendant un scrub clavier ; `aria-label="Seek"` sans contexte, deux SeekBar montées en permanence (App.vue:18-19) ; échec de seek totalement silencieux ; ~37 px en pointer: coarse.

**Le mainteneur (device distant)** — le rubber-band est son bug exclusif ; aucun signal d'attente d'ack, donc re-clic ; deux instances tournent en permanence (deux intervalles 5 Hz + deux listeners mousemove document-level) ; chemin épisode abandonné — PlayerEpisode.vue:15 passe `:duration=` à un composant sans props, l'attribut retombe en attribut DOM mort.

## Minor Observations

- SeekBar.vue:64 — `if (durationPerc)` : à l'extrême gauche la valeur est 0 → falsy → tooltip périmé au bord le plus utile.
- SeekBar.vue:123 — `opacity: 0.5` est mort : `animation … both` avec `to { opacity: 1 }` gagne la cascade et le fill-mode la maintient.
- SeekBar.vue:132-143 — pas de `tabular-nums` sur `.time` (PlayerControls.vue:98 l'a) → le tooltip tressaute.
- SeekBar.vue:121 — `pop-seek 0.5s` redémarre à chaque hover ; 120 ms suffisent.
- SeekBar.vue:68-69 — addEventListener manuel alors que `useMouseInElement` est déjà réactif ; `perc` et `time` pourraient être un seul computed.
- SeekBar.vue:116 — `flex: 1` sans ancêtre flex : déclaration morte.
- 4 border-radius en dur dupliquent `--bd-radius-lg`/`--bd-radius-sm` (le pont bearded-ui.css n'aliase pas les radius) ; 7 espacements sur 7 hors échelle `--space-*`.
- Aucun breakpoint littéral ; 5 var() sur 5 définies.
- Aucun test sur le mapping du seek, alors que volume.test.ts existe.

## Questions to Consider

1. Pourquoi le volume a-t-il reçu langage visuel, helper testé et quatre correctifs, et pas la seekbar — dix fois plus utilisée, et seule à piloter ce qu'on ne peut pas récupérer ?
2. Pourquoi la barre la plus large de l'interface ne porte-t-elle aucun chiffre, et pourquoi deux composants comptent-ils le temps séparément au lieu du store ?
3. « La lecture ne s'interrompt jamais » : ne jamais montrer d'attente, ou ne jamais faire attendre ?
