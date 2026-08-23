<template>
  <div class="minimized-windows">
    <div
      v-if="frameStore.show && frameStore.isMinimized"
      v-motion
      :initial="{ scale: 0, opacity: 0, x: -50 }"
      :enter="{
        scale: 1,
        opacity: 1,
        x: 0,
        transition: { type: 'spring', stiffness: 260, damping: 20 },
      }"
      :leave="{ scale: 0, opacity: 0, x: -50, transition: { duration: 200 } }"
      class="minimized-window squircle"
    >
      <div class="window-content" @click="frameStore.restore()">
        <i class="icon-external-link" />
        <span>{{ frameStore.siteName || "Frame" }}</span>
      </div>
      <button
        class="close-btn"
        aria-label="Close frame"
        @click.stop="frameStore.close()"
      >
        <i class="icon-x" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useFrame } from "@/components/frame/FrameStore";

const frameStore = useFrame();

</script>

<style scoped>

.minimized-windows {
  bottom: 7rem;
  display: flex;
  flex-direction: column;
  left: 20rem;
  pointer-events: none;
  position: fixed;
  z-index: 998;
}

.minimized-window {
  align-items: center;
  background-color: var(--bg-color);
  border: 1px solid var(--bg-color-light);
  border-radius: 1rem;
  box-shadow: 0 0.5rem 1rem rgb(0 0 0 / 20%);
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  pointer-events: all;
  transition:
      background-color 0.1s ease,
      box-shadow 0.1s ease;
}

.window-content {
  align-items: center;
  cursor: pointer;
  display: flex;
  flex: 1;
  gap: 0.5rem;

  i {
    color: var(--primary-color);
    font-size: var(--font-size-base);
  }

  span {
    color: var(--font-color);
    font-size: var(--font-size-sm);
    font-variation-settings: var(--font-variation-settings-bold);
    font-weight: var(--font-weight-bold);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.close-btn {
  align-items: center;
  background-color: transparent;
  border: 0;
  border-radius: 0.5rem;
  color: var(--font-color-light);
  cursor: pointer;
  display: flex;
  font-size: var(--font-size-xs);
  justify-content: center;
  opacity: 0;
  padding: 0.25rem;
  transition:
      background-color 0.2s ease,
      color 0.2s ease;

  &:hover {
    background-color: var(--bg-color);
    color: var(--font-color);
  }

  i {
    display: block;
  }
}

.minimized-window:hover {
  background-color: var(--bg-color-light);
  box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 30%);
  transform: translateY(-2px);

  .close-btn {
    opacity: 1;
  }
}
</style>
