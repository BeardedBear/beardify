<template>
  <Dialog with-title title="Add an album to a collection">
    <div
      v-for="(playlist, index) in sidebarStore.collections.filter(
        (playlist) => playlist.collaborative || playlist.owner.id === authStore.me?.id,
      )"
      :key="index"
      class="collection"
      @click="add(dialogStore.albumId ? dialogStore.albumId : '', playlist.id)"
    >
      <div class="album"><i class="icon-folder" />{{ playlist.name.replace("#Collection ", "") }}</div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { NotificationType } from "../../@types/Notification";
import { Paging } from "../../@types/Paging";
import { TrackSimplified } from "../../@types/Track";
import { instance } from "../../api";
import { notification } from "../../helpers/notifications";
import { useSidebar } from "../sidebar/SidebarStore";
import { useDialog } from "./DialogStore";
import Dialog from "./Dialog.vue";
import { useAuth } from "../../views/auth/AuthStore";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const authStore = useAuth();

function add(albumId: string, playlistId: string): void {
  instance()
    .get<Paging<TrackSimplified>>(`albums/${albumId}/tracks`)
    .then((e) => {
      instance()
        .post(`playlists/${playlistId}/tracks?uris=${e.data.items[0].uri}`)
        .then((f) => {
          if (f.status === 201) dialogStore.close();
        });
    })
    .then(() => notification({ msg: "Album added", type: NotificationType.Success }));
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.album {
  align-items: center;
  display: flex;

  i {
    margin-right: 1rem;
    opacity: 0.3;
  }
}

.collection {
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  opacity: 0.5;
  padding: 0.5rem 1.5rem;
  transition: 0.15s;

  &:hover {
    background: var(--bg-color-light);
    opacity: 1;
    padding-left: 1.7rem;
  }
}
</style>
