<template>
  <div>
    <div v-if="!isPlaylistOwner(playlistStore.playlist.owner)">
      <ButtonIndex
        v-if="!playlistStore.followed"
        icon-only
        variant="nude"
        title="Follow the playlist"
        @click="playlistStore.followPlaylist(playlistStore.playlist.id)"
      >
        <i class="icon-follow" />
      </ButtonIndex>
      <ButtonIndex
        v-else
        icon-only
        variant="nude"
        class="followed"
        title="Unfollow the playlist"
        @click="sidebarStore.removePlaylist(playlistStore.playlist.id)"
      >
        <i class="icon-followed" />
      </ButtonIndex>
    </div>
    <ButtonIndex v-else icon-only variant="nude" @click="edit(playlistStore.playlist.id)">
      <i class="icon-more-vertical" />
    </ButtonIndex>
  </div>
</template>

<script lang="ts" setup>
import { useDialog } from "@/components/dialog/DialogStore";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { isPlaylistOwner } from "@/helpers/playlist";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

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
