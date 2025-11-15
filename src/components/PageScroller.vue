<template>
  <div class="page" ref="page">
    <slot />
    <div class="nav">
      <button @click="scrollToTop()" class="button button-small">
        <i class="icon-arrow-up"></i>
      </button>
      <button @click="scrollToBottom()" class="button button-small">
        <i class="icon-arrow-down"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";

const page = ref<HTMLElement | null>(null);
const route = useRoute();

// Save scroll position to sessionStorage when leaving
onUnmounted(() => {
  if (page.value) {
    sessionStorage.setItem(`scroll-${route.path}`, String(page.value.scrollTop));
  }
});

// Restore scroll position when mounted
onMounted(() => {
  if (page.value) {
    const savedPosition = sessionStorage.getItem(`scroll-${route.path}`);
    if (savedPosition) {
      page.value.scrollTop = parseInt(savedPosition);
    }
  }
});

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
  bottom: 7rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: absolute;
  right: 1.5rem;
  z-index: 4;
}
</style>
