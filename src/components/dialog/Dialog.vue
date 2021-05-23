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

    function close() {
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
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 12px;
  border: 0;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--bg-color-light);
  color: currentColor;

  &:hover {
    background-color: var(--bg-color);
  }
}

.bg {
  animation: popDialog 0.2s ease both;
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: var(--bg-color-darker);
  opacity: 0.95;
}
.dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 99999999;
  display: grid;
  place-content: center;
}

.head {
  padding: 15px 25px;
  background-color: var(--bg-color-lighter);
  border-radius: $radius $radius 0 0;
  font-size: 1rem;
  font-weight: 700;
  position: relative;
}
.dialog-content {
  animation: popDialogContent 0.2s ease both;
  background: var(--bg-color);
  max-width: 600px;
  max-height: 600px;
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr;
  border-radius: $radius;
  will-change: transform;
}
</style>
