<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader"><Loader /></div>
  <PageScroller v-else>
    <PageFit>
      <div class="collection">
        <Header no-cover no-duration />
        <div class="content">
          <SlickList
            v-model:list="albumList"
            axis="xy"
            class="album-list"
            :press-delay="200"
            @sort-end="syncNewPositions"
          >
            <SlickItem
              v-for="(item, i) in albumListFiltered"
              :key="item.id"
              :index="i"
              :disabled="playlistStore.playlist.owner.id !== authStore.me?.id"
            >
              <Album :album="item" with-artists can-delete can-save />
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
import { AlbumSimplified } from "../../@types/Album";
import Loader from "../../components/LoadingDots.vue";
import PageFit from "../../components/PageFit.vue";
import PageScroller from "../../components/PageScroller.vue";
import Album from "../../components/album/AlbumIndex.vue";
import Header from "../../components/playlist/PlaylistHeader.vue";
import { useAuth } from "../auth/AuthStore";
import { usePlaylist } from "./PlaylistStore";

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

function syncNewPositions(event: { oldIndex: number; newIndex: number }): void {
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
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.collection {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
}

.content {
  position: relative;
}

.album-list {
  $padd: 10rem;

  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(4, 1fr);
  inset: 0;
  overflow: auto;
  padding: 2rem 5rem;
  padding-left: $padd;
  padding-right: $padd;
  position: absolute;
  transition:
    padding-right ease 0.2s,
    padding-left ease 0.2s;

  @media (width <= 1200px) {
    $padd: 2rem;

    grid-template-columns: repeat(4, 1fr);
    padding-left: $padd;
    padding-right: $padd;
  }

  @include l {
    $padd: 2rem;

    grid-template-columns: repeat(4, 1fr);
    padding-left: $padd;
    padding-right: $padd;
  }

  @include l {
    $padd: 2rem;

    grid-template-columns: repeat(8, 1fr);
    padding-left: $padd;
    padding-right: $padd;
  }

  @include hdpi {
    grid-template-columns: repeat(12, 1fr);
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
