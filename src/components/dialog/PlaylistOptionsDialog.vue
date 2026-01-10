<template>
  <Dialog title="Playlist options" with-title>
    <div class="wrap">
      <PlaylistActions />
      <input
        v-if="route.name === 'Collection'"
        ref="searchElement"
        v-model="playlistStore.filter"
        class="search"
        placeholder="Filter album/artist"
        type="search"
      />
      <ShareContent :beardify-url="route.fullPath" :spotify-url="playlistStore.playlist.external_urls.spotify" />
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

import { useDialog } from "@/components/dialog/DialogStore";
import Dialog from "@/components/dialog/DialogWrap.vue";
import PlaylistActions from "@/components/playlist/PlaylistActions.vue";
import ShareContent from "@/components/ui/ShareContent.vue";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const playlistStore = usePlaylist();
const dialogStore = useDialog();
const route = useRoute();
const searchElement = ref<HTMLInputElement | null>(null);

watch(
  () => dialogStore.show,
  (show) => {
    if (show && dialogStore.type === "playlistOptions") {
      setTimeout(() => {
        if (searchElement.value) searchElement.value.focus();
      }, 0);
    }
  },
);
</script>

<style lang="scss" scoped>
.wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  padding: 1.5rem;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep() .search {
    width: 100%;
  }
}
</style>
