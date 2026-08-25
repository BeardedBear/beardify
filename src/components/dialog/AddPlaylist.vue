<template>
  <Dialog title="Create a playlist" with-title>
    <div class="wrap">
      <BdInput v-model="playlistName" placeholder="Playlist's name" />
      <BdButton variant="primary" @click="create()">Create</BdButton>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { BdButton, BdInput } from "bearded-ui";
import { ref } from "vue";

import { NotificationType } from "@/@types/Notification";
import { useDialog } from "@/components/dialog/DialogStore";
import Dialog from "@/components/dialog/DialogWrap.vue";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import { notification } from "@/helpers/notifications";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const playlistName = ref("");

async function create(): Promise<void> {
  try {
    await sidebarStore.addPlaylist(playlistName.value);
    dialogStore.close();
    notification({ msg: `Playlist ${playlistName.value} create`, type: NotificationType.Success });
  } catch {
    // notification handled in store
  }
}
</script>

<style scoped>

.wrap {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.2rem;
}
</style>
