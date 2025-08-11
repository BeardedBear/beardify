<template>
  <Dialog title="Create a playlist" with-title>
    <div class="wrap">
      <input class="input" placeholder="Playlist's name" type="text" v-model="playlistName" />
      <button @click="create()" class="button button--primary">Create</button>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { NotificationType } from "../../@types/Notification";
import { notification } from "../../helpers/notifications";
import { useSidebar } from "../sidebar/SidebarStore";
import { useDialog } from "./DialogStore";
import Dialog from "./DialogWrap.vue";

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

<style lang="scss" scoped>
.wrap {
  padding: 1.2rem;
  text-align: center;
}

.input {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 0.3rem;
  color: currentcolor;
  display: block;
  font-weight: 700;
  margin-bottom: 1.2rem;
  outline: 0;
  padding: 0.8rem 1rem;
  width: 100%;
}
</style>
