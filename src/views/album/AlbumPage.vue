<template>
  <div v-if="albumStore.album.name === ''" class="loader">
    <BdLoader />
  </div>
  <div v-else ref="pageRef" class="album-page" @scroll="onScroll">
    <div class="fit">
      <Head :album="albumStore.album" />
      <div class="content">
        <div class="content-cover">
          <Album :album="albumStore.album" :cover-size="'large'" can-save without-metas />
        </div>
        <div class="content-tracks">
          <div
            v-for="(track, index) in albumStore.album.tracks.items"
            :key="index"
            :class="{
              active: isCurrentTrack(track, currentTrack),
              unavailable: !track.available_markets.length,
            }"
            class="track bd-font-bold"
            @click="playSongs(index, albumStore.album.tracks.items)"
          >
            <IconButton
              class="add"
              icon="plus"
              :label="`Add ${track.name} to a playlist`"
              @click.prevent.stop="dialogStore.open({ type: 'addSong', track: track })"
            />
            <span class="track-number bd-font-italic">{{ track.track_number }}.</span>
            <div>
              <div>{{ track.name }}</div>
              <div v-if="albumStore.album.artists.length">
                <ArtistList
                  :artist-list="track.artists.filter((e) => e.name !== albumStore.album.artists[0].name)"
                  feat
                />
              </div>
            </div>
            <div class="duration">
              {{ timecode(track.duration_ms) }}
            </div>
          </div>
        </div>
      </div>
      <Foot :album="albumStore.album" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdLoader } from "bearded-ui";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import Foot from "@/components/album/AlbumFoot.vue";
import Head from "@/components/album/AlbumHead.vue";
import Album from "@/components/album/AlbumIndex.vue";
import ArtistList from "@/components/artist/ArtistList.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { usePlayer } from "@/components/player/PlayerStore";
import IconButton from "@/components/ui/IconButton.vue";
import { useScrollRestore } from "@/composables/useScrollRestore";
import { timecode } from "@/helpers/date";
import { isCurrentTrack } from "@/helpers/helper";
import { playSongs } from "@/helpers/play";
import { useAlbum } from "@/views/album/AlbumStore";

const props = defineProps({ id: { default: "", type: String } });
const albumStore = useAlbum();
const playerStore = usePlayer();
const dialogStore = useDialog();
const route = useRoute();

const currentTrack = computed(() => playerStore.playerState?.track_window.current_track);

const pageRef = ref<HTMLElement | null>(null);
const { onScroll, restoreScroll } = useScrollRestore(`scroll-${route.path}`, pageRef);

// No keep-alive: the page remounts on every navigation, so the scroll position
// must be restored after the fresh content has loaded (height is stable then).
albumStore.clean().finally(() => albumStore.getAlbum(props.id).finally(() => restoreScroll()));
</script>

<style scoped>

.fit {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--bd-space-8);
  margin: 0 auto;
  max-width: 57rem;
  width: 100%;

  @media (--hdpi) {
    max-width: 100rem;
  }
}

.add {
  background: none;
  border: none;
  color: var(--bd-font-color);
  cursor: pointer;
  font-size: var(--bd-font-size-lg);
  opacity: 0;
  padding: 0;
  padding-right: var(--bd-space-2);
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  transition: opacity var(--bd-transition);
}

.track {
  border-radius: var(--bd-radius-sm);
  cursor: pointer;
  display: grid;
  grid-template-columns: 2rem 1fr auto;
  margin-bottom: var(--bd-space-1);
  padding: var(--bd-space-2) var(--bd-space-3);
  position: relative;

  &:hover {
    background-color: var(--bd-bg-dark);

    .add {
      opacity: 0.3;
    }
  }

  &.unavailable {
    cursor: default;
    opacity: 0.2;
    pointer-events: none;
  }

  .add:hover {
    opacity: 1;
  }

  &:active {
    background-color: var(--bd-bg);
  }
}

.track-number {
  color: var(--bd-font-color-dark);
  font-variant-numeric: tabular-nums;
}

.content {
  display: flex;
  flex: 1;
  gap: var(--bd-space-7);
  justify-content: center;

  @media (--tablet-down) {
    flex-direction: column;
    gap: var(--bd-space-6);
  }

  @media (--l) {
    flex-direction: column;
  }
}

.content-cover {
  width: 18rem;

  @media (--tablet-down) {
    margin: 0 auto;
    width: 12rem;
  }
}

.content-tracks {
  flex: 1;
  font-size: var(--bd-font-size-base);

  @media (--mobile) {
    font-size: var(--bd-font-size-sm);
  }
}

.album-page {
  animation: pop-content 1s ease both;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: var(--bd-space-6);
  scroll-behavior: smooth;

  @media (--mobile) {
    padding: var(--bd-space-4);
  }

  @media (--tablet) {
    padding: var(--bd-space-5);
  }
}

.loader {
  display: grid;
  place-content: center;
}

.duration {
  font-variant-numeric: tabular-nums;
}
</style>
