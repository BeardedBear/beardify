import { onActivated, onDeactivated, onMounted, onUnmounted, type Ref } from "vue";

// How long to keep pinning the saved position while content streams in.
const RESTORE_TIMEOUT_MS = 3000;
// Consider the layout settled once the scroll height stays unchanged this many
// consecutive frames (~10 frames ≈ 160ms at 60fps).
const SETTLE_FRAMES = 10;

export function useScrollRestore(
  key: string,
  scrollRef: Ref<HTMLElement | null>,
): { onScroll: () => void; restoreScroll: () => void } {
  let lastScrollTop = 0;
  let rafId = 0;
  let isRestoring = false;
  let detachAbort: (() => void) | null = null;

  function onScroll(): void {
    // Ignore the programmatic scrollTop writes performed during restore. Late
    // content shifts (reclassification, etc.) clamp scrollTop and would otherwise
    // pollute the saved value, making it drift on every round-trip.
    if (isRestoring) return;
    if (scrollRef.value) lastScrollTop = scrollRef.value.scrollTop;
  }

  function stopRestore(): void {
    isRestoring = false;
    cancelAnimationFrame(rafId);
    if (scrollRef.value) scrollRef.value.style.scrollBehavior = "";
    detachAbort?.();
    detachAbort = null;
  }

  function restoreScroll(): void {
    const saved = sessionStorage.getItem(key);
    if (!saved) return;
    const target = parseInt(saved);

    stopRestore();
    if (target <= 0) return;

    isRestoring = true;
    // Persist the intended position even if the user never scrolls again, so the
    // next save doesn't overwrite it with 0.
    lastScrollTop = target;

    // Abort as soon as the user takes over — their intent wins over restoration.
    const onUserInput = (): void => {
      if (scrollRef.value) lastScrollTop = scrollRef.value.scrollTop;
      stopRestore();
    };
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    events.forEach((e) => window.addEventListener(e, onUserInput, { passive: true }));
    detachAbort = (): void => events.forEach((e) => window.removeEventListener(e, onUserInput));

    const start = performance.now();
    let lastHeight = -1;
    let stableFrames = 0;

    // Disable smooth scrolling for the duration of the restore so every
    // programmatic scrollTop write takes effect instantly. Restored in stopRestore.
    if (scrollRef.value) scrollRef.value.style.scrollBehavior = "auto";

    // Content (albums, EPs, reclassified live/compilation lists…) keeps loading
    // and resizing the page after navigation. Pin the target every frame until
    // the height settles (layout stable) or we time out.
    const apply = (): void => {
      const el = scrollRef.value;
      if (el) {
        el.scrollTop = target;

        if (el.scrollHeight === lastHeight) {
          stableFrames += 1;
        } else {
          stableFrames = 0;
          lastHeight = el.scrollHeight;
        }

        // Settled: height stable for a while and we managed to reach the target
        // (or the page is simply shorter than the target — nothing more to do).
        const reached = Math.abs(el.scrollTop - target) <= 1;
        if (stableFrames >= SETTLE_FRAMES && (reached || el.scrollHeight <= target)) {
          stopRestore();
          return;
        }
      }

      if (performance.now() - start < RESTORE_TIMEOUT_MS) {
        rafId = requestAnimationFrame(apply);
      } else {
        stopRestore();
      }
    };

    rafId = requestAnimationFrame(apply);
  }

  function saveScroll(): void {
    sessionStorage.setItem(key, String(lastScrollTop));
  }

  onDeactivated(saveScroll);
  onUnmounted(() => {
    stopRestore();
    saveScroll();
  });
  onActivated(restoreScroll);
  onMounted(restoreScroll);

  return { onScroll, restoreScroll };
}
