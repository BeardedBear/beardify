<template>
  <div v-if="!sidebarStore.playlists.length && !sidebarStore.collections.length" class="sidebar loading">
    <Loader />
  </div>
  <div v-else class="sidebar">
    <div class="sidebar__item">
      <div class="heading title">
        <div>Collections</div>
        <button class="add" @click="dialogStore.open({ type: 'addCollection' })"><i class="icon-plus"></i></button>
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
        <button class="add" @click="dialogStore.open({ type: 'addPlaylist' })"><i class="icon-plus"></i></button>
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

<script lang="ts" setup>
import { computed } from "vue";
import Loader from "../Loader.vue";
import { useDialog } from "../dialog/DialogStore";
import { useSidebar } from "./SidebarStore";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const collections = computed(() => sidebarStore.playlists.filter((p) => p.name.toLowerCase().includes("#collection")));
const playlists = computed(() => sidebarStore.playlists.filter((p) => !p.name.toLowerCase().includes("#collection")));
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.empty {
  font-style: italic;
  opacity: 0.5;
  padding: 10px 20px 10px 15px;
}
.playlist-item {
  align-items: center;
  color: currentColor;
  display: flex;
  padding: 5px 15px;
  text-decoration: none;

  &:hover {
    background-color: rgba(rgb(74, 75, 103), 0.15);
  }

  .type-icon {
    margin-right: 15px;
    opacity: 0.3;
  }
}

.sidebar {
  animation: popContent 1s ease both;
  background: var(--bg-color-dark);
  display: grid;
  grid-template-rows: auto auto;
  overflow: hidden;

  &__item {
    overflow-y: auto;
    position: relative;
  }

  &.loading {
    display: grid;
    place-content: center;
  }
}

.title {
  align-items: center;
  background-color: var(--bg-color-dark);
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 10px 10px 10px 15px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.add {
  background-color: transparent;
  border: 0;
  border-radius: 100px;
  color: var(--font-color);
  cursor: pointer;
  font-size: 1.3rem;
  opacity: 0.4;
  padding: 1px 12px;

  &:hover {
    background-color: var(--bg-color-lighter);
    opacity: 1;
  }
}
</style>
