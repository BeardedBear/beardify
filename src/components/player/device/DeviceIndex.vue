<template>
  <div v-if="playerStore.devices.activeDevice.id" class="wrap">
    <div class="device">
      <DeviceVolume :force-mobile />
      <DevicesList :force-mobile />
    </div>
  </div>
  <BdEmptyState
    v-else-if="showNoDeviceHint"
    :action-label="reconnecting ? 'Connecting…' : 'Use this browser'"
    message="Play in this browser, or open Spotify on another device to control it from here."
    title="No active device"
    @action="useThisBrowser"
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

import { NotificationType } from "@/@types/Notification";
import DevicesList from "@/components/player/device/DeviceList.vue";
import DeviceVolume from "@/components/player/device/DeviceVolume.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import { notification } from "@/helpers/notifications";

// Mirrors PlayerIndex's LOADING_WATCHDOG_MS: give the SDK a chance to report an
// active device before telling the user nothing is playing anywhere.
const NO_DEVICE_HINT_MS = 5000;

const props = defineProps<{ forceMobile?: boolean }>();
const playerStore = usePlayer();
const forceMobile = props.forceMobile ?? false;

const showNoDeviceHint = ref(false);
const reconnecting = ref(false);
let hintTimer: number | undefined;

/**
 * Nothing is active anywhere (the usual state after a long absence): `me/player` answers 204, so
 * re-reading it alone changes nothing. Revive the SDK, then claim this browser's own device —
 * the one Beardify always has — the way the official client takes over when nothing plays.
 */
async function useThisBrowser(): Promise<void> {
  if (reconnecting.value) return;
  reconnecting.value = true;
  try {
    await playerStore.resyncPlayback();
    if (!playerStore.devices.activeDevice.id && playerStore.thisDeviceId) {
      await playerStore.setDevice(playerStore.thisDeviceId);
    }
  } finally {
    reconnecting.value = false;
  }
  if (!playerStore.devices.activeDevice.id) {
    notification({
      msg: "Couldn't connect this browser to Spotify. Reload the page and try again.",
      type: NotificationType.Warning,
    });
  }
}

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

  /* In the slide-up, a long device name drops the volume onto its own line rather than squeezing it. */
  @media (--mobile) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
