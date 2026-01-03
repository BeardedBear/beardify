<template>
  <Dialog title="Add an album to a collection" with-title>
    <div class="content">
      <div
        :key="index"
        @click="add(dialogStore.albumId ? dialogStore.albumId : '', playlist.id)"
        class="collection"
        v-for="(playlist, index) in sidebarStore.collections.filter(
          (playlist) => playlist.collaborative || playlist.owner.id === authStore.me?.id,
        )"
      >
        <div class="album">
          <div>
            <PlaylistIcon :playlist="playlist" />
            {{ playlist.name.replace("#Collection ", "") }}
          </div>
          <VisibilityIcon :playlist="playlist" />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { NotificationType } from "@/@types/Notification";
import { Paging } from "@/@types/Paging";
import { TrackSimplified } from "@/@types/Track";
import { instance } from "@/api";
import { notification } from "@/helpers/notifications";
import { albumAllreadyExist } from "@/helpers/playlist";
import { useAuth } from "@/views/auth/AuthStore";
import PlaylistIcon from "@/components/sidebar/PlaylistIcon.vue";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import VisibilityIcon from "@/components/sidebar/VisibilityIcon.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import Dialog from "@/components/dialog/DialogWrap.vue";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const authStore = useAuth();

async function add(albumId: string, playlistId: string): Promise<void> {
  if (await albumAllreadyExist(`playlists/${playlistId}/tracks?limit=50`, albumId)) {
    notification({
      msg: "This album allready exists in this collection",
      type: NotificationType.Error,
    });
  } else {
    try {
      const albumTracksResponse = await instance().get<Paging<TrackSimplified>>(`albums/${albumId}/tracks`);
      if (!albumTracksResponse.data.items.length) {
        notification({ msg: "Album has no tracks", type: NotificationType.Error });
        return;
      }
      await instance().post(`playlists/${playlistId}/tracks?uris=${albumTracksResponse.data.items[0].uri}`);
      dialogStore.close();
      notification({
        msg: "Album added",
        type: NotificationType.Success,
      });
    } catch (error: unknown) {
      notification({ msg: "Failed to add album", type: NotificationType.Error });
      console.error("Add album error:", error);
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/mixins" as *;

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

  @include font-bold;

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
