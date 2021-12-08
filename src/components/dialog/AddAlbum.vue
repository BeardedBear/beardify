<template>
  <div class="content">
    <div
      v-for="(playlist, index) in sidebarStore.playlists.filter((p) => p.name.toLowerCase().includes('#collection'))"
      :key="index"
      class="collection"
      @click="add(dialogStore.albumId ? dialogStore.albumId : '', playlist.id)"
    >
      <div class="album"><i class="icon-folder" />{{ playlist.name.replace("#Collection ", "") }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NotificationType } from "../../@types/Notification";
import { Paging } from "../../@types/Paging";
import { TrackSimplified } from "../../@types/Track";
import { instance } from "../../api";
import { notification } from "../../helpers/notifications";
import { useSidebar } from "../sidebar/SidebarStore";
import { useDialog } from "./DialogStore";

const dialogStore = useDialog();
const sidebarStore = useSidebar();

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
    .then(() => notification({ msg: "Album ajouté", type: NotificationType.Success }));
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.content {
  height: 25rem;
  overflow: auto;
  width: 25rem;
}

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
  padding: 0.5rem 1.5rem;

  &:hover {
    background: var(--bg-color-light);
  }
}
</style>
