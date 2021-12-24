<template>
  <Dialog with-title title="Create a playlist">
    <div class="wrap">
      <input v-model="playlistName" class="input" type="text" placeholder="Playlist's name" />
      <button class="button button--primary" @click="create()">Create</button>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { NotificationType } from "../../@types/Notification";
import { notification } from "../../helpers/notifications";
import { useSidebar } from "../sidebar/SidebarStore";
import Dialog from "./Dialog.vue";
import { useDialog } from "./DialogStore";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const playlistName = ref("");

function create(): void {
  sidebarStore.addPlaylist(playlistName.value).then(() => {
    dialogStore.close();
    notification({ msg: `Playlist ${playlistName.value} create`, type: NotificationType.Success });
  });
}
</script>

<style lang="scss" scoped>
.wrap {
  padding: 1.2rem;
  text-align: center;
}

.input {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 0.3rem;
  color: currentColor;
  display: block;
  font-weight: 700;
  margin-bottom: 1.2rem;
  outline: 0;
  padding: 0.8rem 1rem;
  width: 100%;
}
</style>
