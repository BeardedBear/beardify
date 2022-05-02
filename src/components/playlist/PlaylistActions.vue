<template>
  <div>
    <div v-if="!isPlaylistOwner(playlistStore.playlist.owner)">
      <button
        v-if="!playlistStore.followed"
        class="button button--nude"
        title="Follow the playlist"
        @click="playlistStore.followPlaylist(playlistStore.playlist.id)"
      >
        <i class="icon-follow"></i>
      </button>
      <button
        v-else
        class="button button--nude followed"
        title="Unfollow the playlist"
        @click="sidebarStore.removePlaylist(playlistStore.playlist.id)"
      >
        <i class="icon-followed"></i>
      </button>
    </div>
    <button v-else class="button button--nude" @click="edit(playlistStore.playlist.id)">
      <i class="icon-more-vertical"></i>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useDialog } from "../../components/dialog/DialogStore";
import { isPlaylistOwner } from "../../helpers/playlist";
import { usePlaylist } from "../../views/playlist/PlaylistStore";
import { useSidebar } from "../sidebar/SidebarStore";

const dialogStore = useDialog();
const playlistStore = usePlaylist();
const sidebarStore = useSidebar();

function edit(playlistId: string): void {
  dialogStore.open({ type: "editPlaylist", playlistId });
}
</script>

<style lang="scss" scoped>
.followed {
  color: var(--primary-color);
}
</style>
