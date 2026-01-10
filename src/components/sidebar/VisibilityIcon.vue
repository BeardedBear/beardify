<template>
  <i v-if="playlist.public && !playlist.collaborative" class="visibility-icon icon-public" title="Public" />
  <i v-if="playlist.collaborative" class="visibility-icon icon-collaborative" title="Collaborative" />
</template>

<script lang="ts" setup>
import { SimplifiedPlaylist } from "@/@types/Playlist";

defineProps<{
  playlist: SimplifiedPlaylist;
}>();
</script>

<style lang="scss" scoped>
.visibility-icon {
  font-size: var(--font-size-sm);
  margin-left: 1rem;
  opacity: 0.1;
}
</style>
