<template>
  <Dialog title="Create a playlist" with-title>
    <div class="wrap">
      <BdInput v-model="playlistName" :disabled="creating" label="Playlist's name" @keyup.enter="create()" />
      <BdButton :disabled="creating" variant="primary" @click="create()">Create</BdButton>
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
const creating = ref(false);

async function create(): Promise<void> {
  if (!playlistName.value.trim() || creating.value) return;
  creating.value = true;
  try {
    await sidebarStore.addPlaylist(playlistName.value);
    dialogStore.close();
    notification({ msg: `Playlist ${playlistName.value} created`, type: NotificationType.Success });
  } catch {
    // notification handled in store
  } finally {
    creating.value = false;
  }
}
</script>

<style scoped>

.wrap {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-4);
  padding: var(--bd-space-4);
}
</style>
