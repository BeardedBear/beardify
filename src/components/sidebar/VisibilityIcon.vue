<template>
  <BdTooltip v-if="playlist.public && !playlist.collaborative" bare content="Public">
    <i class="visibility-icon icon-public" />
  </BdTooltip>
  <BdTooltip v-if="playlist.collaborative" bare content="Collaborative">
    <i class="visibility-icon icon-collaborative" />
  </BdTooltip>
</template>

<script lang="ts" setup>
import { BdTooltip } from "bearded-ui";

import { SimplifiedPlaylist } from "@/@types/Playlist";

defineProps<{
  playlist: SimplifiedPlaylist;
}>();
</script>

<style scoped>
.visibility-icon {
  font-size: var(--bd-font-size-sm);
  margin-left: var(--bd-space-4);
  opacity: 0.1;
}
</style>
