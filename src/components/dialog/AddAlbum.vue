<template>
  <Dialog with-title title="Add an album to a collection">
    <div class="content">
      <div
        v-for="(playlist, index) in sidebarStore.collections.filter(
          (playlist) => playlist.collaborative || playlist.owner.id === authStore.me?.id,
        )"
        :key="index"
        class="collection"
        @click="add(dialogStore.albumId ? dialogStore.albumId : '', playlist.id)"
      >
        <div class="album">
          <div><PlaylistIcon :playlist="playlist" /> {{ playlist.name.replace("#Collection ", "") }}</div>
          <VisibilityIcon :playlist="playlist" />
        </div>
      </div>
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
import Dialog from "./DialogWrap.vue";
import { useAuth } from "../../views/auth/AuthStore";
import PlaylistIcon from "../sidebar/PlaylistIcon.vue";
import VisibilityIcon from "../sidebar/VisibilityIcon.vue";
import { albumAllreadyExist } from "../../helpers/playlist";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const authStore = useAuth();

async function add(albumId: string, playlistId: string): Promise<void> {
  if (await albumAllreadyExist(`playlists/${playlistId}/tracks?limit=50`, albumId)) {
    notification({ msg: "This album allready exists in this collection", type: NotificationType.Error });
  } else {
    instance()
      .get<Paging<TrackSimplified>>(`albums/${albumId}/tracks`)
      .then((e) => {
        instance()
          .post(`playlists/${playlistId}/tracks?uris=${e.data.items[0].uri}`)
          .then(() => {
            dialogStore.close();
            notification({ msg: "Album added", type: NotificationType.Success });
          });
      });
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.content {
  padding: 0.5rem;
}

.album {
  align-items: center;
  display: flex;
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
