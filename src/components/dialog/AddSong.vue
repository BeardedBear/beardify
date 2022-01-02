<template>
  <Dialog with-title title="Add track to a playlist">
    <div class="content">
      <div
        v-for="(playlist, index) in sidebarStore.playlists.filter(
          (playlist) => playlist.collaborative || playlist.owner.id === authStore.me?.id,
        )"
        :key="index"
        class="collection"
        @click="add(dialogStore.songUri ? dialogStore.songUri : '', playlist.id)"
      >
        <div class="playlist">
          <div><PlaylistIcon :playlist="playlist" /> {{ playlist.name }}</div>
          <VisibilityIcon :playlist="playlist" />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { NotificationType } from "../../@types/Notification";
import { instance } from "../../api";
import { notification } from "../../helpers/notifications";
import { useSidebar } from "../sidebar/SidebarStore";
import { useDialog } from "./DialogStore";
import Dialog from "./Dialog.vue";
import { useAuth } from "../../views/auth/AuthStore";
import PlaylistIcon from "../sidebar/PlaylistIcon.vue";
import VisibilityIcon from "../sidebar/VisibilityIcon.vue";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const authStore = useAuth();

function add(songUri: string, playlistId: string): void {
  instance()
    .post(`playlists/${playlistId}/tracks?uris=${songUri}`)
    .then((f) => {
      if (f.status === 201) dialogStore.close();
    })
    .then(() => notification({ msg: "Track added", type: NotificationType.Success }));
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

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
