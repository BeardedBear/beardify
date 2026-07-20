<template>
  <Dialog title="Share this collection" with-title>
    <div class="wrap">
      <div class="recap">
        <Cover :images="playlistStore.playlist.images" class="cover" size="large" />
        <div>
          <div class="name">{{ playlistStore.playlist.name.replace("#Collection ", "") }}</div>
          <div class="count">{{ albumCount }} albums</div>
        </div>
      </div>
      <p>
        Anyone with this link can view this collection's albums in read-only mode, no Spotify account needed.
        Playback stays exclusive to Spotify accounts.
      </p>
      <p class="hint">The collection must be public on Spotify for the link to work.</p>
      <ButtonIndex variant="primary" @click="copyPublicLink()">Copy public link</ButtonIndex>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";
import { computed } from "vue";

import { NotificationType } from "@/@types/Notification";
import { useDialog } from "@/components/dialog/DialogStore";
import Dialog from "@/components/dialog/DialogWrap.vue";
import Cover from "@/components/ui/AlbumCover.vue";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { notification } from "@/helpers/notifications";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";
import { absoluteRouteUrl, RouteName } from "@/router";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const dialogStore = useDialog();
const playlistStore = usePlaylist();
const clipboard = useClipboard();

const albumCount = computed<number>(
  () => removeDuplicatesAlbums(playlistStore.tracks.map((t) => t.item.album)).length,
);

function copyPublicLink(): void {
  if (!dialogStore.playlistId) {
    notification({ msg: "Unable to build the public link", type: NotificationType.Error });
    return;
  }
  clipboard.copy(absoluteRouteUrl(RouteName.Share, dialogStore.playlistId));
  notification({ msg: "Public link copied", type: NotificationType.Success });
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 24rem;
  padding: 1.2rem;
}

.recap {
  align-items: center;
  display: flex;
  gap: 1rem;
}

.cover {
  border-radius: 0.4rem;
  height: 5rem;
  width: 5rem;
}

.name {
  @include font-bold;
}

.count {
  opacity: 0.6;
}

.hint {
  opacity: 0.6;
}
</style>
