<template>
  <div class="player-loading">
    <div class="player-loading__title">Choisir un périphérique de lecture :</div>
    <span v-if="playerStore.devices.list.length">
      <button
        v-for="(device, index) in playerStore.devices.list"
        :key="index"
        type="button"
        class="device button button--x-small"
        :class="{ me: playerStore.thisDeviceId === device.id }"
        @click="playerStore.setDevice(device)"
      >
        {{ device.name }}
      </button>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { usePlayer } from "./PlayerStore";

const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
.player-loading {
  background-color: var(--bg-color);
  display: grid;
  padding: 0.8rem;
  padding: 1.5rem;
  place-content: center;
  text-align: center;

  &__title {
    margin-bottom: 1rem;
  }
}

.me {
  position: relative;

  &::before {
    $s: 0.5rem;

    background: white;
    border-top-right-radius: 0.3rem;
    clip-path: polygon(0 0, 100% 0, 100% 100%);
    content: "";
    height: $s;
    position: absolute;
    right: 0;
    top: 0;
    width: $s;
  }
}
</style>
