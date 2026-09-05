<template>
  <div class="sidebar-backdrop" :class="{ 'is-visible': sidebarStore.isOpen }" @click="sidebarStore.close()" />
  <div
    v-if="sidebarStore.loadFailed && !sidebarStore.playlists.length && !sidebarStore.collections.length"
    class="sidebar loading"
    :class="{ 'is-open': sidebarStore.isOpen }"
  >
    <div class="load-error">
      <i class="icon-warning" />
      <BdButton variant="nude" @click="sidebarStore.refreshPlaylists()">
        <i class="icon-refresh" />
        Retry
      </BdButton>
    </div>
  </div>
  <div
    v-else-if="!sidebarStore.playlists.length && !sidebarStore.collections.length"
    class="sidebar loading"
    :class="{ 'is-open': sidebarStore.isOpen }"
  >
    <BdLoader />
  </div>
  <nav
    v-else
    :class="{ 'search-opened': collectionSearchOpened || playlistSearchOpened, 'is-open': sidebarStore.isOpen }"
    aria-label="Collections and playlists"
    class="sidebar"
  >
    <Topbar />
    <Menu />
    <div class="sidebar-item">
      <div v-if="!collectionSearchOpened" class="bd-heading title">
        <div class="title-name">Collections</div>
        <div class="options">
          <IconButton
            class="icon"
            icon="refresh"
            label="Refresh collections"
            @click="sidebarStore.refreshPlaylists()"
          />
          <IconButton
            class="icon"
            icon="search"
            label="Search collections"
            @click="() => (collectionSearchOpened = true)"
          />
          <IconButton
            class="icon add"
            icon="plus"
            label="New collection"
            @click="dialogStore.open({ type: 'createCollection' })"
          />
        </div>
      </div>
      <div v-else ref="collectionSearchWrap" class="bd-heading title">
        <BdInput
          ref="collectionSearchInput"
          v-model="collectionSearchQuery"
          class="search"
          placeholder="Search collection"
          size="small"
          type="search"
        />
      </div>
      <div v-if="!sidebarStore.collections.length" class="empty">
        Oh well, you don't have a collection ! To create one, you just have to create one with + button or add
        "#Collection" to a classic playlist's description. Magical, isn't it?
      </div>
      <div v-for="(playlist, index) in filteredCollections" v-else :key="index">
        <router-link
          v-if="playlist.id"
          :class="{ active: $route.params.id === playlist.id }"
          :to="`/collection/${playlist.id}`"
          class="playlist-item bd-font-bold"
        >
          <PlaylistIcon :playlist="playlist" />
          <div class="name">
            {{ playlist.displayName }}
            <BdTooltip v-if="playlist.isTop" bare content="Top ranking enabled">
              <span class="top-badge">TOP</span>
            </BdTooltip>
            <BdTooltip v-if="playlist.isTierList" bare content="Tier list enabled">
              <span class="tier-badge">TIER</span>
            </BdTooltip>
          </div>
          <VisibilityIcon :playlist="playlist" />
          <IconButton
            class="edit"
            icon="more-vertical"
            :label="`Options for ${playlist.displayName}`"
            @click.prevent="
              dialogStore.open({
                type: 'editPlaylist',
                playlistId: playlist.id,
              })
            "
          />
        </router-link>
      </div>
    </div>
    <div class="sidebar-item">
      <div v-if="!playlistSearchOpened" class="bd-heading title">
        <div class="title-name">Playlists</div>
        <div class="options">
          <IconButton class="icon" icon="refresh" label="Refresh playlists" @click="sidebarStore.refreshPlaylists()" />
          <IconButton
            class="icon"
            icon="search"
            label="Search playlists"
            @click="() => (playlistSearchOpened = true)"
          />
          <IconButton
            class="icon add"
            icon="plus"
            label="New playlist"
            @click="dialogStore.open({ type: 'createPlaylist' })"
          />
        </div>
      </div>
      <div v-else ref="playlistSearchWrap" class="bd-heading title">
        <BdInput
          ref="playlistSearchInput"
          v-model="playlistSearchQuery"
          class="search"
          placeholder="Search playlist"
          size="small"
          type="search"
        />
      </div>
      <div v-for="(playlist, index) in filteredPlaylists" :key="index">
        <router-link
          v-if="playlist.id && playlist.name !== ''"
          :class="{ active: $route.params.id === playlist.id }"
          :to="`/playlist/${playlist.id}`"
          class="playlist-item bd-font-bold"
        >
          <PlaylistIcon :playlist="playlist" />
          <div class="name">
            {{ playlist.name }}
          </div>
          <VisibilityIcon :playlist="playlist" />
          <IconButton
            class="edit"
            icon="more-vertical"
            :label="`Options for ${playlist.name}`"
            @click.prevent="
              dialogStore.open({
                type: 'editPlaylist',
                playlistId: playlist.id,
              })
            "
          />
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { onClickOutside } from "@vueuse/core";
import { BdButton, BdInput, BdLoader, BdTooltip } from "bearded-ui";
import { computed, ref, Ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";

import { useDialog } from "@/components/dialog/DialogStore";
import Menu from "@/components/sidebar/MainMenu.vue";
import PlaylistIcon from "@/components/sidebar/PlaylistIcon.vue";
import Topbar from "@/components/sidebar/SidebarHead.vue";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import VisibilityIcon from "@/components/sidebar/VisibilityIcon.vue";
import IconButton from "@/components/ui/IconButton.vue";
import { parseCollectionRankingMode } from "@/helpers/collectionOptions";
import { collectionDisplayName } from "@/helpers/isCollection";
import { useAuth } from "@/views/auth/AuthStore";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const authStore = useAuth();
const route = useRoute();

// Collection search
const collectionSearchOpened = ref<boolean>(false);
const collectionSearchQuery = ref<string>("");
const collectionSearchInput: Ref<InstanceType<typeof BdInput> | null> = ref(null);
// The wrapper, not the field: BdInput is a component, and VueUse's onClickOutside
// only takes an element ref.
const collectionSearchWrap: Ref<HTMLElement | null> = ref(null);

onClickOutside(collectionSearchWrap, () => {
  collectionSearchOpened.value = false;
  collectionSearchQuery.value = "";
});

watch(collectionSearchInput, () => collectionSearchInput.value?.focus());

// Parsed once per collections change, independent of the search query, so typing
// in the filter box doesn't re-parse every description on each keystroke.
const enrichedCollections = computed(() =>
  sidebarStore.collections.map((playlist) => {
    const mode = parseCollectionRankingMode(playlist.description);
    return {
      ...playlist,
      displayName: collectionDisplayName(playlist.name),
      isTierList: mode.type === "tierlist",
      isTop: mode.type === "top",
      lowerName: playlist.name.toLowerCase(),
    };
  }),
);

const filteredCollections = computed(() => {
  const searchQuery = collectionSearchQuery.value.toLowerCase();
  return enrichedCollections.value.filter((playlist) => playlist.lowerName.includes(searchQuery));
});

// Playlist search
const playlistSearchOpened = ref<boolean>(false);
const playlistSearchQuery = ref<string>("");
const playlistSearchInput: Ref<InstanceType<typeof BdInput> | null> = ref(null);
// The wrapper, not the field: BdInput is a component, and VueUse's onClickOutside
// only takes an element ref.
const playlistSearchWrap: Ref<HTMLElement | null> = ref(null);

onClickOutside(playlistSearchWrap, () => {
  playlistSearchOpened.value = false;
  playlistSearchQuery.value = "";
});

watch(playlistSearchInput, () => playlistSearchInput.value?.focus());

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

<style scoped>

.empty {
  color: var(--bd-font-color-dark);
  font-style: italic;
  padding: var(--bd-space-3) var(--bd-space-4);
}

.playlist-item {
  align-items: center;
  color: currentcolor;
  display: flex;
  justify-content: space-between;
  padding: var(--bd-space-1) var(--bd-space-4);
  text-decoration: none;

  .edit {
    background-color: var(--bd-bg);
    border: none;
    border-radius: var(--bd-radius-full);
    color: var(--bd-font-color);
    cursor: pointer;
    font-size: var(--bd-font-size-sm);
    opacity: 0;
    padding: var(--bd-space-1) var(--bd-space-3);
    position: absolute;
    right: 0.5rem;
    transition: background-color var(--bd-transition);

    &:hover {
      background-color: var(--bd-bg-lighter);
    }
  }

  .name {
    flex: 1;
    text-align: left;
    transition: transform var(--bd-transition);
  }

  .tier-badge,
  .top-badge {
    border-radius: var(--bd-radius-sm);
    color: white;
    font-size: 0.6rem;
    letter-spacing: 0.03rem;
    margin-left: var(--bd-space-2);
    padding: 0.1rem var(--bd-space-1);
    vertical-align: middle;
  }

  .top-badge {
    background-color: var(--bd-primary);
  }

  .tier-badge {
    background: linear-gradient(90deg, hsl(0deg 70% 40%), hsl(120deg 70% 40%));
  }

  &:hover {
    background-color: var(--bd-hover-overlay);

    .edit {
      opacity: 1;
    }

    .name {
      transform: translateX(0.2rem);
    }
  }
}

/*
 * These used to be `visibility: hidden` until the section was hovered, which
 * took them out of the tab order entirely — "New collection", the product's
 * central action, was unreachable by keyboard and absent on touch. They stay in
 * the tree now: only opacity moves, `:focus-within` reveals them for keyboard
 * users, and coarse pointers get them outright since there is no hover there.
 */
.options {
  opacity: 0;
  transition: opacity var(--bd-transition);

  @media (pointer: coarse) {
    opacity: 1;
  }

  .icon {
    background-color: transparent;
    border: 0;
    border-radius: var(--bd-radius-full);
    color: var(--bd-font-color);
    cursor: pointer;
    opacity: 0.4;
    padding: var(--bd-space-1) var(--bd-space-2);

    &:hover {
      background-color: var(--bd-bg-lighter);
      opacity: 1;
    }
  }
}

.sidebar {
  animation: pop-content 1s ease both;
  background: var(--bd-bg-dark);
  display: grid;
  grid-template-rows: auto auto auto;
  overflow: hidden;

  @media (--tablet-down) {
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

  .load-error {
    align-items: center;
    color: var(--bd-font-color-dark);
    display: flex;
    flex-direction: column;
    gap: var(--bd-space-3);
  }
}

.sidebar-backdrop {
  background-color: rgb(0 0 0 / 50%);
  inset: 0;
  opacity: 0;
  pointer-events: none;
  position: fixed;
  transition: opacity var(--bd-duration) ease;
  z-index: 999;

  &.is-visible {
    opacity: 1;
    pointer-events: auto;
  }
}

.sidebar-item {
  overflow-y: auto;
  position: relative;

  &:hover,
  &:focus-within {
    .options {
      opacity: 1;
    }
  }
}

.search {
  width: 100%;
}

.title {
  align-items: center;
  background-color: var(--bd-bg-dark);
  color: var(--bd-font-color);
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: var(--bd-space-3) var(--bd-space-3) var(--bd-space-3) var(--bd-space-4);
  position: sticky;
  top: 0;
  z-index: 1;

  .title-name {
    color: var(--bd-font-color-dark);
  }
}
</style>
