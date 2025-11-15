<template>
  <div class="sidebar loading" v-if="!sidebarStore.playlists.length && !sidebarStore.collections.length">
    <Loader />
  </div>
  <div :class="{ 'search-opened': collectionSearchOpened || playlistSearchOpened }" class="sidebar" v-else>
    <Topbar />
    <Menu />
    <div class="sidebar-item">
      <div class="heading title" v-if="!collectionSearchOpened">
        <div class="title-name">Collections</div>
        <div class="options">
          <button @click="sidebarStore.refreshPlaylists()" class="icon">
            <i class="icon-refresh"></i>
          </button>
          <button @click="() => (collectionSearchOpened = true)" class="icon">
            <i class="icon-search"></i>
          </button>
          <button @click="dialogStore.open({ type: 'createCollection' })" class="icon add">
            <i class="icon-plus"></i>
          </button>
        </div>
      </div>
      <div class="heading title" v-else>
        <input
          class="search"
          placeholder="Search collection"
          ref="collectionSearchInput"
          type="text"
          v-model="collectionSearchQuery"
        />
      </div>
      <div class="empty" v-if="!sidebarStore.collections.length">
        Oh well, you don't have a collection ! To create one, you just have to create one with + button or rename a
        classic playlist but start with "#Collection". Magical, isn't it?
      </div>
      <div :key="index" v-else v-for="(playlist, index) in sidebarStore.collections">
        <router-link
          :class="{ active: $route.params.id === playlist.id }"
          :to="`/collection/${playlist.id}`"
          class="playlist-item"
          v-if="playlist.id && playlist.name.toLocaleLowerCase().includes(collectionSearchQuery.toLocaleLowerCase())"
        >
          <PlaylistIcon :playlist="playlist" />
          <div class="name">
            {{ playlist.name.replace("#Collection ", "").replace("#collection ", "") }}
          </div>
          <VisibilityIcon :playlist="playlist" />
          <button
            @click.prevent="
              dialogStore.open({
                type: 'editPlaylist',
                playlistId: playlist.id,
              })
            "
            class="edit"
          >
            <i class="icon-more-vertical"></i>
          </button>
        </router-link>
      </div>
    </div>
    <div class="sidebar-item">
      <div class="heading title" v-if="!playlistSearchOpened">
        <div class="title-name">Playlists</div>
        <div class="options">
          <button @click="sidebarStore.refreshPlaylists()" class="icon">
            <i class="icon-refresh"></i>
          </button>
          <button @click="() => (playlistSearchOpened = true)" class="icon">
            <i class="icon-search"></i>
          </button>
          <button @click="dialogStore.open({ type: 'createPlaylist' })" class="icon add">
            <i class="icon-plus"></i>
          </button>
        </div>
      </div>
      <div class="heading title" v-else>
        <input
          class="search"
          placeholder="Search playlist"
          ref="playlistSearchInput"
          type="text"
          v-model="playlistSearchQuery"
        />
      </div>
      <div :key="index" v-for="(playlist, index) in sidebarStore.playlists">
        <router-link
          :class="{ active: $route.params.id === playlist.id }"
          :to="`/playlist/${playlist.id}`"
          class="playlist-item"
          v-if="
            playlist.id &&
            playlist.name !== '' &&
            playlist.name.toLocaleLowerCase().includes(playlistSearchQuery.toLocaleLowerCase())
          "
        >
          <PlaylistIcon :playlist="playlist" />
          <div class="name">{{ playlist.name }}</div>
          <VisibilityIcon :playlist="playlist" />
          <button
            @click.prevent="
              dialogStore.open({
                type: 'editPlaylist',
                playlistId: playlist.id,
              })
            "
            class="edit"
          >
            <i class="icon-more-vertical"></i>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onClickOutside } from "@vueuse/core";
import { ref, Ref, watch } from "vue";
import { RouterLink } from "vue-router";

import { useAuth } from "../../views/auth/AuthStore";
import { useDialog } from "../dialog/DialogStore";
import Loader from "../LoadingDots.vue";
import Topbar from "../SidebarHead.vue";
import Menu from "./MainMenu.vue";
import PlaylistIcon from "./PlaylistIcon.vue";
import { useSidebar } from "./SidebarStore";
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
@use "../../assets/scss/colors" as colors;

.empty {
  font-style: italic;
  opacity: 0.5;
  padding: 0.8rem 20px 0.8rem 1rem;
}

.playlist-item {
  align-items: center;
  color: currentcolor;
  display: flex;
  font-size: 0.9rem;
  font-weight: bold;
  justify-content: space-between;
  padding: 0.3rem 1.2rem 0.3rem 1rem;
  text-decoration: none;

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

.options {
  opacity: 0;
  transition: 0.2s;
  visibility: hidden;

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

.sidebar {
  animation: pop-content 1s ease both;
  background: var(--bg-color-dark);
  display: grid;
  grid-template-rows: auto auto auto;
  overflow: hidden;

  &.search-opened {
    grid-template-rows: auto auto 1fr 1fr;
  }

  &.loading {
    display: grid;
    place-content: center;
  }
}

.sidebar-item {
  overflow-y: auto;
  position: relative;

  &:hover {
    .options {
      opacity: 1;
      visibility: visible;
    }
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
  color: var(--font-color);
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 0.7rem 0.7rem 0.7rem 1rem;
  position: sticky;
  top: 0;
  z-index: 1;

  .title-name {
    opacity: 0.2;
  }
}
</style>
