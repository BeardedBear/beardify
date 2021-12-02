<template>
  <div class="content">
    <button class="button button--primary" @click="remove()">Supprimer la playlist</button>
  </div>
</template>

<script lang="ts" setup>
import { NotificationType } from "../../@types/Notification";
import { notification } from "../../helpers/notifications";
import { useSidebar } from "../sidebar/SidebarStore";
import { useDialog } from "./DialogStore";

const dialogStore = useDialog();
const sidebarStore = useSidebar();

function remove(): void {
  if (dialogStore.playlistId) {
    sidebarStore.removePlaylist(dialogStore.playlistId).then(() => {
      dialogStore.close();
      notification({ msg: `Deleted`, type: NotificationType.Success });
    });
  }
}
</script>

<style lang="scss" scoped>
.content {
  padding: 20px;
  text-align: center;
  width: 350px;
}
</style>
