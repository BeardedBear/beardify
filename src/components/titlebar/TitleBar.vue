<script lang="ts" setup>
import { Copy, Minus, Square, X } from "@lucide/vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import { usePlayer } from "@/components/player/PlayerStore";
import { getWindowTitle } from "@/helpers/windowTitle";

/*
 * Custom title bar for the Tauri desktop build (the native one is removed via
 * `decorations(false)` in lib.rs). The header itself is the drag region:
 * `data-tauri-drag-region` must sit on every element that should start a drag
 * when pressed, because the runtime checks the mousedown target only. A
 * double-click on those same elements toggles maximize (handled natively).
 */
const win = getCurrentWindow();
const player = usePlayer();

const isMaximized = ref(false);
let unlistenResized: (() => void) | undefined;

const title = computed(() => getWindowTitle(player.playerState.track_window?.current_track));

const minimize = (): void => {
  win.minimize().catch(() => undefined);
};

const toggleMaximize = (): void => {
  const action = isMaximized.value ? win.unmaximize() : win.maximize();
  action.catch(() => undefined);
};

const close = (): void => {
  win.close().catch(() => undefined);
};

onMounted(async () => {
  isMaximized.value = await win.isMaximized().catch(() => false);
  unlistenResized = await win.onResized(async () => {
    isMaximized.value = await win.isMaximized().catch(() => isMaximized.value);
  });
});

onBeforeUnmount(() => {
  unlistenResized?.();
});
</script>

<template>
  <header class="titlebar" data-tauri-drag-region>
    <div class="titlebar-brand" data-tauri-drag-region>
      <img alt="" class="titlebar-logo" data-tauri-drag-region src="/img/logo.svg" />
      <span class="titlebar-title" data-tauri-drag-region>{{ title }}</span>
    </div>
    <div class="titlebar-controls">
      <button aria-label="Minimize" class="titlebar-button" type="button" @click="minimize">
        <Minus :size="16" />
      </button>
      <button
        :aria-label="isMaximized ? 'Restore' : 'Maximize'"
        class="titlebar-button"
        type="button"
        @click="toggleMaximize"
      >
        <Copy v-if="isMaximized" :size="13" />
        <Square v-else :size="12" />
      </button>
      <button aria-label="Close" class="titlebar-button close" type="button" @click="close">
        <X :size="16" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.titlebar {
  --titlebar-height: 2.25rem;

  align-items: center;
  background: var(--bg-color-darker);
  border-bottom: 1px solid color-mix(in oklab, var(--font-color) 8%, transparent);
  display: flex;
  height: var(--titlebar-height);
  justify-content: space-between;
  padding-left: 0.75rem;
  user-select: none;
}

.titlebar-brand {
  align-items: center;
  display: flex;
  gap: 0.6rem;
  min-width: 0;
}

.titlebar-logo {
  height: 1.1rem;
  opacity: 0.7;
}

.titlebar-title {
  color: var(--font-color-dark);
  font-size: var(--font-size-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.titlebar-controls {
  display: flex;
  height: 100%;
}

.titlebar-button {
  align-items: center;
  background: transparent;
  border: none;
  color: var(--font-color-dark);
  cursor: default;
  display: flex;
  justify-content: center;
  transition: background-color 0.15s ease;
  width: 2.75rem;

  &:hover {
    background-color: var(--bg-color-lighter);
    color: var(--font-color);
  }

  &.close:hover {
    background-color: #e81123;
    color: white;
  }
}
</style>
