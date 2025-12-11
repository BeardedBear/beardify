<template>
  <div class="dialog" v-if="dialogStore.show">
    <div
      v-show="!dialogStore.isMinimized"
      :class="{ 'is-closing': dialogStore.isClosing }"
      @click="dialogStore.close()"
      class="bg"
    ></div>
    <div
      ref="wrapperRef"
      v-motion
      :initial="{ scale: 0.8, opacity: 0, y: 30 }"
      :enter="{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }"
      :class="{ 'is-closing': dialogStore.isClosing, big, minimized: dialogStore.isMinimized }"
      class="wrapper"
    >
      <div class="pre-content" v-if="preContent">
        <slot name="pre-content" />
      </div>
      <div class="dialog-content">
        <div class="head" v-if="withTitle">
          <div>{{ title }}</div>
          <div class="head-buttons">
            <ButtonIndex v-if="withMinimize" no-default-class class="minimize" @click="handleMinimize">
              <i class="icon-minus" />
            </ButtonIndex>
            <ButtonIndex no-default-class class="close" @click="dialogStore.close()">
              <i class="icon-x" />
            </ButtonIndex>
          </div>
        </div>
        <div :class="{ big }" class="content"><slot /></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useMotion } from "@vueuse/motion";
import { ref, watch } from "vue";

import { useDialog } from "@/components/dialog/DialogStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";

defineProps<{
  big?: boolean;
  preContent?: boolean;
  title?: string;
  withMinimize?: boolean;
  withTitle: boolean;
}>();

const dialogStore = useDialog();
const wrapperRef = ref<HTMLElement | null>(null);

const handleMinimize = (): void => {
  if (!wrapperRef.value) return;

  const motion = useMotion(wrapperRef.value, {
    initial: {
      scale: 1,
      opacity: 1,
      x: 0,
      y: 0,
    },
  });

  motion.apply({
    scale: 0.1,
    opacity: 0,
    x: -window.innerWidth / 2 + 150,
    y: window.innerHeight / 2 - 100,
    transition: {
      duration: 400,
      ease: [0.4, 0, 0.2, 1],
    },
  });

  setTimeout(() => {
    dialogStore.minimize();
  }, 400);
};

watch(
  () => dialogStore.isMinimized,
  (isMinimized) => {
    if (!isMinimized && wrapperRef.value) {
      const motion = useMotion(wrapperRef.value, {});
      motion.apply({
        scale: 1,
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 20,
        },
      });
    }
  },
);
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/mixins" as mixins;

$radius: 2rem;

.head-buttons {
  display: flex;
  gap: 0.5rem;
  position: absolute;
  right: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
}

.close,
.minimize {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 1rem;
  color: currentcolor;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.4rem 0.5rem;

  @include mixins.squircle;

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
  background-color: #0d0d0d;
  filter: opacity(0.95);
  inset: 0;
  pointer-events: all;
  position: fixed;

  &.is-closing {
    animation: bye-bg 0.2s ease both;
  }
}

.dialog {
  display: grid;
  inset: 0;
  place-content: center;
  pointer-events: none;
  position: fixed;
  transition: 200ms;
  z-index: 99;
}

.head {
  background-color: var(--bg-color-light);
  border-radius: $radius $radius 0 0;
  font-size: 1rem;
  font-weight: 700;
  padding: 1rem 1.5rem;
  position: relative;

  @include mixins.squircle;
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

.pre-content {
  position: relative;
  z-index: 1;
}

.wrapper {
  animation: pop-dialog-content 0.2s ease both;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: all;
  position: relative;
  will-change: transform;

  &.is-closing {
    animation: bye-dialog-content 0.2s ease both;
  }

  &.minimized {
    pointer-events: none;
    visibility: hidden;
  }
}

.dialog-content {
  background: var(--bg-color);
  border-radius: $radius;
  box-shadow: 0 1rem 1rem rgb(0 0 0 / 10%);
  display: grid;
  grid-template-rows: auto 1fr;
  position: relative;

  @include mixins.squircle;
}

.content {
  max-height: 30rem;
  min-width: 25rem;
  overflow: auto;

  &.big {
    height: 80vh;
    max-height: 80vh;
    max-width: 90vw;
    width: 70rem;
  }
}
</style>
