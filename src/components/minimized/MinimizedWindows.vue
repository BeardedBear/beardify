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
      class="minimized-window bd-squircle"
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

  /*
   * Tracks the sidebar instead of guessing at it: 20rem was hardcoded against a
   * rail that is 19rem, 25rem on --hdpi, and gone entirely below 1024px, so the
   * pill sat under the sidebar on wide displays and floated into nothing on
   * tablet.
   */
  left: calc(var(--sidebar-width) + 1rem);
  pointer-events: none;
  position: fixed;
  z-index: 998;
}

.minimized-window {
  align-items: center;
  background-color: var(--bd-bg);
  border: 1px solid var(--bd-bg-light);
  border-radius: var(--bd-radius-lg);
  box-shadow: var(--bd-shadow-sm);
  display: flex;
  gap: var(--bd-space-2);
  padding: var(--bd-space-2);
  pointer-events: all;
  transition:
    background-color var(--bd-transition-fast),
    box-shadow var(--bd-transition-fast);
}

.window-content {
  align-items: center;
  cursor: pointer;
  display: flex;
  flex: 1;
  gap: var(--bd-space-2);

  i {
    color: var(--bd-primary);
    font-size: var(--bd-font-size-base);
  }

  span {
    color: var(--bd-font-color);
    font-size: var(--bd-font-size-sm);
    font-variation-settings: var(--bd-font-variation-settings-bold);
    font-weight: var(--bd-weight-bold-fallback);
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
  border-radius: var(--bd-radius-md);
  color: var(--bd-font-color-light);
  cursor: pointer;
  display: flex;
  font-size: var(--bd-font-size-xs);
  justify-content: center;
  opacity: 0;
  padding: var(--bd-space-1);
  transition:
    background-color var(--bd-transition),
    color var(--bd-transition);

  &:hover {
    background-color: var(--bd-hover-overlay);
    color: var(--bd-font-color);
  }

  i {
    display: block;
  }
}

.minimized-window:hover {
  background-color: var(--bd-bg-light);
  box-shadow: var(--bd-shadow-md);
  transform: translateY(-2px);

  .close-btn {
    opacity: 1;
  }
}
</style>
