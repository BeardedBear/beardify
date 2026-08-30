<template>
  <div v-if="playerStore.devices.activeDevice.id" class="wrap">
    <div class="device">
      <DeviceVolume :force-mobile />
      <DevicesList />
    </div>
  </div>
  <div v-else class="options">
    <BdLoader />
  </div>
</template>

<script lang="ts" setup>
import { BdLoader } from "bearded-ui";

import DevicesList from "@/components/player/device/DeviceList.vue";
import DeviceVolume from "@/components/player/device/DeviceVolume.vue";
import { usePlayer } from "@/components/player/PlayerStore";

const props = defineProps<{ forceMobile?: boolean }>();
const playerStore = usePlayer();
const forceMobile = props.forceMobile ?? false;
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
