<template>
  <div v-if="playerStore.devices.activeDevice.id" class="wrap">
    <div class="device">
      <DeviceVolume :force-mobile />
      <DevicesList />
    </div>
  </div>
  <BdEmptyState
    v-else-if="showNoDeviceHint"
    action-label="Refresh"
    message="Open Spotify on this computer or another device to control playback here."
    title="No active device"
    @action="playerStore.getExternalPlayerState()"
  >
    <template #icon><i class="icon-speaker" /></template>
  </BdEmptyState>
  <div v-else class="options">
    <BdLoader />
  </div>
</template>

<script lang="ts" setup>
import { BdEmptyState, BdLoader } from "bearded-ui";
import { onUnmounted, ref, watch } from "vue";

import DevicesList from "@/components/player/device/DeviceList.vue";
import DeviceVolume from "@/components/player/device/DeviceVolume.vue";
import { usePlayer } from "@/components/player/PlayerStore";

// Mirrors PlayerIndex's LOADING_WATCHDOG_MS: give the SDK a chance to report an
// active device before telling the user nothing is playing anywhere.
const NO_DEVICE_HINT_MS = 5000;

const props = defineProps<{ forceMobile?: boolean }>();
const playerStore = usePlayer();
const forceMobile = props.forceMobile ?? false;

const showNoDeviceHint = ref(false);
let hintTimer: number | undefined;

watch(
  () => playerStore.devices.activeDevice.id,
  (id) => {
    window.clearTimeout(hintTimer);
    showNoDeviceHint.value = false;
    if (!id) hintTimer = window.setTimeout(() => (showNoDeviceHint.value = true), NO_DEVICE_HINT_MS);
  },
  { immediate: true },
);

onUnmounted(() => window.clearTimeout(hintTimer));
</script>

<style scoped>

.wrap {
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: end;

  @media (--mobile) {
    justify-content: center;
  }
}

/*
 * Pas de `text-align: right` ici : le flex fait déjà le placement, et
 * l'alignement héritait jusque dans le panneau de la file d'attente, où chaque
 * ligne se calait à droite dans une boîte à la largeur de son texte le plus
 * long — rendu en dents de scie.
 */
.device {
  align-items: center;
  display: flex;
  gap: var(--bd-space-4);
}
</style>
