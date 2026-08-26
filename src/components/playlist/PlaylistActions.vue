<template>
  <div>
    <div v-if="!isPlaylistOwner(playlistStore.playlist.owner)">
      <BdButton
        v-if="!playlistStore.followed"
        icon-only
        variant="nude"
        title="Follow the playlist"
        @click="playlistStore.followPlaylist(playlistStore.playlist.id)"
      >
        <i class="icon-follow" />
      </BdButton>
      <BdButton
        v-else
        icon-only
        variant="nude"
        class="followed"
        title="Unfollow the playlist"
        @click="sidebarStore.removePlaylist(playlistStore.playlist.id)"
      >
        <i class="icon-followed" />
      </BdButton>
    </div>
    <BdButton
      v-else
      aria-label="Playlist options"
      icon-only
      title="Playlist options"
      variant="nude"
      @click="edit(playlistStore.playlist.id)"
    >
      <i aria-hidden="true" class="icon-more-vertical" />
    </BdButton>
  </div>
</template>

<script lang="ts" setup>
import { BdButton } from "bearded-ui";

import { useDialog } from "@/components/dialog/DialogStore";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import { isPlaylistOwner } from "@/helpers/playlist";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const dialogStore = useDialog();
const playlistStore = usePlaylist();
const sidebarStore = useSidebar();

function edit(playlistId: string): void {
  dialogStore.open({ playlistId, type: "editPlaylist" });
}
</script>

<style scoped>
.followed {
  color: var(--bd-primary);
}
</style>
