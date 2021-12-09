<template>
  <div v-if="!sidebarStore.playlists.length && !sidebarStore.collections.length" class="sidebar loading">
    <Loader />
  </div>

  <div v-else class="sidebar" :class="{ 'search-opened': collectionSearchOpened || playlistSearchOpened }">
    <Menu />
    <div class="sidebar__item">
      <div v-if="!collectionSearchOpened" class="heading title">
        <div>Collections</div>
        <div class="options">
          <button class="icon" @click="() => (collectionSearchOpened = true)"><i class="icon-search"></i></button>
          <button class="icon add" @click="dialogStore.open({ type: 'addCollection' })">
            <i class="icon-plus"></i>
          </button>
        </div>
      </div>
      <div v-else class="heading title">
        <input
          ref="collectionSearchInput"
          v-model="collectionSearchQuery"
          class="search"
          type="text"
          placeholder="Search collection"
        />
      </div>
      <div v-if="!collections.length" class="empty">
        Ah bah zut alors, tu n'a pas de collection ! Pour en créer une, il suffit de créer ou de renommer une playlist
        classique, mais en commencant par "#Collection". Magique hein ?
      </div>
      <div v-for="(playlist, index) in collections" v-else :key="index">
        <router-link
          v-if="playlist.id && playlist.name.toLocaleLowerCase().includes(collectionSearchQuery.toLocaleLowerCase())"
          class="playlist-item"
          :to="`/collection/${playlist.id}`"
          :class="{ active: $route.params.id === playlist.id }"
        >
          <i class="type-icon icon-folder" />
          <div class="name">{{ playlist.name.replace("#Collection ", "").replace("#collection ", "") }}</div>
          <i class="public-icon" title="Public" :class="{ 'icon-public': playlist.public }" />
        </router-link>
      </div>
    </div>
    <div class="sidebar__item">
      <div v-if="!playlistSearchOpened" class="heading title">
        <div>Playlists</div>
        <div class="options">
          <button class="icon" @click="() => (playlistSearchOpened = true)"><i class="icon-search"></i></button>
          <button class="icon add" @click="dialogStore.open({ type: 'addPlaylist' })"><i class="icon-plus"></i></button>
        </div>
      </div>
      <div v-else class="heading title">
        <input
          ref="playlistSearchInput"
          v-model="playlistSearchQuery"
          class="search"
          type="text"
          placeholder="Search playlist"
        />
      </div>
      <div v-for="(playlist, index) in playlists" :key="index">
        <router-link
          v-if="
            playlist.id &&
            playlist.name !== '' &&
            playlist.name.toLocaleLowerCase().includes(playlistSearchQuery.toLocaleLowerCase())
          "
          class="playlist-item"
          :to="`/playlist/${playlist.id}`"
          :class="{ active: $route.params.id === playlist.id }"
        >
          <i
            class="type-icon"
            :class="{
              'icon-spotify': !playlist.collaborative && playlist.owner.display_name === 'Spotify',
              'icon-music': !playlist.collaborative && playlist.owner.display_name !== 'Spotify',
              'icon-users': playlist.collaborative,
            }"
          />
          <div class="name">{{ playlist.name }}</div>
          <i class="public-icon" title="Public" :class="{ 'icon-public': playlist.public }" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, Ref, watch } from "vue";
import Loader from "../LoadingDots.vue";
import { useDialog } from "../dialog/DialogStore";
import { useSidebar } from "./SidebarStore";
import { onClickOutside } from "@vueuse/core";
import { useAuth } from "../../views/auth/AuthStore";
import Menu from "./MainMenu.vue";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const collections = computed(() => sidebarStore.playlists.filter((p) => p.name.toLowerCase().includes("#collection")));
const playlists = computed(() => sidebarStore.playlists.filter((p) => !p.name.toLowerCase().includes("#collection")));
const authStore = useAuth();

// Collection search
const collectionSearchOpened = ref<boolean>(false);
const collectionSearchQuery = ref<string>("");
const collectionSearchInput: Ref<HTMLInputElement | null> = ref(null);

onClickOutside(collectionSearchInput, () => {
  collectionSearchOpened.value = false;
  collectionSearchQuery.value = "";
  collectionSearchInput.value = null;
});

watch(collectionSearchInput, () => collectionSearchInput.value && collectionSearchInput.value.focus());

// Playlist search
const playlistSearchOpened = ref<boolean>(false);
const playlistSearchQuery = ref<string>("");
const playlistSearchInput: Ref<HTMLInputElement | null> = ref(null);

onClickOutside(playlistSearchInput, () => {
  playlistSearchOpened.value = false;
  playlistSearchQuery.value = "";
  playlistSearchInput.value = null;
});

watch(playlistSearchInput, () => playlistSearchInput.value && playlistSearchInput.value.focus());
watch(authStore, () => {
  if (!collections.value.length || !playlists.value.length) sidebarStore.getPlaylists("me/playlists?limit=50");
});
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";

.empty {
  font-style: italic;
  opacity: 0.5;
  padding: 0.8rem 20px 0.8rem 1rem;
}

.playlist-item {
  align-items: center;
  color: currentColor;
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 1rem;
  text-decoration: none;

  &:hover {
    background-color: color.change(rgb(74 75 103), $alpha: 0.15);
  }

  .type-icon {
    margin-right: 1rem;
    opacity: 0.3;
  }

  .public-icon {
    margin-left: 1rem;
    opacity: 0.1;
  }

  .name {
    flex: 1;
    text-align: left;
  }
}

.sidebar {
  animation: pop-content 1s ease both;
  background: var(--bg-color-dark);
  display: grid;
  grid-template-rows: auto auto;
  overflow: hidden;

  &.search-opened {
    grid-template-rows: auto 1fr 1fr;
  }

  &__item {
    overflow-y: auto;
    position: relative;
  }

  &.loading {
    display: grid;
    place-content: center;
  }
}

.search {
  background-color: var(--bg-color-light);
  border: none;
  border-radius: 0.2rem;
  color: var(--font-color);
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  width: 100%;

  &:focus {
    outline: 0;
  }
}

.title {
  align-items: center;
  background-color: var(--bg-color-dark);
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 0.7rem 0.7rem 0.7rem 1rem;
  position: sticky;
  top: 0;
  z-index: 1;
}

.options {
  .icon {
    background-color: transparent;
    border: 0;
    border-radius: 20rem;
    color: var(--font-color);
    cursor: pointer;
    opacity: 0.4;
    padding: 0.2rem 0.7rem;

    &:hover {
      background-color: var(--bg-color-lighter);
      opacity: 1;
    }
  }
}
</style>
