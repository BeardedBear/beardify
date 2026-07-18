<script setup lang="ts">
import { Download, Loader2, RefreshCw } from "@lucide/vue";

import { useUpdater } from "@/composables/useUpdater";

const { devSimulateUpdate, dismissed, downloadAndInstall, downloadProgress, restart, status, updateVersion }
  = useUpdater();

const isDev = import.meta.env.DEV;
</script>

<template>
  <button
    v-if="isDev"
    class="dev-trigger"
    type="button"
    title="Simulate update toast (dev only)"
    @click="devSimulateUpdate"
  >
    🧪 Simulate update
  </button>

  <Transition name="update-toast">
    <div
      v-if="!dismissed && (status === 'available' || status === 'downloading' || status === 'ready')"
      class="update-toast"
      :class="{ pulse: status === 'available' }"
      role="status"
      aria-live="polite"
    >
      <div v-if="status === 'downloading'" class="toast-progress">
        <div class="toast-progress-bar" :style="{ width: `${downloadProgress}%` }" />
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

<style scoped lang="scss">
@keyframes pulse-ring {
  0% {
    box-shadow:
      0 6px 24px rgb(0 0 0 / 40%),
      0 0 0 0 rgb(144 100 255 / 55%);
  }

  70% {
    box-shadow:
      0 6px 24px rgb(0 0 0 / 40%),
      0 0 0 0.6rem rgb(144 100 255 / 0%);
  }

  100% {
    box-shadow:
      0 6px 24px rgb(0 0 0 / 40%),
      0 0 0 0 rgb(144 100 255 / 0%);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dev-trigger {
  background: var(--bg-color-lighter);
  border: 1px solid var(--primary-color-dark);
  border-radius: 0.375rem;
  bottom: 3rem;
  color: var(--font-color-light);
  cursor: pointer;
  left: 3rem;
  padding: 0.35rem 0.6rem;
  position: fixed;
  z-index: 9998;

  &:hover {
    background: var(--bg-color-light);
  }
}

.update-toast {
  background: linear-gradient(135deg, var(--primary-color-dark), var(--primary-color-darker));
  border-radius: 0.6rem;
  bottom: 1.5rem;
  box-shadow: 0 6px 24px rgb(0 0 0 / 40%);
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
  background: #fff;
  height: 100%;
  transition: width 0.3s ease;
}

.toast-body {
  align-items: center;
  display: flex;
  gap: 0.6rem;
  padding: 1rem;
}

.toast-icon {
  align-items: center;
  color: #fff;
  display: flex;
  flex-shrink: 0;

  .spin {
    animation: spin 1s linear infinite;
  }
}

.toast-content {
  color: #fff;
  flex: 1;
  font-weight: 700;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-action {
  background: #fff;
  border: 1px solid #fff;
  border-radius: 0.375rem;
  color: var(--primary-color-dark);
  cursor: pointer;
  flex-shrink: 0;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  transition: opacity 0.15s;
  white-space: nowrap;

  &:hover {
    opacity: 0.85;
  }
}

.toast-dismiss {
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: rgb(255 255 255 / 70%);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  justify-content: center;
  padding: 0.25rem;
  transition: background 0.15s;

  &:hover {
    background: rgb(255 255 255 / 15%);
    color: #fff;
  }
}

.update-toast-enter-active,
.update-toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.update-toast-enter-from,
.update-toast-leave-to {
  opacity: 0;
  transform: translateY(0.75rem);
}
</style>
