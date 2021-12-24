<template>
  <Dialog with-title title="Add track to a playlist">
    <div
      v-for="(playlist, index) in sidebarStore.playlists.filter(
        (playlist) => playlist.collaborative || playlist.owner.id === authStore.me?.id,
      )"
      :key="index"
      class="collection"
      @click="add(dialogStore.songUri ? dialogStore.songUri : '', playlist.id)"
    >
      <div class="playlist">
        <i
          :class="{
            'icon-music': !playlist.collaborative && playlist.owner.id === authStore.me?.id,
            'icon-users': playlist.collaborative,
          }"
        />{{ playlist.name }}
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

.playlist {
  align-items: center;
  display: flex;

  i {
    margin-right: 1rem;
    opacity: 0.3;
  }
}

.collection {
  cursor: pointer;
  padding: 0.5rem 1.5rem;

  &:hover {
    background: var(--bg-color-light);
  }
}
</style>
