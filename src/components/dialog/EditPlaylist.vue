<template>
  <Dialog with-title title="Editer une playlist">
    <div class="wrap">
      <button class="button button--primary" @click="remove()">Supprimer la playlist</button>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { NotificationType } from "../../@types/Notification";
import { notification } from "../../helpers/Notifications";
import { useSidebar } from "../sidebar/SidebarStore";
import Dialog from "./Dialog.vue";
import { useDialog } from "./DialogStore";

const dialogStore = useDialog();
const sidebarStore = useSidebar();

function remove(): void {
  if (dialogStore.playlistId) {
    sidebarStore.removePlaylist(dialogStore.playlistId).then(() => {
      dialogStore.close();
      notification({ msg: `Playlist supprimée`, type: NotificationType.Success });
    });
  }
}
</script>

<style lang="scss" scoped>
.wrap {
  padding: 1.2rem;
  text-align: center;
}
</style>
