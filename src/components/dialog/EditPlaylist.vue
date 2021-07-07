<template>
  <div class="content">
    <button class="button button--primary" @click="remove()">Supprimer la playlist</button>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import type { RootState } from "../../@types/RootState";
import { SidebarActions } from "../sidebar/SidebarStore";
import { Mutations } from "../dialog/DialogStore";

const store = useStore<RootState>();

function remove() {
  store
    .dispatch(SidebarActions.removePlaylist, store.state.dialog.playlistId)
    .then(() => store.commit(Mutations.CLOSE_DIALOG));
}
</script>

<style lang="scss" scoped>
.content {
  padding: 20px;
  text-align: center;
  width: 350px;
}
</style>
