<template>
  <Dialog title="Create a playlist" with-title>
    <div class="wrap">
      <input class="input" placeholder="Playlist's name" type="text" v-model="playlistName" />
      <ButtonIndex variant="primary" @click="create()">Create</ButtonIndex>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { NotificationType } from "@/@types/Notification";
import { useDialog } from "@/components/dialog/DialogStore";
import Dialog from "@/components/dialog/DialogWrap.vue";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
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

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.wrap {
  padding: 1.2rem;
  text-align: center;
}

.input {
  @include font-bold;

  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 0.3rem;
  color: currentcolor;
  display: block;
  margin-bottom: 1.2rem;
  outline: 0;
  padding: 0.8rem 1rem;
  width: 100%;
}
</style>
