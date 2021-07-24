<template>
  <div v-if="store.state.dialog.show" class="dialog">
    <div class="bg" @click="close()"></div>
    <div class="dialog-content">
      <div class="head">
        <div v-if="store.state.dialog.type === 'addalbum'">Ajouter un album à une collection</div>
        <div v-if="store.state.dialog.type === 'addPlaylist'">Créer une playlist</div>
        <div v-if="store.state.dialog.type === 'editPlaylist'">Editer une playlist</div>
        <div v-if="store.state.dialog.type === 'addCollection'">Créer une collection</div>
        <button class="close" @click="close()">
          <i class="icon-x" />
        </button>
      </div>
      <AddAlbum v-if="store.state.dialog.type === 'addalbum'" />
      <AddPlaylist v-if="store.state.dialog.type === 'addPlaylist'" />
      <EditPlaylist v-if="store.state.dialog.type === 'editPlaylist'" />
      <AddCollection v-if="store.state.dialog.type === 'addCollection'" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import AddAlbum from "./AddAlbum.vue";
import AddPlaylist from "./AddPlaylist.vue";
import AddCollection from "./AddCollection.vue";
import EditPlaylist from "./EditPlaylist.vue";
import { Mutations } from "./DialogStore";

export default defineComponent({
  components: { AddAlbum, AddCollection, AddPlaylist, EditPlaylist },
  setup() {
    const store = useStore<RootState>();

    function close(): void {
      store.commit(Mutations.CLOSE_DIALOG);
    }

    return { close, store };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

$radius: 4px;

@keyframes popDialog {
  from {
    opacity: 0;
  }
}
@keyframes popDialogContent {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
}

.close {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 4px;
  color: currentColor;
  cursor: pointer;
  font-size: 1rem;
  padding: 5px 8px;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);

  &:hover {
    background-color: var(--bg-color);
  }
}

.bg {
  animation: popDialog 0.2s ease both;
  background-color: var(--bg-color-darker);
  inset: 0;
  opacity: 0.95;
  position: fixed;
}
.dialog {
  display: grid;
  inset: 0;
  place-content: center;
  position: fixed;
  z-index: 99999999;
}

.head {
  background-color: var(--bg-color-lighter);
  border-radius: $radius $radius 0 0;
  font-size: 1rem;
  font-weight: 700;
  padding: 15px 25px;
  position: relative;
}
.dialog-content {
  animation: popDialogContent 0.2s ease both;
  background: var(--bg-color);
  border-radius: $radius;
  display: grid;
  grid-template-rows: auto 1fr;
  max-height: 600px;
  max-width: 600px;
  position: relative;
  will-change: transform;
}
</style>
