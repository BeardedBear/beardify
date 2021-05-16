<template>
  <div>vas y créé une playlist !</div>

  {{ store.state.dialog.playlistId }}
  editer

  <button @click="remove()">SUPPRIME</button>
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
        .dispatch(`sidebar/${SidebarActions.remove}`, store.state.dialog.playlistId)
        .then(() => store.commit(`dialog/${Mutations.CLOSE}`));
    }

    return { remove, store };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
</style>
