<template>
  <i
    v-if="authStore.me?.id === playlist.owner.id && !playlist.name.includes('#Collection')"
    class="type-icon icon-music"
  />
  <i
    v-if="
      authStore.me?.id !== playlist.owner.id &&
      playlist.owner.display_name !== 'Spotify' &&
      !playlist.name.includes('#Collection')
    "
    class="type-icon others icon-music"
  />
  <i
    v-if="authStore.me?.id === playlist.owner.id && playlist.name.includes('#Collection')"
    class="type-icon icon-folder"
  />
  <i
    v-if="authStore.me?.id !== playlist.owner.id && playlist.name.includes('#Collection')"
    class="type-icon others icon-folder"
  />
  <i v-if="playlist.owner.display_name === 'Spotify'" class="type-icon icon-spotify" />
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { SimplifiedPlaylist } from "../../@types/Playlist";
import { useAuth } from "../../views/auth/AuthStore";

defineProps<{
  playlist: SimplifiedPlaylist;
}>();

const authStore = useAuth();
</script>

<style lang="scss" scoped>
.type-icon {
  margin-right: 1rem;
  opacity: 0.3;
  position: relative;

  &.others {
    &::after {
      $size: 0.2rem;

      background-color: currentColor;
      border-radius: 100%;
      content: "";
      height: $size;
      position: absolute;
      right: -0.2rem;
      top: -0.2rem;
      width: $size;
    }
  }
}

.icon-spotify {
  color: #2da75b;
  opacity: 0.5;
}
</style>
