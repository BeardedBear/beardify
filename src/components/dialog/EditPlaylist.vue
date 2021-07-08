<template>
  <div class="content">
    <button class="button button--primary" @click="remove()">Supprimer la playlist</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { SidebarActions } from "../sidebar/SidebarStore";
import { Mutations } from "../dialog/DialogStore";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    function remove() {
      store
        .dispatch(SidebarActions.removePlaylist, store.state.dialog.playlistId)
        .then(() => store.commit(Mutations.CLOSE_DIALOG));
    }

    return { remove };
  },
});
</script>

<style lang="scss" scoped>
.content {
  padding: 20px;
  text-align: center;
  width: 350px;
}
</style>
