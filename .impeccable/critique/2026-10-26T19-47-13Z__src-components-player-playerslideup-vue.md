---
target: player-slide-up panel, mobile
total_score: 22
max_score: 36
na_heuristics: 10
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\germa\\wwwwin\\beardify\\src\\components\\player\\PlayerSlideUp.vue"
target_fingerprint: "sha256:973904233ccdc81bdc76a89eced83851b62b5af97cfeddab5a08349807fcb7ad"
target_path: "C:\\Users\\germa\\wwwwin\\beardify\\src\\components\\player\\PlayerSlideUp.vue"
timestamp: 2026-10-26T19-47-13Z
slug: src-components-player-playerslideup-vue
---
Method: dual-agent (A: a296a85ebd6953df2 · B: a402b964592b93c15). Source-only, mobile.
Score 22/36 (H10 n/a). H1=1 H2=2 H3=2 H4=2 H5=3 H6=2 H7=1 H8=2 H9=3 H10=n/a.
P0: no elapsed/total time on mobile (PlayerControls.vue .time display:none @--mobile; SeekBar preview hover-only).
P1: queue unreachable on mobile (QueuedTracks.vue .wrap display:none @--mobile, also inside panel).
P1: no visible dismiss (no handle/close button/swipe), instant close, no prefers-reduced-motion, touch-action pan-y with no gesture.
P2: safe area ignored (no env(safe-area-inset-bottom), viewport lacks viewport-fit=cover), no overscroll-behavior.
P2: weak album-first hierarchy: cover capped 250px, title lg, play button not emphasized, album link opacity 0.64, no album context.
Minor: dead CSS (.controls .extra, .more-info, duplicate cover rules, identical meta-header media queries, z-index in top layer), empty h2 when track null, artists <span @click> not focusable, volume wedge 24px tall without label, bounce-easing in QueuedTracks.vue:300.
