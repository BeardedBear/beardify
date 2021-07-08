<template>
  <div v-if="!store.state.sidebar.playlists.length && !store.state.sidebar.collections.length" class="sidebar loading">
    <Loader />
  </div>
  <div v-else class="sidebar">
    <div class="sidebar__item">
      <div class="heading title">
        <div>Collections</div>
        <button class="add" @click="openDialogAddCollection()"><i class="icon-plus"></i></button>
      </div>
      <div v-if="!collections.length" class="empty">
        Ah bah zut alors, tu n'a pas de collection ! Pour en créer une, il suffit de créer ou de renommer une playlist
        classique, mais en commencant par "#Collection". Magique hein ?
      </div>
      <div v-for="(playlist, index) in collections" v-else :key="index">
        <router-link
          v-if="playlist.id"
          class="playlist-item"
          :to="`/collection/${playlist.id}`"
          :class="{ active: $route.params.id === playlist.id }"
        >
          <i class="type-icon icon-folder" />
          <div>{{ playlist.name.replace("#Collection ", "").replace("#collection ", "") }}</div>
        </router-link>
      </div>
    </div>
    <div class="sidebar__item">
      <div class="heading title">
        <div>Playlists</div>
        <button class="add" @click="openDialogAddPlaylist()"><i class="icon-plus"></i></button>
      </div>
      <div v-for="(playlist, index) in playlists" :key="index">
        <router-link
          v-if="playlist.id"
          class="playlist-item"
          :to="`/playlist/${playlist.id}`"
          :class="{ active: $route.params.id === playlist.id }"
        >
          <i class="type-icon icon-music" />
          <div>{{ playlist.name }}</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { SidebarActions } from "./SidebarStore";
import { api } from "../../api";
import { Mutations } from "../dialog/DialogStore";
import { Dialog } from "../../@types/Dialog";
import Loader from "../Loader.vue";

export default defineComponent({
  components: { Loader },
  setup() {
    const store = useStore<RootState>();
    const collections = computed(() =>
      store.state.sidebar.playlists.filter((p) => p.name.toLowerCase().includes("#collection")),
    );
    const playlists = computed(() =>
      store.state.sidebar.playlists.filter((p) => !p.name.toLowerCase().includes("#collection")),
    );

    function openDialogAddPlaylist(): void {
      store.commit(Mutations.OPEN_DIALOG, { type: "addPlaylist" } as Dialog);
    }

    function openDialogAddCollection(): void {
      store.commit(Mutations.OPEN_DIALOG, { type: "addCollection" } as Dialog);
    }

    store.dispatch(SidebarActions.getPlaylists, `${api.url}me/playlists?limit=50`);

    return { openDialogAddPlaylist, openDialogAddCollection, store, collections, playlists };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.empty {
  padding: 10px 20px 10px 15px;
  font-style: italic;
  opacity: 0.5;
}
.playlist-item {
  padding: 5px 15px;
  color: currentColor;
  text-decoration: none;
  display: flex;
  align-items: center;

  &:hover {
    background-color: rgba(rgb(74, 75, 103), 0.15);
  }

  .type-icon {
    opacity: 0.3;
    margin-right: 15px;
  }
}

.sidebar {
  background: var(--bg-color-dark);
  display: grid;
  grid-template-rows: auto auto;
  overflow: hidden;
  animation: popContent 1s ease both;

  &__item {
    position: relative;
    overflow-y: auto;
  }

  &.loading {
    display: grid;
    place-content: center;
  }
}

.title {
  position: sticky;
  top: 0;
  padding: 10px 10px 10px 15px;
  background-color: var(--bg-color-dark);
  z-index: 1;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add {
  padding: 1px 12px;
  border: 0;
  background-color: transparent;
  color: var(--font-color);
  cursor: pointer;
  font-size: 1.3rem;
  border-radius: 100px;
  opacity: 0.4;

  &:hover {
    opacity: 1;
    background-color: var(--bg-color-lighter);
  }
}
</style>
