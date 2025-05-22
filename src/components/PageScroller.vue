<template>
  <div class="page" ref="page">
    <slot />
    <div class="nav">
      <button @click="scrollToTop()" class="button button--small">
        <i class="icon-arrow-up" />
      </button>
      <button @click="scrollToBottom()" class="button button--small">
        <i class="icon-arrow-down" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const page = ref<HTMLElement | null>(null);

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
