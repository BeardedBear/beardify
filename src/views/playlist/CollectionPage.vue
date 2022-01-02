<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader"><Loader /></div>
  <PageScroller v-else>
    <PageFit>
      <div class="collection">
        <Header no-cover no-duration />
        <SlickList
          v-model:list="albumList"
          axis="xy"
          class="album-list"
          :press-delay="200"
          :accept="true"
          @sort-end="syncNewPositions"
        >
          <SlickItem
            v-for="(item, i) in albumList"
            :key="i"
            :index="i"
            :disabled="playlistStore.playlist.owner.id !== authStore.me?.id"
          >
            <Album :album="item" with-artists can-delete can-save />
          </SlickItem>
        </SlickList>
      </div>
    </PageFit>
  </PageScroller>
</template>

<script lang="ts" setup>
import { defineProps, ref, watch } from "vue";
import Album from "../../components/album/Album.vue";
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";
import { usePlaylist } from "./PlaylistStore";
import Loader from "../../components/LoadingDots.vue";
import PageScroller from "../../components/PageScroller.vue";
import PageFit from "../../components/PageFit.vue";
import Header from "../../components/playlist/Header.vue";
import { SlickList, SlickItem } from "vue-slicksort";
import { AlbumSimplified } from "../../@types/Album";
import { useAuth } from "../auth/AuthStore";

const props = defineProps<{ id: string }>();
const playlistStore = usePlaylist();
const albumList = ref<AlbumSimplified[]>([]);
const authStore = useAuth();

function syncNewPositions(event: { oldIndex: number; newIndex: number }): void {
  playlistStore.updateCollectionPosition(event.oldIndex, event.newIndex);
}

watch(
  () => playlistStore.tracks,
  () => (albumList.value = removeDuplicatesAlbums(playlistStore.tracks.map((a) => a.track.album))),
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
  padding: 2rem;
}

.album-list {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(4, 1fr);

  @include xl {
    grid-template-columns: repeat(3, 1fr);
  }

  @include l {
    grid-template-columns: repeat(2, 1fr);
  }

  @include hdpi {
    grid-template-columns: repeat(7, 1fr);
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
