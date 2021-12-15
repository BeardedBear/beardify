<template>
  <Dialog with-title title="Ajouter un morceau à une playlist">
    <div
      v-for="(playlist, index) in sidebarStore.playlists"
      :key="index"
      class="collection"
      @click="add(dialogStore.songUri ? dialogStore.songUri : '', playlist.id)"
    >
      <div class="playlist"><i class="icon-music" />{{ playlist.name }}</div>
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

const dialogStore = useDialog();
const sidebarStore = useSidebar();

function add(songUri: string, playlistId: string): void {
  instance()
    .post(`playlists/${playlistId}/tracks?uris=${songUri}`)
    .then((f) => {
      if (f.status === 201) dialogStore.close();
    })
    .then(() => notification({ msg: "Morceau ajouté", type: NotificationType.Success }));
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
