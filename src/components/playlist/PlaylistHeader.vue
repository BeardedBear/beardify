<template>
  <div :class="{ 'not-fit': notFit }" class="playlist-header">
    <div class="playlist-header-left">
      <Cover v-if="!noCover" :images="playlistStore.playlist.images" class="cover" size="large" />
      <div>
        <h1 class="title font-bold">
          {{ playlistStore.playlist.name.replace("#Collection ", "") }}
        </h1>
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
    <!--
      Mobile routes through PlaylistOptionsDialog, which already bundles the
      actions, the filter and the share block — the same convention ArtistHeader
      uses for artist options. The .right column below used to try to be its own
      mobile sheet, gated on an `is-open` class nothing ever set, so the filter,
      share and every playlist action were simply unreachable on a phone.
    -->
    <BdButton
      aria-label="Playlist options"
      class="mobile-options"
      icon-only
      title="Playlist options"
      variant="nude"
      @click="dialogStore.open({ playlistId: playlistStore.playlist.id, type: 'playlistOptions' })"
    >
      <i aria-hidden="true" class="icon-more-vertical" />
    </BdButton>
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
  color: var(--font-color-dark);
  margin-top: 0.5rem;
  max-width: 80%;
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

/*
 * Reads the shared --page-inset so the title lines up with the album grid below
 * it. The old private --header-padd also declared 50rem at --hdpi, which never
 * applied: the --xl block below it matched too and won on source order.
 */
.playlist-header {
  display: flex;
  justify-content: space-between;
  padding: 2rem var(--page-inset) 1rem;
  transition:
    padding-right ease 0.2s,
    padding-left ease 0.2s;

  &.not-fit {
    padding: 0 0 2rem;
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
    display: none;
  }
}

.mobile-options {
  display: none;

  @media (--mobile) {
    display: inline-flex;
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
