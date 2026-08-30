<template>
  <div :class="{ 'not-fit': notFit }" class="playlist-header">
    <div class="playlist-header-left">
      <Cover v-if="!noCover" :images="playlistStore.playlist.images" class="cover" size="large" />
      <div>
        <h1 class="title bd-font-bold">
          {{ collectionDisplayName(playlistStore.playlist.name) }}
        </h1>
        <div class="metas bd-font-bold">
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
        <div v-if="showDescription" class="description bd-font-italic">
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
    <BdTooltip bare content="Playlist options">
      <BdButton
        aria-label="Playlist options"
        class="mobile-options"
        icon-only
        variant="nude"
        @click="dialogStore.open({ playlistId: playlistStore.playlist.id, type: 'playlistOptions' })"
      >
        <i aria-hidden="true" class="icon-more-vertical" />
      </BdButton>
    </BdTooltip>
    <div class="right">
      <BdInput
        v-if="withFilter"
        ref="filterInput"
        v-model="playlistStore.filter"
        class="search"
        placeholder="Filter..."
        type="search"
      />
      <BdTooltip v-if="showMigrateButton" :content="migrateButtonTooltip" bare>
        <BdButton variant="border" @click="playlistStore.migrateLegacyCollectionTag()">
          <i class="icon-folder" />
          Convert to new collection format
        </BdButton>
      </BdTooltip>
      <BdTooltip v-if="canShare" bare content="Share this collection">
        <BdButton
          icon-only
          variant="nude"
          @click="dialogStore.open({ playlistId: playlistStore.playlist.id, type: 'shareCollection' })"
        >
          <i class="icon-share" />
        </BdButton>
      </BdTooltip>
      <Actions />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdInput, BdTooltip } from "bearded-ui";
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";

import { PlaylistTrack } from "@/@types/Playlist";
import { useDialog } from "@/components/dialog/DialogStore";
import Actions from "@/components/playlist/PlaylistActions.vue";
import Cover from "@/components/ui/AlbumCover.vue";
import { stripCollectionTags } from "@/helpers/collectionOptions";
import { timecodeWithUnits } from "@/helpers/date";
import { collectionDisplayName, isLegacyCollectionName } from "@/helpers/isCollection";
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
  color: var(--bd-font-color-dark);
  margin-top: var(--bd-space-2);
  max-width: 80%;
}

.metas {
  .owner {
    color: var(--bd-primary);
    text-decoration: none;
  }
}

.title {
  font-size: var(--bd-font-size-xl);
  line-height: 1;
  margin-bottom: var(--bd-space-2);
}

/*
 * Reads the shared --page-inset so the title lines up with the album grid below
 * it. The old private --header-padd also declared 50rem at --hdpi, which never
 * applied: the --xl block below it matched too and won on source order.
 */
.playlist-header {
  display: flex;
  justify-content: space-between;
  padding: var(--bd-space-6) var(--page-inset) var(--bd-space-4);
  transition:
    padding-right var(--bd-transition),
    padding-left var(--bd-transition);

  &.not-fit {
    padding: 0 0 var(--bd-space-6);
  }

  img {
    margin-right: var(--bd-space-6);
  }
}

.playlist-header-left {
  align-items: center;
  display: flex;
}

.right {
  align-items: center;
  display: flex;
  font-size: var(--bd-font-size-lg);
  gap: var(--bd-space-2);

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
  border-radius: var(--bd-radius-sm);
  height: 7rem;
  width: 7rem;

  @media (--mobile) {
    display: none;
  }
}
</style>
