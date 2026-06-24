import { nextTick, onActivated, onDeactivated, onMounted, onUnmounted, type Ref } from "vue";

export function useScrollRestore(key: string, scrollRef: Ref<HTMLElement | null>): { onScroll: () => void } {
  let lastScrollTop = 0;

  function onScroll(): void {
    if (scrollRef.value) lastScrollTop = scrollRef.value.scrollTop;
  }

  function restoreScroll(): void {
    const saved = sessionStorage.getItem(key);
    if (!saved || !scrollRef.value) return;
    nextTick(() => {
      if (!scrollRef.value) return;
      const prev = scrollRef.value.style.scrollBehavior;
      scrollRef.value.style.scrollBehavior = "auto";
      scrollRef.value.scrollTop = parseInt(saved);
      scrollRef.value.style.scrollBehavior = prev;
    });
  }

  function saveScroll(): void {
    sessionStorage.setItem(key, String(lastScrollTop));
  }

  onDeactivated(saveScroll);
  onUnmounted(saveScroll);
  onActivated(restoreScroll);
  onMounted(restoreScroll);

  return { onScroll };
}
