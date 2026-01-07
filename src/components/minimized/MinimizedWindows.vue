<template>
  <div class="minimized-windows">
    <div
      v-if="dialogStore.show && dialogStore.isMinimized"
      v-motion
      :initial="{ scale: 0, opacity: 0, x: -50 }"
      :enter="{ scale: 1, opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }"
      :leave="{ scale: 0, opacity: 0, x: -50, transition: { duration: 200 } }"
      class="minimized-window"
    >
      <div class="window-content" @click="dialogStore.restore()">
        <i class="icon-message-square" />
        <span>{{ getDialogTitle() }}</span>
      </div>
      <button class="close-btn" @click.stop="dialogStore.close()" aria-label="Close dialog">
        <i class="icon-x" />
      </button>
    </div>

    <div
      v-if="frameStore.show && frameStore.isMinimized"
      v-motion
      :initial="{ scale: 0, opacity: 0, x: -50 }"
      :enter="{ scale: 1, opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }"
      :leave="{ scale: 0, opacity: 0, x: -50, transition: { duration: 200 } }"
      class="minimized-window"
    >
      <div class="window-content" @click="frameStore.restore()">
        <i class="icon-external-link" />
        <span>{{ frameStore.siteName || "Frame" }}</span>
      </div>
      <button class="close-btn" @click.stop="frameStore.close()" aria-label="Close frame">
        <i class="icon-x" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDialog } from "@/components/dialog/DialogStore";
import { useFrame } from "@/components/frame/FrameStore";

const dialogStore = useDialog();
const frameStore = useFrame();

const getDialogTitle = (): string => {
  switch (dialogStore.type) {
    case "addalbum":
      return "Add album";
    case "addSong":
      return "Add to playlist";
    case "createCollection":
      return "Create collection";
    case "createPlaylist":
      return "Create playlist";
    case "editPlaylist":
      return "Edit playlist";
    case "search":
      return "Search";
    case "widevine":
      return "Widevine Warning";
    default:
      return "Dialog";
  }
};
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

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
  transition: all 0.1s ease;

  @include squircle;
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
    @include font-bold;

    color: var(--font-color);
    font-size: var(--font-size-md);
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
  font-size: var(--font-size-sm);
  justify-content: center;
  opacity: 0;
  padding: 0.25rem;
  transition: all 0.2s ease;

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
