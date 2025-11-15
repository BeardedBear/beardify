<template>
  <div>
    <div v-if="!isPlaylistOwner(playlistStore.playlist.owner)">
      <button
        @click="playlistStore.followPlaylist(playlistStore.playlist.id)"
        class="button button-nude"
        title="Follow the playlist"
        v-if="!playlistStore.followed"
      >
        <i class="icon-follow"></i>
      </button>
      <button
        @click="sidebarStore.removePlaylist(playlistStore.playlist.id)"
        class="button button-nude followed"
        title="Unfollow the playlist"
        v-else
      >
        <i class="icon-followed"></i>
      </button>
    </div>
    <button @click="edit(playlistStore.playlist.id)" class="button button-nude" v-else>
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
  dialogStore.open({ playlistId, type: "editPlaylist" });
}
</script>

<style lang="scss" scoped>
.followed {
  color: var(--primary-color);
}
</style>
