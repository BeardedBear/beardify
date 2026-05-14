<script setup lang="ts">
import { useUpdater } from "@/composables/useUpdater";

const { dismissed, downloadAndInstall, downloadProgress, status, updateVersion } = useUpdater();
</script>

<template>
  <Transition name="update-toast">
    <div
      v-if="!dismissed && (status === 'available' || status === 'downloading' || status === 'ready')"
      class="update-toast"
      role="status"
      aria-live="polite"
    >
      <div v-if="status === 'downloading'" class="toast-progress">
        <div class="toast-progress-bar" :style="{ width: `${downloadProgress}%` }" />
      </div>

      <div class="toast-body">
        <span class="toast-content">
          <template v-if="status === 'available'">Update {{ updateVersion }} available</template>
          <template v-else-if="status === 'downloading'">Downloading... {{ downloadProgress }}%</template>
          <template v-else-if="status === 'ready'">Restart to apply update</template>
        </span>

        <button v-if="status === 'available'" class="toast-action" @click="downloadAndInstall">
          Install
        </button>

        <button v-if="status === 'available'" class="toast-dismiss" aria-label="Dismiss" @click="dismissed = true">
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.update-toast {
  background: var(--bg-color-light);
  border: 1px solid var(--primary-color-dark);
  border-radius: 0.5rem;
  bottom: 1.5rem;
  box-shadow: 0 4px 20px rgb(0 0 0 / 30%);
  max-width: 360px;
  min-width: 260px;
  overflow: hidden;
  position: fixed;
  right: 1.5rem;
  z-index: 9998;
}

.toast-progress {
  background: var(--bg-color-dark);
  height: 2px;
}

.toast-progress-bar {
  background: var(--primary-color);
  height: 100%;
  transition: width 0.3s ease;
}

.toast-body {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
}

.toast-content {
  color: var(--font-color-light);
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-action {
  background: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: 0.375rem;
  color: white;
  cursor: pointer;
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  padding: 0.25rem 0.6rem;
  transition: background 0.15s;
  white-space: nowrap;

  &:hover {
    background: var(--primary-color-light);
    border-color: var(--primary-color-light);
  }
}

.toast-dismiss {
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: var(--font-color-dark);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  justify-content: center;
  padding: 0.25rem;
  transition: background 0.15s;

  &:hover {
    background: var(--bg-color-lighter);
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
