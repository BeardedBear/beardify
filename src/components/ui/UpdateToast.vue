<script setup lang="ts">
import { Download, Loader2, RefreshCw } from "@lucide/vue";

import { useUpdater } from "@/composables/useUpdater";

const { dismissed, downloadAndInstall, downloadProgress, restart, status, updateVersion } = useUpdater();
</script>

<template>
  <Transition name="update-toast">
    <div
      v-if="!dismissed && (status === 'available' || status === 'downloading' || status === 'ready')"
      class="update-toast"
      :class="{ pulse: status === 'available' }"
      role="status"
      aria-live="polite"
    >
      <div v-if="status === 'downloading'" class="toast-progress">
        <div class="toast-progress-bar" :style="{ transform: `scaleX(${downloadProgress / 100})` }" />
      </div>

      <div class="toast-body">
        <span class="toast-icon">
          <Download v-if="status === 'available'" :size="18" />
          <Loader2 v-else-if="status === 'downloading'" :size="18" class="spin" />
          <RefreshCw v-else-if="status === 'ready'" :size="18" />
        </span>

        <span class="toast-content">
          <template v-if="status === 'available'">Update {{ updateVersion }} available</template>
          <template v-else-if="status === 'downloading'">Downloading... {{ downloadProgress }}%</template>
          <template v-else-if="status === 'ready'">Restart to apply update</template>
        </span>

        <button v-if="status === 'available'" class="toast-action" @click="downloadAndInstall">
          Install
        </button>

        <button v-if="status === 'ready'" class="toast-action" @click="restart">
          Restart
        </button>

        <button v-if="status === 'available'" class="toast-dismiss" aria-label="Dismiss" @click="dismissed = true">
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes pulse-ring {
  0% {
    box-shadow:
      var(--bd-shadow-md),
      0 0 0 0 color-mix(in oklab, var(--bd-primary) 55%, transparent);
  }

  70% {
    box-shadow:
      var(--bd-shadow-md),
      0 0 0 0.6rem color-mix(in oklab, var(--bd-primary) 0%, transparent);
  }

  100% {
    box-shadow:
      var(--bd-shadow-md),
      0 0 0 0 color-mix(in oklab, var(--bd-primary) 0%, transparent);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.update-toast {
  background: linear-gradient(135deg, var(--bd-primary-dark), var(--bd-primary-darker));
  border-radius: var(--bd-radius-md);
  bottom: 1.5rem;
  box-shadow: var(--bd-shadow-md);
  max-width: 400px;
  min-width: 300px;
  overflow: hidden;
  position: fixed;
  right: 1.5rem;
  z-index: 9998;

  &.pulse {
    animation: pulse-ring 2s ease-out 2;
  }
}

.toast-progress {
  background: rgb(0 0 0 / 25%);
  height: 3px;
}

.toast-progress-bar {
  background: var(--bd-on-primary);
  height: 100%;
  transform-origin: left center;
  transition: transform var(--bd-duration) ease;
  width: 100%;
}

.toast-body {
  align-items: center;
  display: flex;
  gap: var(--bd-space-2);
  padding: var(--bd-space-4);
}

.toast-icon {
  align-items: center;
  color: var(--bd-on-primary);
  display: flex;
  flex-shrink: 0;

  .spin {
    animation: spin 1s linear infinite;
  }
}

.toast-content {
  color: var(--bd-on-primary);
  flex: 1;
  font-variation-settings: var(--bd-font-variation-settings-bold);
  font-weight: var(--bd-weight-bold-fallback);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-action {
  background: var(--bd-on-primary);
  border: 1px solid var(--bd-on-primary);
  border-radius: var(--bd-radius-sm);
  color: var(--bd-primary-dark);
  cursor: pointer;
  flex-shrink: 0;
  font-variation-settings: var(--bd-font-variation-settings-bold);
  font-weight: var(--bd-weight-bold-fallback);
  padding: var(--bd-space-1) var(--bd-space-3);
  transition: opacity var(--bd-transition-fast);
  white-space: nowrap;

  &:hover {
    opacity: 0.85;
  }
}

.toast-dismiss {
  align-items: center;
  background: transparent;
  border: none;
  border-radius: var(--bd-radius-sm);
  color: rgb(255 255 255 / 70%);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: var(--bd-font-size-xs);
  justify-content: center;
  padding: var(--bd-space-1);
  transition: background var(--bd-transition-fast);

  &:hover {
    background: rgb(255 255 255 / 15%);
    color: var(--bd-on-primary);
  }
}

.update-toast-enter-active,
.update-toast-leave-active {
  transition:
    opacity var(--bd-transition),
    transform var(--bd-transition);
}

.update-toast-enter-from,
.update-toast-leave-to {
  opacity: 0;
  transform: translateY(0.75rem);
}
</style>
