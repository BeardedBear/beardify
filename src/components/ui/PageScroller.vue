<template>
  <div ref="page" class="page" @scroll="onScroll">
    <slot />
    <div class="nav">
      <BdButton icon-only size="small" @click="scrollToTop()">
        <i class="icon-arrow-up" />
      </BdButton>
      <BdButton icon-only size="small" @click="scrollToBottom()">
        <i class="icon-arrow-down" />
      </BdButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdButton } from "bearded-ui";
import { ref } from "vue";
import { useRoute } from "vue-router";

import { useScrollRestore } from "@/composables/useScrollRestore";

const page = ref<HTMLElement | null>(null);
const { onScroll, restoreScroll } = useScrollRestore(`scroll-${useRoute().path}`, page);

defineExpose({ restoreScroll });

function scrollToBottom(): void {
  if (page.value) page.value.scrollTop = page.value.scrollHeight;
}

function scrollToTop(): void {
  if (page.value) page.value.scrollTop = 0;
}
</script>

<style scoped>
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
