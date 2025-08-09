<template>
  <Dialog :title="`Add to a playlist`" pre-content with-title>
    <template #pre-content v-if="dialogStore.track">
      <PreContentTrack :track="dialogStore.track" />
    </template>
    <div class="content">
      <div
        :key="index"
        @click="add(dialogStore.track?.uri ? dialogStore.track?.uri : '', playlist.id)"
        class="collection"
        v-for="(playlist, index) in filteredPlaylists"
      >
        <div class="playlist">
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
import { NotificationType } from "../../@types/Notification";
import { instance } from "../../api";
import { notification } from "../../helpers/notifications";
import { trackAllreadyExist } from "../../helpers/playlist";
import PlaylistIcon from "../sidebar/PlaylistIcon.vue";
import { useSidebar } from "../sidebar/SidebarStore";
import VisibilityIcon from "../sidebar/VisibilityIcon.vue";
import { useDialog } from "./DialogStore";
import Dialog from "./DialogWrap.vue";
import PreContentTrack from "./PreContentTrack.vue";

const dialogStore = useDialog();
const sidebarStore = useSidebar();

// Playlists user can modify: owned or collaborative (exclude Spotify-owned)
const filteredPlaylists = computed(() => sidebarStore.playlists.filter((playlist) => playlist.owner.id !== "spotify"));

async function add(songUri: string, playlistId: string): Promise<void> {
  if (await trackAllreadyExist(`playlists/${playlistId}/tracks?limit=50`, songUri)) {
    notification({
      msg: "This track already exists in this playlist",
      type: NotificationType.Error,
    });
  } else {
    try {
      await instance().post(`playlists/${playlistId}/tracks?uris=${songUri}`);
      dialogStore.close();
      notification({ msg: "Track added", type: NotificationType.Success });
    } catch (error: unknown) {
      notification({
        msg: (error as { message?: string })?.message?.includes("403")
          ? "Can't add to this playlist (no permission)."
          : "Failed to add track.",
        type: NotificationType.Error,
      });
      console.error("Add track error:", error);
    }
  }
}
</script>

<style lang="scss" scoped>
@use "../../assets/scss/colors" as colors;

.content {
  padding: 0.5rem;
}

.playlist {
  align-items: center;
  display: flex;
  font-size: 0.9rem;
  font-weight: bold;
  justify-content: space-between;

  i {
    margin-right: 1rem;
    opacity: 0.3;
  }
}

.collection {
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  opacity: 0.7;
  padding: 0.5rem 1rem;
  transition: 0.1s;

  &:hover {
    background: var(--bg-color-light);
    opacity: 1;
    padding-left: 1.2rem;
  }
}
</style>
