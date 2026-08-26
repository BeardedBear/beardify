<template>
  <Dialog :title="`Add to a playlist`" pre-content with-title>
    <template v-if="dialogStore.track" #pre-content>
      <PreContentTrack :track="dialogStore.track" />
    </template>
    <div class="content">
      <div
        v-for="(playlist, index) in filteredPlaylists"
        :key="index"
        class="collection bd-font-bold"
        @click="add(dialogStore.track?.uri ? dialogStore.track?.uri : '', playlist.id)"
      >
        <div class="playlist bd-font-bold">
          <div>
            <PlaylistIcon :playlist="playlist" />
            {{ playlist.name }}
          </div>
          <VisibilityIcon :playlist="playlist" />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { NotificationType } from "@/@types/Notification";
import { instance } from "@/api";
import { useDialog } from "@/components/dialog/DialogStore";
import Dialog from "@/components/dialog/DialogWrap.vue";
import PreContentTrack from "@/components/dialog/PreContentTrack.vue";
import PlaylistIcon from "@/components/sidebar/PlaylistIcon.vue";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import VisibilityIcon from "@/components/sidebar/VisibilityIcon.vue";
import { notification } from "@/helpers/notifications";
import { trackAllreadyExist } from "@/helpers/playlist";

const dialogStore = useDialog();
const sidebarStore = useSidebar();

// Playlists user can modify: owned or collaborative (exclude Spotify-owned)
const filteredPlaylists = computed(() => sidebarStore.playlists.filter((playlist) => playlist.owner.id !== "spotify"));

async function add(songUri: string, playlistId: string): Promise<void> {
  if (await trackAllreadyExist(`playlists/${playlistId}/items?limit=50`, songUri)) {
    notification({
      msg: "This track already exists in this playlist",
      type: NotificationType.Error,
    });
  } else {
    try {
      await instance().post(`playlists/${playlistId}/items?uris=${songUri}`);
      dialogStore.close();
      notification({ msg: "Track added", type: NotificationType.Success });
    } catch (error: unknown) {
      notification({
        msg: (error as { message?: string })?.message?.includes("403")
          ? "Can't add to this playlist (no permission)."
          : "Failed to add track.",
        type: NotificationType.Error,
      });
      if (import.meta.env.DEV) console.error("Add track error:", error);
    }
  }
}
</script>

<style scoped>

.content {
  padding: var(--bd-space-2);
}

.playlist {
  align-items: center;
  display: flex;
  justify-content: space-between;

  i {
    margin-right: var(--bd-space-4);
    opacity: 0.3;
  }
}

.collection {
  border-radius: var(--bd-radius-sm);
  cursor: pointer;
  opacity: 0.7;
  padding: var(--bd-space-2) var(--bd-space-4);
  transition:
    background-color var(--bd-transition-fast),
    opacity var(--bd-transition-fast),
    padding-left var(--bd-transition-fast);

  &:hover {
    background: var(--bd-bg-light);
    opacity: 1;
    padding-left: var(--bd-space-4);
  }
}
</style>
