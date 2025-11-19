<template>
  <div>
    <div v-if="!isPlaylistOwner(playlistStore.playlist.owner)">
      <ButtonIndex
        icon-only
        variant="nude"
        title="Follow the playlist"
        @click="playlistStore.followPlaylist(playlistStore.playlist.id)"
        v-if="!playlistStore.followed"
      >
        <i class="icon-follow"></i>
      </ButtonIndex>
      <ButtonIndex
        icon-only
        variant="nude"
        class="followed"
        title="Unfollow the playlist"
        @click="sidebarStore.removePlaylist(playlistStore.playlist.id)"
        v-else
      >
        <i class="icon-followed"></i>
      </ButtonIndex>
    </div>
    <ButtonIndex icon-only variant="nude" @click="edit(playlistStore.playlist.id)" v-else>
      <i class="icon-more-vertical"></i>
    </ButtonIndex>
  </div>
</template>

<script lang="ts" setup>
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { isPlaylistOwner } from "@/helpers/playlist";
import { usePlaylist } from "@/views/playlist/PlaylistStore";
import { useSidebar } from "@/components/sidebar/SidebarStore";

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
