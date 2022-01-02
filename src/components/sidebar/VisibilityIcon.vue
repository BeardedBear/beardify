<template>
  <i v-if="playlist.public && !playlist.collaborative" class="visibility-icon icon-public" title="Public" />
  <i v-if="playlist.collaborative" class="visibility-icon icon-users" title="Collaborative" />
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { SimplifiedPlaylist } from "../../@types/Playlist";

defineProps<{
  playlist: SimplifiedPlaylist;
}>();
</script>

<style lang="scss" scoped>
.visibility-icon {
  margin-left: 1rem;
  opacity: 0.1;
}
</style>
