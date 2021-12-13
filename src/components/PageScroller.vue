<template>
  <div ref="page" class="page">
    <slot />
    <div class="nav">
      <button class="button button--small" @click="scrollToTop()"><i class="icon-arrow-up"></i></button>
      <button class="button button--small" @click="scrollToBottom()"><i class="icon-arrow-down"></i></button>
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
  overflow-y: scroll;
  padding: 2rem 2.2rem;
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
  gap: 0.5rem;
  position: absolute;
  right: 2rem;
}
</style>
