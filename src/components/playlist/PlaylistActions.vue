<template>
  <div>
    <div v-if="!isPlaylistOwner(playlistStore.playlist.owner)">
      <BdTooltip v-if="!playlistStore.followed" bare content="Follow the playlist">
        <BdButton icon-only variant="nude" @click="playlistStore.followPlaylist(playlistStore.playlist.id)">
          <i class="icon-follow" />
        </BdButton>
      </BdTooltip>
      <BdTooltip v-else bare content="Unfollow the playlist">
        <BdButton
          icon-only
          variant="nude"
          class="followed"
          @click="sidebarStore.removePlaylist(playlistStore.playlist.id)"
        >
          <i class="icon-followed" />
        </BdButton>
      </BdTooltip>
    </div>
    <BdTooltip v-else bare content="Playlist options">
      <BdButton aria-label="Playlist options" icon-only variant="nude" @click="edit(playlistStore.playlist.id)">
        <i aria-hidden="true" class="icon-more-vertical" />
      </BdButton>
    </BdTooltip>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdTooltip } from "bearded-ui";

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
