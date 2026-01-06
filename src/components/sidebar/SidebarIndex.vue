<template>
  <div class="sidebar-backdrop" :class="{ 'is-visible': sidebarStore.isOpen }" @click="sidebarStore.close()" />
  <div
    class="sidebar loading"
    :class="{ 'is-open': sidebarStore.isOpen }"
    v-if="!sidebarStore.playlists.length && !sidebarStore.collections.length"
  >
    <Loader />
  </div>
  <div
    :class="{ 'search-opened': collectionSearchOpened || playlistSearchOpened, 'is-open': sidebarStore.isOpen }"
    class="sidebar"
    v-else
  >
    <Topbar />
    <Menu />
    <div class="sidebar-item">
      <div class="heading title" v-if="!collectionSearchOpened">
        <div class="title-name">Collections</div>
        <div class="options">
          <ButtonIndex no-default-class class="icon" @click="sidebarStore.refreshPlaylists()">
            <i class="icon-refresh"></i>
          </ButtonIndex>
          <ButtonIndex no-default-class class="icon" @click="() => (collectionSearchOpened = true)">
            <i class="icon-search"></i>
          </ButtonIndex>
          <ButtonIndex no-default-class class="icon add" @click="dialogStore.open({ type: 'createCollection' })">
            <i class="icon-plus"></i>
          </ButtonIndex>
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
      <div :key="index" v-else v-for="(playlist, index) in filteredCollections">
        <router-link
          :class="{ active: $route.params.id === playlist.id }"
          :to="`/collection/${playlist.id}`"
          class="playlist-item"
          v-if="playlist.id"
        >
          <PlaylistIcon :playlist="playlist" />
          <div class="name">
            {{ playlist.displayName }}
          </div>
          <VisibilityIcon :playlist="playlist" />
          <ButtonIndex
            no-default-class
            class="edit"
            @click.prevent="
              dialogStore.open({
                type: 'editPlaylist',
                playlistId: playlist.id,
              })
            "
          >
            <i class="icon-more-vertical"></i>
          </ButtonIndex>
        </router-link>
      </div>
    </div>
    <div class="sidebar-item">
      <div class="heading title" v-if="!playlistSearchOpened">
        <div class="title-name">Playlists</div>
        <div class="options">
          <ButtonIndex no-default-class class="icon" @click="sidebarStore.refreshPlaylists()">
            <i class="icon-refresh"></i>
          </ButtonIndex>
          <ButtonIndex no-default-class class="icon" @click="() => (playlistSearchOpened = true)">
            <i class="icon-search"></i>
          </ButtonIndex>
          <ButtonIndex no-default-class class="icon add" @click="dialogStore.open({ type: 'createPlaylist' })">
            <i class="icon-plus"></i>
          </ButtonIndex>
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
      <div :key="index" v-for="(playlist, index) in filteredPlaylists">
        <router-link
          :class="{ active: $route.params.id === playlist.id }"
          :to="`/playlist/${playlist.id}`"
          class="playlist-item"
          v-if="playlist.id && playlist.name !== ''"
        >
          <PlaylistIcon :playlist="playlist" />
          <div class="name">{{ playlist.name }}</div>
          <VisibilityIcon :playlist="playlist" />
          <ButtonIndex
            no-default-class
            class="edit"
            @click.prevent="
              dialogStore.open({
                type: 'editPlaylist',
                playlistId: playlist.id,
              })
            "
          >
            <i class="icon-more-vertical"></i>
          </ButtonIndex>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onClickOutside } from "@vueuse/core";
import { computed, ref, Ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";

import { useDialog } from "@/components/dialog/DialogStore";
import Menu from "@/components/sidebar/MainMenu.vue";
import PlaylistIcon from "@/components/sidebar/PlaylistIcon.vue";
import Topbar from "@/components/sidebar/SidebarHead.vue";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import VisibilityIcon from "@/components/sidebar/VisibilityIcon.vue";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import { useAuth } from "@/views/auth/AuthStore";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const authStore = useAuth();
const route = useRoute();

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

// Optimized: pre-computed filtered collections with memoized toLowerCase and displayName
const filteredCollections = computed(() => {
  const searchQuery = collectionSearchQuery.value.toLowerCase();

  return sidebarStore.collections
    .map((playlist) => ({
      ...playlist,
      lowerName: playlist.name.toLowerCase(),
      displayName: playlist.name.replace("#Collection ", "").replace("#collection ", ""),
    }))
    .filter((playlist) => playlist.lowerName.includes(searchQuery));
});

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

// Optimized: pre-computed filtered playlists with memoized toLowerCase
const filteredPlaylists = computed(() => {
  const searchQuery = playlistSearchQuery.value.toLowerCase();

  return sidebarStore.playlists.filter((playlist) => playlist.name.toLowerCase().includes(searchQuery));
});

// Close sidebar on route change (mobile)
watch(
  () => route.fullPath,
  () => sidebarStore.close(),
);

if ((authStore.me && !sidebarStore.collections.length) || !sidebarStore.playlists.length)
  sidebarStore.getPlaylists("me/playlists?limit=50");
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/mixins" as *;

.empty {
  font-style: italic;
  opacity: 0.5;
  padding: 0.8rem 20px 0.8rem 1rem;
}

.playlist-item {
  align-items: center;
  color: currentcolor;
  display: flex;

  @include font-bold;

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

  @include responsive.tablet-down {
    bottom: 0;
    left: 0;
    max-width: 20rem;
    position: fixed;
    top: 0;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 80%;
    z-index: 1000;

    &.is-open {
      transform: translateX(0);
    }
  }

  &.search-opened {
    grid-template-rows: auto auto 1fr 1fr;
  }

  &.loading {
    display: grid;
    place-content: center;
  }
}

.sidebar-backdrop {
  background-color: rgb(0 0 0 / 50%);
  inset: 0;
  opacity: 0;
  pointer-events: none;
  position: fixed;
  transition: opacity 0.3s ease;
  z-index: 999;

  &.is-visible {
    opacity: 1;
    pointer-events: auto;
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

  @include font-bold;

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
