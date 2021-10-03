<template>
  <div class="content">
    <button class="button button--primary" @click="remove()">Supprimer la playlist</button>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { SidebarActions } from "../sidebar/SidebarStore";
import { useDialog } from "./DialogStore";

const store = useStore<RootState>();
const dialogStore = useDialog();

function remove(): void {
  store.dispatch(SidebarActions.removePlaylist, store.state.dialog.playlistId).then(() => dialogStore.close());
}
</script>

<style lang="scss" scoped>
.content {
  padding: 20px;
  text-align: center;
  width: 350px;
}
</style>
