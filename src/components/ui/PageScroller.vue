<template>
  <div ref="page" class="page" @scroll="onScroll">
    <slot />
    <div class="nav">
      <ButtonIndex icon-only size="small" @click="scrollToTop()">
        <i class="icon-arrow-up" />
      </ButtonIndex>
      <ButtonIndex icon-only size="small" @click="scrollToBottom()">
        <i class="icon-arrow-down" />
      </ButtonIndex>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onActivated, onDeactivated, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";

import ButtonIndex from "@/components/ui/ButtonIndex.vue";

const page = ref<HTMLElement | null>(null);
// Capture path at creation time — route.path changes before onDeactivated fires
const scrollKey = `scroll-${useRoute().path}`;
// Track scroll position continuously. keep-alive detaches the DOM on deactivate,
// which resets scrollTop to 0, so reading it in the hook gives the wrong value.
let lastScrollTop = 0;

function onScroll(): void {
  if (page.value) lastScrollTop = page.value.scrollTop;
}

function restoreScroll(): void {
  const saved = sessionStorage.getItem(scrollKey);
  if (!saved || !page.value) return;
  const target = parseInt(saved);
  // Wait for the kept-alive DOM to be reattached before setting scrollTop.
  // Disable smooth scroll so the restore is instant (no visible animation).
  nextTick(() => {
    if (!page.value) return;
    const previous = page.value.style.scrollBehavior;
    page.value.style.scrollBehavior = "auto";
    page.value.scrollTop = target;
    page.value.style.scrollBehavior = previous;
  });
}

function saveScroll(): void {
  sessionStorage.setItem(scrollKey, String(lastScrollTop));
}

onUnmounted(saveScroll);
onDeactivated(saveScroll);
onMounted(restoreScroll);
onActivated(restoreScroll);

function scrollToBottom(): void {
  if (page.value) page.value.scrollTop = page.value.scrollHeight;
}

function scrollToTop(): void {
  if (page.value) page.value.scrollTop = 0;
}
</script>

<style lang="scss" scoped>
.page {
  animation: pop-content 1s ease both;
  display: grid;
  overflow-y: scroll;
  scroll-behavior: smooth;
}

@keyframes pop-nav {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.nav {
  animation: pop-nav 0.5s ease 0.5s both;
  bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: absolute;
  right: 1.5rem;
  z-index: 4;
}
</style>
