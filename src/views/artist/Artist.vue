<template>
  <div v-if="artistStore.artist.name === ''" class="loader"><Loader /></div>
  <div v-else class="artist-page">
    <ArtistHeader ref="domHead" :scrolled-head="scrolledHead" />
    <div class="content">
      <div class="list">
        <div v-if="!artistStore.albums.length && !artistStore.eps.length && !artistStore.singles.length">
          {{ artistStore.artist.name }} n'a rien sorti, c'est triste un peu.
        </div>
        <div v-if="artistStore.albums.length" class="content__block">
          <div class="heading sticky-heading" :style="{ top: artistStore.headerHeight + 'px' }">Albums</div>
          <div class="albums">
            <div v-for="(album, index) in artistStore.albums" :key="index">
              <Album :album="album" :currently-played-id="playerStore.currentlyPlaying.item?.album.uri" can-save />
            </div>
          </div>
        </div>
        <div v-if="artistStore.eps.length" class="content__block">
          <div class="heading sticky-heading" :style="{ top: artistStore.headerHeight + 'px' }">EP's</div>
          <div class="eps">
            <div v-for="(album, index) in artistStore.eps" :key="index">
              <Album :album="album" :currently-played-id="playerStore.currentlyPlaying.item?.album.uri" can-save />
            </div>
          </div>
        </div>
        <div v-if="artistStore.singles.length" class="content__block">
          <div class="heading sticky-heading" :style="{ top: artistStore.headerHeight + 'px' }">Singles</div>
          <div class="singles">
            <div v-for="(album, index) in artistStore.singles" :key="index">
              <Album :album="album" :currently-played-id="playerStore.currentlyPlaying.item?.album.uri" />
            </div>
          </div>
        </div>
      </div>
      <div class="top"><TopTracks class="top__item" /> <RelatedArtists class="top__item related-artists" /></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue";
import { useArtist } from "./ArtistStore";
import RelatedArtists from "./RelatedArtists.vue";
import Album from "../../components/Album.vue";
import ArtistHeader from "./ArtistHeader.vue";
import TopTracks from "./TopTracks.vue";
import { usePlayer } from "../../components/player/PlayerStore";
import Loader from "../../components/LoadingDots.vue";

const props = defineProps<{ id: string }>();
const scrolledHead = ref(false);
const artistStore = useArtist();
const playerStore = usePlayer();
const domHead = ref<HTMLDivElement | null>(null);

artistStore.clean().finally(() => {
  artistStore.getArtist(props.id);
  artistStore.getTopTracks(props.id);
  artistStore.getAlbums(props.id);
  artistStore.getRelatedArtists(props.id);
  artistStore.getSingles(props.id);
  artistStore.getTopTracks(props.id);
  artistStore.getFollowStatus(props.id);
});
</script>

<style lang="scss">
.sticky-heading {
  background-color: var(--bg-color-darker);
  position: sticky;
  z-index: 2;
}
</style>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.list {
  flex: 1;
}

.albums {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: 1fr 1fr 1fr;

  @include l {
    grid-template-columns: 1fr 1fr;
  }
}

.eps {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: 1fr 1fr 1fr 1fr;

  @include l {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @include l {
    grid-template-columns: 1fr 1fr;
  }
}

.singles {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;

  @include xl {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  @include l {
    grid-template-columns: 1fr 1fr;
  }
}

.content {
  display: grid;
  gap: 2.5rem;
  grid-template-columns: 1fr 20rem;
  padding: 2rem 2.5rem;

  @include xl {
    grid-template-columns: 1fr;
  }

  &__block {
    margin-bottom: 3rem;
  }
}

.top {
  flex: 0 0 22rem;

  @include xl {
    order: -1;
  }

  &__item {
    margin-bottom: 2.5rem;

    @include xl {
      margin-bottom: 0;
    }
  }
}

.artist-page {
  animation: pop-content 1s ease both;
  overflow-y: scroll;
  scroll-behavior: smooth;
}

.related-artists {
  @include xl {
    display: none;
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
