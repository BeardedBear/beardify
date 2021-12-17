<template>
  <div v-if="dialogStore.show" class="dialog">
    <div class="bg" :class="{ 'is-closing': dialogStore.isClosing }" @click="dialogStore.close()"></div>
    <div class="dialog-content" :class="{ 'is-closing': dialogStore.isClosing, big }">
      <div v-if="withTitle" class="head">
        <div>{{ title }}</div>
        <button class="close" @click="dialogStore.close()"><i class="icon-x" /></button>
      </div>
      <div class="content" :class="{ big }"><slot /></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDialog } from "./DialogStore";
import { defineProps } from "vue";

defineProps<{
  withTitle: boolean;
  title?: string;
  big?: boolean;
}>();

const dialogStore = useDialog();
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

$radius: 0.4rem;

.close {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 0.4rem;
  color: currentColor;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.4rem 0.5rem;
  position: absolute;
  right: 0.9rem;
  top: 50%;
  transform: translateY(-50%);

  &:hover {
    background-color: var(--bg-color);
  }
}

@keyframes pop-bg {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes bye-bg {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

.bg {
  animation: pop-bg 0.2s ease both;
  background-color: var(--bg-color-darker);
  filter: opacity(0.95);
  inset: 0;
  position: fixed;

  &.is-closing {
    animation: bye-bg 0.2s ease both;
  }
}

.dialog {
  display: grid;
  inset: 0;
  place-content: center;
  position: fixed;
  transition: 200ms;
  z-index: 99999999;
}

.head {
  background-color: var(--bg-color-light);
  border-radius: $radius $radius 0 0;
  font-size: 1rem;
  font-weight: 700;
  padding: 1rem 1.5rem;
  position: relative;
}

@keyframes pop-dialog-content {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bye-dialog-content {
  from {
    opacity: 1;
    transform: scale(1);
  }

  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

.dialog-content {
  animation: pop-dialog-content 0.2s ease both;
  background: var(--bg-color);
  border-radius: $radius;
  box-shadow: 0 1rem 1rem rgb(0 0 0 / 10%);
  display: grid;
  grid-template-rows: auto 1fr;
  position: relative;
  will-change: transform;

  &.is-closing {
    animation: bye-dialog-content 0.2s ease both;
  }
}

.content {
  max-height: 30rem;
  overflow: auto;
  width: 25rem;

  &.big {
    height: 80vh;
    max-height: 80vh;
    max-width: 90vw;
    width: 70rem;
  }
}
</style>
