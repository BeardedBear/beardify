<template>
  <i class="visibility-icon icon-public" title="Public" v-if="playlist.public && !playlist.collaborative" />
  <i class="visibility-icon icon-collaborative" title="Collaborative" v-if="playlist.collaborative" />
</template>

<script lang="ts" setup>
import { SimplifiedPlaylist } from "../../@types/Playlist";

defineProps<{
  playlist: SimplifiedPlaylist;
}>();
</script>

<style lang="scss" scoped>
.visibility-icon {
  font-size: 0.8rem;
  margin-left: 1rem;
  opacity: 0.1;
}
</style>
