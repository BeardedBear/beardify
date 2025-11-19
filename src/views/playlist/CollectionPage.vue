<template>
  <div class="loader" v-if="playlistStore.playlist.name === ''"><Loader /></div>
  <PageScroller v-else>
    <PageFit>
      <div class="collection">
        <Header no-cover no-duration />
        <div class="content">
          <SlickList
            :press-delay="200"
            @sort-end="syncNewPositions"
            axis="xy"
            class="album-list"
            v-model:list="albumList"
          >
            <SlickItem
              :disabled="playlistStore.playlist.owner.id !== authStore.me?.id"
              :index="i"
              :key="item.id"
              v-for="(item, i) in albumListFiltered"
            >
              <Album :album="item" can-delete can-save with-artists />
            </SlickItem>
          </SlickList>
        </div>
      </div>
    </PageFit>
  </PageScroller>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { SlickItem, SlickList } from "vue-slicksort";

import { AlbumSimplified } from "@/@types/Album";
import Album from "@/components/album/AlbumIndex.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import PageFit from "@/components/ui/PageFit.vue";
import PageScroller from "@/components/ui/PageScroller.vue";
import Header from "@/components/playlist/PlaylistHeader.vue";
import { useAuth } from "@/views/auth/AuthStore";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const props = defineProps<{ id: string }>();
const playlistStore = usePlaylist();
const albumList = ref<AlbumSimplified[]>([]);
const authStore = useAuth();

const albumListFiltered = computed<AlbumSimplified[]>(() => {
  if (playlistStore.filter === "") return albumList.value;
  return albumList.value.filter((album) => {
    const matchedArtistName = album.artists[0].name.toLowerCase().includes(playlistStore.filter.toLowerCase());
    const matchedAlbumName = album.name.toLowerCase().includes(playlistStore.filter.toLowerCase());
    return matchedArtistName || matchedAlbumName;
  });
});

function syncNewPositions(event: { newIndex: number; oldIndex: number }): void {
  playlistStore.updateCollectionPosition(event.oldIndex, event.newIndex);
}

watch(
  () => playlistStore.tracks,
  () => (albumList.value = playlistStore.tracks.map((a) => a.track.album)),
);

playlistStore.clean().finally(() => {
  playlistStore.getPlaylist(`playlists/${props.id}`);
  playlistStore.getTracks(`playlists/${props.id}/tracks`);
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

.collection {
  display: grid;
  grid-template-rows: auto auto;
}

.content {
  display: contents;
}

.album-list {
  $padd: 10rem;

  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(4, 1fr);
  padding: 2rem 5rem;
  padding-left: $padd;
  padding-right: $padd;
  transition:
    padding-right ease 0.2s,
    padding-left ease 0.2s;

  @media (width <= 1200px) {
    $padd: 2rem;

    grid-template-columns: repeat(4, 1fr);
    padding-left: $padd;
    padding-right: $padd;
  }

  @include responsive.l {
    $padd: 2rem;

    grid-template-columns: repeat(4, 1fr);
    padding-left: $padd;
    padding-right: $padd;
  }

  @include responsive.l {
    $padd: 2rem;

    grid-template-columns: repeat(8, 1fr);
    padding-left: $padd;
    padding-right: $padd;
  }

  @include responsive.hdpi {
    grid-template-columns: repeat(12, 1fr);
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
