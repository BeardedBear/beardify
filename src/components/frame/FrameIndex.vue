<template>
  <div v-if="frameStore.show" class="frame">
    <div
v-show="!frameStore.isMinimized" :class="{ 'is-closing': frameStore.isClosing }" class="bg"
      @click="frameStore.close()"
/>
    <div
ref="wrapperRef" v-motion :initial="{ scale: 0.8, opacity: 0, y: 50 }"
      :enter="{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }"
      :class="{ 'is-closing': frameStore.isClosing, minimized: frameStore.isMinimized }" class="iframe-wrap"
>
      <BdLoader class="load" />
      <div class="head">
        <div>{{ frameStore.siteName }}</div>
        <div class="right">
          <BdButton :href="frameStore.url" size="small" target="_blank">Open in a new tab</BdButton>
          <BdButton size="small" @click="handleMinimize">Minimize</BdButton>
          <BdButton size="small" @click="frameStore.close()">Close</BdButton>
        </div>
      </div>
      <iframe :src="frameStore.url" border="0" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useMotion } from "@vueuse/motion";
import { BdButton, BdLoader } from "bearded-ui";
import { ref, watch } from "vue";

import { useFrame } from "@/components/frame/FrameStore";

const frameStore = useFrame();
const wrapperRef = ref<HTMLElement | null>(null);

const handleMinimize = (): void => {
  if (!wrapperRef.value) return;

  const motion = useMotion(wrapperRef.value, {
    initial: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
    },
  });

  motion.apply({
    opacity: 0,
    scale: 0.1,
    transition: {
      duration: 400,
      ease: [0.4, 0, 0.2, 1],
    },
    x: -window.innerWidth / 2 + 150,
    y: window.innerHeight / 2 - 100,
  });

  setTimeout(() => {
    frameStore.minimize();
  }, 400);
};

watch(
  () => frameStore.isMinimized,
  (isMinimized) => {
    if (!isMinimized && wrapperRef.value) {
      const motion = useMotion(wrapperRef.value, {});
      motion.apply({
        opacity: 1,
        scale: 1,
        transition: {
          damping: 20,
          stiffness: 200,
          type: "spring",
        },
        x: 0,
        y: 0,
      });
    }
  },
);
</script>

<style scoped>
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

/*
 * Uses the individual `scale` property so it composes with the inline
 * `transform` @vueuse/motion leaves behind after the opening spring instead of
 * fighting it. Timed to match the 200ms the store waits before unmounting.
 */
@keyframes bye-frame {
  from {
    opacity: 1;
    scale: 1;
  }

  to {
    opacity: 0;
    scale: 0.9;
  }
}

.bg {
  animation: pop-bg 0.2s ease both;
  background-color: var(--bg-color-darker);
  filter: opacity(0.95);
  inset: 0;
  pointer-events: all;
  position: fixed;

  &.is-closing {
    animation: bye-bg 0.2s ease both;
  }
}

.head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;

  .right {
    display: flex;
    gap: 0.5rem;
  }
}

.frame {
  display: grid;
  height: 100%;
  place-items: center center;
  pointer-events: none;
  position: fixed;
  width: 100%;
  z-index: 999;

  /*
   * Centred with auto margins, not a transform: BdLoader spins with the
   * `rotate` property, and a `transform` here would compose with it into an
   * orbit around a point half the loader away.
   */
  .load {
    inset: 0;
    margin: auto;
    position: absolute;
  }
}

.iframe-wrap {
  background-color: var(--bg-color);
  border-radius: 15px;
  pointer-events: all;
  z-index: 1000;

  /* The whole box leaves as one piece — panel, header and iframe together. */
  &.is-closing {
    animation: bye-frame 0.2s ease both;
    pointer-events: none;
  }

  &.minimized {
    pointer-events: none;
    visibility: hidden;
  }
}

iframe {
  animation: pop-bg 0.2s ease both;
  border: 0;
  border-radius: 10px;
  height: 80dvh;
  width: 80vw;
}
</style>
