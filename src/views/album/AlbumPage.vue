<template>
  <div class="loader" v-if="albumStore.album.name === ''"><Loader /></div>
  <div class="album-page" ref="albumpage" v-else>
    <div class="fit">
      <Head :album="albumStore.album" />
      <div class="content">
        <div class="content-cover">
          <Album :album="albumStore.album" :cover-size="'large'" can-save without-metas />
        </div>
        <div class="content-tracks">
          <div
            :class="{
              active: isCurrentTrack(track, currentTrack),
              unavailable: !track.available_markets.length,
            }"
            :key="index"
            @click="playSongs(index, albumStore.album.tracks.items)"
            class="track"
            v-for="(track, index) in albumStore.album.tracks.items"
          >
            <ButtonIndex
              no-default-class
              class="add"
              @click.prevent.stop="dialogStore.open({ type: 'addSong', track: track })"
            >
              <i class="icon-plus"></i>
            </ButtonIndex>
            <span class="track-number">{{ track.track_number }}.</span>
            <div>
              <div>{{ track.name }}</div>
              <div v-if="albumStore.album.artists.length">
                <ArtistList
                  :artist-list="track.artists.filter((e) => e.name !== albumStore.album.artists[0].name)"
                  feat
                />
              </div>
            </div>
            <div class="duration">{{ timecode(track.duration_ms) }}</div>
          </div>
        </div>
      </div>
      <Foot :album="albumStore.album" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import Foot from "@/components/album/AlbumFoot.vue";
import Head from "@/components/album/AlbumHead.vue";
import Album from "@/components/album/AlbumIndex.vue";
import ArtistList from "@/components/artist/ArtistList.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { usePlayer } from "@/components/player/PlayerStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import { timecode } from "@/helpers/date";
import { isCurrentTrack } from "@/helpers/helper";
import { playSongs } from "@/helpers/play";
import { useAlbum } from "@/views/album/AlbumStore";

const props = defineProps({ id: { default: "", type: String } });
const albumStore = useAlbum();
const playerStore = usePlayer();
const dialogStore = useDialog();

const currentTrack = computed(() => playerStore.playerState?.track_window.current_track);

albumStore.clean().finally(() => albumStore.getAlbum(props.id));
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/mixins" as *;

.fit {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4rem;
  margin: 0 auto;
  max-width: 57rem;
  width: 100%;

  @include responsive.hdpi {
    max-width: 100rem;
  }
}

.add {
  background: none;
  border: none;
  color: var(--font-color);
  cursor: pointer;
  font-size: var(--font-size-lg);
  opacity: 0;
  padding: 0;
  padding-right: 7px;
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  transition: 0.2s;
}

.track {
  @include font-bold;

  border-radius: 0.4rem;
  cursor: pointer;
  display: grid;
  grid-template-columns: 2rem 1fr auto;
  margin-bottom: 0.3rem;
  padding: 0.4rem 0.8rem;
  position: relative;

  &:hover {
    background-color: var(--bg-color-dark);

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
    background-color: var(--bg-color);
  }
}

.track-number {
  @include font-italic;

  font-variant: tabular-nums;
  opacity: 0.5;
}

.content {
  display: flex;
  flex: 1;
  gap: 3rem;
  justify-content: center;

  @include responsive.tablet-down {
    flex-direction: column;
    gap: 2rem;
  }

  @include responsive.l {
    flex-direction: column;
  }
}

.content-cover {
  width: 18rem;

  @include responsive.tablet-down {
    margin: 0 auto;
    width: 12rem;
  }
}

.content-tracks {
  flex: 1;
  font-size: var(--font-size-base);

  @include responsive.mobile {
    font-size: var(--font-size-sm);
  }
}

.album-page {
  animation: pop-content 1s ease both;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  padding: 2rem 2.2rem;
  scroll-behavior: smooth;

  @include responsive.mobile {
    padding: 1rem;
  }

  @include responsive.tablet {
    padding: 1.5rem;
  }
}

.loader {
  display: grid;
  place-content: center;
}

.duration {
  font-variant: tabular-nums;
}
</style>
