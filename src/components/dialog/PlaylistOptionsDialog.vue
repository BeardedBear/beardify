<template>
  <Dialog title="Playlist options" with-title>
    <div class="wrap">
      <PlaylistActions />
      <BdInput
        v-if="route.name === 'Collection'"
        ref="searchElement"
        v-model="playlistStore.filter"
        autofocus
        class="search"
        placeholder="Filter album/artist"
        type="search"
      />
      <ShareContent :beardify-url="route.fullPath" :spotify-url="playlistStore.playlist.external_urls.spotify" />
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { BdInput } from "bearded-ui";
import { nextTick, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { useDialog } from "@/components/dialog/DialogStore";
import Dialog from "@/components/dialog/DialogWrap.vue";
import PlaylistActions from "@/components/playlist/PlaylistActions.vue";
import ShareContent from "@/components/ui/ShareContent.vue";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const playlistStore = usePlaylist();
const dialogStore = useDialog();
const route = useRoute();
const searchElement = ref<InstanceType<typeof BdInput> | null>(null);

/*
 * `autofocus` on the field owns the focus now — BdDialog's close button is the
 * first focusable descendant, so showModal() would otherwise take it. This is
 * left to select whatever filter was already typed, which focusing alone does
 * not do; nextTick because the dialog has not opened yet when this fires.
 */
watch(
  () => dialogStore.show,
  (show) => {
    if (show && dialogStore.type === "playlistOptions") nextTick(() => searchElement.value?.select());
  },
);
</script>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  padding: 1.5rem;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wrap :deep(.search) {
  width: 100%;
}
</style>
