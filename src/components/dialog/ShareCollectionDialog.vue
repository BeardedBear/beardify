<template>
  <Dialog title="Share this collection" with-title>
    <div class="wrap">
      <div class="recap">
        <Cover :images="playlistStore.playlist.images" class="cover" size="large" />
        <div>
          <div class="name bd-font-bold">{{ playlistStore.playlist.name.replace("#Collection ", "") }}</div>
          <div class="count">{{ albumCount }} albums</div>
        </div>
      </div>
      <p>
        Anyone with this link can view this collection's albums in read-only mode, no Spotify account needed.
        Playback stays exclusive to Spotify accounts.
      </p>
      <p class="hint">The collection must be public on Spotify for the link to work.</p>
      <BdButton variant="primary" @click="copyPublicLink()">Copy public link</BdButton>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";
import { BdButton } from "bearded-ui";
import { computed } from "vue";

import { NotificationType } from "@/@types/Notification";
import { useDialog } from "@/components/dialog/DialogStore";
import Dialog from "@/components/dialog/DialogWrap.vue";
import Cover from "@/components/ui/AlbumCover.vue";
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

<style scoped>

.wrap {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-4);
  max-width: 24rem;
  padding: var(--bd-space-4);
}

.recap {
  align-items: center;
  display: flex;
  gap: var(--bd-space-4);
}

.cover {
  border-radius: var(--bd-radius-sm);
  height: 5rem;
  width: 5rem;
}

.count {
  opacity: 0.6;
}

.hint {
  opacity: 0.6;
}
</style>
