<template>
  <div :class="{ 'not-fit': notFit }" class="playlist-header">
    <div class="playlist-header-left">
      <Cover v-if="!noCover" :images="playlistStore.playlist.images" class="cover" size="large" />
      <div>
        <div class="title font-bold">
          {{ playlistStore.playlist.name.replace("#Collection ", "") }}
        </div>
        <div class="metas font-bold">
          <router-link
            v-if="playlistStore.playlist.owner.display_name !== 'Spotify'"
            :to="`/user/${playlistStore.playlist.owner.id}`"
            class="owner"
          >
            {{ playlistStore.playlist.owner.display_name }}
          </router-link>
          <span v-else>{{ playlistStore.playlist.owner.display_name }}</span>
          <span>&nbsp;·&nbsp;{{ playlistStore.playlist.tracks.total }} items</span>
          <span v-if="!noDuration">&nbsp;·&nbsp;{{ timecodeWithUnits(sumDuration(playlistStore.tracks)) }}</span>
        </div>
        <div v-if="showDescription" class="description font-italic">
          {{ visibleDescription }}
        </div>
      </div>
    </div>
    <div class="right">
      <BdInput
        v-if="withFilter"
        ref="filterInput"
        v-model="playlistStore.filter"
        class="search"
        placeholder="Filter..."
        type="search"
      />
      <BdButton
        v-if="showMigrateButton"
        :title="migrateButtonTooltip"
        variant="border"
        @click="playlistStore.migrateLegacyCollectionTag()"
      >
        <i class="icon-folder" />
        Convert to new collection format
      </BdButton>
      <BdButton
        v-if="canShare"
        icon-only
        title="Share this collection"
        variant="nude"
        @click="dialogStore.open({ playlistId: playlistStore.playlist.id, type: 'shareCollection' })"
      >
        <i class="icon-share" />
      </BdButton>
      <Actions />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdInput } from "bearded-ui";
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";

import { PlaylistTrack } from "@/@types/Playlist";
import { useDialog } from "@/components/dialog/DialogStore";
import Actions from "@/components/playlist/PlaylistActions.vue";
import Cover from "@/components/ui/AlbumCover.vue";
import { stripCollectionTags } from "@/helpers/collectionOptions";
import { timecodeWithUnits } from "@/helpers/date";
import { isLegacyCollectionName } from "@/helpers/isCollection";
import { isPlaylistOwner } from "@/helpers/playlist";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const props = defineProps<{
  noCover?: boolean;
  noDuration?: boolean;
  notFit?: boolean;
  withFilter?: boolean;
}>();

const dialogStore = useDialog();
const playlistStore = usePlaylist();
const route = useRoute();
const filterInput = ref<InstanceType<typeof BdInput> | null>(null);

const canShare = computed<boolean>(
  () =>
    route.name === "Collection"
    && playlistStore.playlist.public
    && isPlaylistOwner(playlistStore.playlist.owner),
);
const showMigrateButton = computed<boolean>(
  () => isPlaylistOwner(playlistStore.playlist.owner) && isLegacyCollectionName(playlistStore.playlist),
);
const migrateButtonTooltip
  = "This collection still uses the old #Collection tag in its name. Beardify now reads it from the description "
    + "instead — click to convert it automatically.";
const visibleDescription = computed<string>(() => stripCollectionTags(playlistStore.playlist.description));
const showDescription = computed<boolean>(
  () =>
    visibleDescription.value !== ""
    && visibleDescription.value !== "null"
    && visibleDescription.value !== "No description",
);

onMounted(() => {
  if (props.withFilter) filterInput.value?.focus();
});

function sumDuration(tracks: PlaylistTrack[]): number {
  return tracks.map((t: PlaylistTrack) => (t.item ? t.item.duration_ms : 0)).reduce((acc, value) => acc + value, 0);
}
</script>

<style scoped>

.search {
  width: 10rem;
}

.description {
  margin-top: 0.5rem;
  max-width: 80%;
  opacity: 0.5;
}

.metas {
  .owner {
    color: var(--primary-color);
    text-decoration: none;
  }
}

.title {
  font-size: var(--font-size-xl);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.playlist-header {
  --header-padd: 5rem;

  display: flex;
  justify-content: space-between;
  padding: 2rem var(--header-padd) 1rem;
  transition:
    padding-right ease 0.2s,
    padding-left ease 0.2s;

  @media (--narrow-desktop-down) {
    --header-padd: 2rem;
  }

  &.not-fit {
    padding: 0 0 2rem;
  }

  @media (--hdpi) {
    --header-padd: 50rem;
  }

  @media (--xl) {
    --header-padd: 2rem;
  }

  img {
    margin-right: 2rem;
  }
}

.playlist-header-left {
  align-items: center;
  display: flex;
}

.right {
  align-items: center;
  display: flex;
  font-size: var(--font-size-lg);
  gap: 0.5rem;

  @media (--mobile) {
    background: var(--bg-color-dark);
    border-radius: 1rem;
    display: none;
    flex-direction: column;
    gap: 1.5rem;
    left: 50%;
    padding: 3rem 2rem 2rem;
    position: fixed;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    z-index: 1000;

    &.is-open {
      display: flex;
    }

    .search {
      width: 100%;
    }
  }
}

.mobile-options-toggle {
  display: none;
  font-size: var(--font-size-xl);

  @media (--mobile) {
    display: block;
  }
}

.mobile-close {
  cursor: pointer;
  display: none;
  position: absolute;
  right: 1rem;
  top: 1rem;

  @media (--mobile) {
    display: block;
  }
}

.backdrop {
  background: rgb(0 0 0 / 50%);
  display: none;
  inset: 0;
  position: fixed;
  z-index: 999;

  @media (--mobile) {
    display: block;
  }
}

.cover {
  border-radius: 0.3rem;
  height: 7rem;
  width: 7rem;

  @media (--mobile) {
    display: none;
  }
}
</style>
