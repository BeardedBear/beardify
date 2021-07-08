<template>
  <div class="content">
    <input v-model="playlistName" class="input" type="text" placeholder="Nom de la playlist" />
    <button class="button button--primary" @click="create()">Créer</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { SidebarActions } from "../sidebar/SidebarStore";
import { Mutations } from "../dialog/DialogStore";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();
    const playlistName = ref("");

    function create(): void {
      store.dispatch(SidebarActions.addPlaylist, playlistName.value).then(() => store.commit(Mutations.CLOSE_DIALOG));
    }

    return { playlistName, create };
  },
});
</script>

<style lang="scss" scoped>
.content {
  padding: 20px;
  text-align: center;
  width: 350px;
}

.input {
  padding: 10px 15px;
  display: block;
  margin-bottom: 20px;
  width: 100%;
  background-color: var(--bg-color-light);
  border: 0;
  outline: 0;
  border-radius: 4px;
  color: currentColor;
  font-weight: 700;
}
</style>
