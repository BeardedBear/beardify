<template>
  <div v-if="!sidebarStore.playlists.length && !sidebarStore.collections.length" class="sidebar loading">
    <Loader />
  </div>
  <div v-else class="sidebar" :class="{ 'search-opened': collectionSearchOpened || playlistSearchOpened }">
    <Topbar />
    <Menu />
    <div class="sidebar__item">
      <div v-if="!collectionSearchOpened" class="heading title">
        <div>Collections</div>
        <div class="options">
          <button class="icon" @click="sidebarStore.refreshPlaylists()">
            <i class="icon-refresh"></i>
          </button>
          <button class="icon" @click="() => (collectionSearchOpened = true)"><i class="icon-search"></i></button>
          <button class="icon add" @click="dialogStore.open({ type: 'createCollection' })">
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
      <div v-if="!sidebarStore.collections.length" class="empty">
        Oh well, you don't have a collection ! To create one, you just have to create one with + button or rename a
        classic playlist but start with "#Collection". Magical, isn't it?
      </div>
      <div v-for="(playlist, index) in sidebarStore.collections" v-else :key="index">
        <router-link
          v-if="playlist.id && playlist.name.toLocaleLowerCase().includes(collectionSearchQuery.toLocaleLowerCase())"
          class="playlist-item"
          :to="`/collection/${playlist.id}`"
          :class="{ active: $route.params.id === playlist.id }"
        >
          <i class="type-icon icon-folder" />
          <div class="name">{{ playlist.name.replace("#Collection ", "").replace("#collection ", "") }}</div>
          <VisibilityIcon :playlist="playlist" />
          <button class="edit" @click.prevent="dialogStore.open({ type: 'editPlaylist', playlistId: playlist.id })">
            <i class="icon-more-vertical"></i>
          </button>
        </router-link>
      </div>
    </div>
    <div class="sidebar__item">
      <div v-if="!playlistSearchOpened" class="heading title">
        <div>Playlists</div>
        <div class="options">
          <button class="icon" @click="sidebarStore.refreshPlaylists()">
            <i class="icon-refresh"></i>
          </button>
          <button class="icon" @click="() => (playlistSearchOpened = true)"><i class="icon-search"></i></button>
          <button class="icon add" @click="dialogStore.open({ type: 'createPlaylist' })">
            <i class="icon-plus"></i>
          </button>
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
      <div v-for="(playlist, index) in sidebarStore.playlists" :key="index">
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
          <VisibilityIcon :playlist="playlist" />
          <button class="edit" @click.prevent="dialogStore.open({ type: 'editPlaylist', playlistId: playlist.id })">
            <i class="icon-more-vertical"></i>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, watch } from "vue";
import Loader from "../LoadingDots.vue";
import { useDialog } from "../dialog/DialogStore";
import { useSidebar } from "./SidebarStore";
import { onClickOutside } from "@vueuse/core";
import { useAuth } from "../../views/auth/AuthStore";
import Menu from "./MainMenu.vue";
import Topbar from "../Topbar.vue";
import VisibilityIcon from "./VisibilityIcon.vue";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
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

if ((authStore.me && !sidebarStore.collections.length) || !sidebarStore.playlists.length)
  sidebarStore.getPlaylists("me/playlists?limit=50");
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
  font-size: 0.9rem;
  font-weight: bold;
  justify-content: space-between;
  padding: 0.3rem 1.2rem 0.3rem 1rem;
  text-decoration: none;

  .type-icon {
    margin-right: 1rem;
    opacity: 0.3;
  }

  .edit {
    background-color: var(--bg-color);
    border: none;
    border-radius: 2rem;
    color: var(--font-color);
    cursor: pointer;
    font-size: 0.9rem;
    opacity: 0;
    padding: 0.2rem 0.7rem;
    position: absolute;
    right: 0.5rem;
    transition: 0.2s;

    &:hover {
      background-color: var(--bg-color-lighter);
    }
  }

  .name {
    flex: 1;
    text-align: left;
    transition: 0.2s;
  }

  &:hover {
    background-color: var(--bg-color);

    .name {
      padding-left: 0.2rem;
    }

    .edit {
      opacity: 1;
    }
  }
}

.sidebar {
  animation: pop-content 1s ease both;
  background: var(--bg-color-dark);
  display: grid;
  grid-template-rows: auto auto auto;
  overflow: hidden;

  &.search-opened {
    grid-template-rows: auto auto 1fr 1fr;
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
    padding: 0.2rem 0.5rem;

    &:hover {
      background-color: var(--bg-color-lighter);
      opacity: 1;
    }
  }
}
</style>
