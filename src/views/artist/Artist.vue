<template>
  <div ref="domArtistpage" class="artist-page">
    <ArtistHeader ref="domHead" :scrolled-head="scrolledHead" />
    <div class="content">
      <div class="list">
        <div
          v-if="
            !store.state.artist.albums.length && !store.state.artist.eps.length && !store.state.artist.singles.length
          "
        >
          {{ store.state.artist.artist.name }} n'a rien sorti, c'est triste un peu.
        </div>
        <div v-if="store.state.artist.albums.length" class="content__block">
          <div class="heading sticky-heading">Albums</div>
          <div class="albums">
            <div v-for="(album, index) in store.state.artist.albums" :key="index">
              <Album
                :album="album"
                :currently-played-id="store.state.player.currentlyPlaying.item.album.uri"
                can-save
              />
            </div>
          </div>
        </div>
        <div v-if="store.state.artist.eps.length" class="content__block">
          <div class="heading sticky-heading">EP's</div>
          <div class="eps">
            <div v-for="(album, index) in store.state.artist.eps" :key="index">
              <Album
                :album="album"
                :currently-played-id="store.state.player.currentlyPlaying.item.album.uri"
                can-save
              />
            </div>
          </div>
        </div>
        <div v-if="store.state.artist.singles.length" class="content__block">
          <div class="heading sticky-heading">Singles</div>
          <div class="singles">
            <div v-for="(album, index) in store.state.artist.singles" :key="index">
              <Album :album="album" :currently-played-id="store.state.player.currentlyPlaying.item.album.uri" />
            </div>
          </div>
        </div>
      </div>
      <div class="top"><TopTracks class="top__item" /> <RelatedArtists class="top__item related-artists" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref } from "vue";
import { useStore } from "vuex";
import type { RootState } from "../../@types/RootState";
import { ArtistActions } from "./ArtistStore";
import TopTracks from "./TopTracks.vue";
import RelatedArtists from "./RelatedArtists.vue";
import Album from "../../components/Album.vue";
import ArtistHeader from "./ArtistHeader.vue";
import { templateRef, useEventListener } from "@vueuse/core";

const props = defineProps<{
  id: string;
}>();

const store = useStore<RootState>();
const domArtistpage = templateRef("domArtistpage");
const scrolledHead = ref(false);

onMounted(() => {
  store.dispatch(ArtistActions.getArtist, props.id);
  store.dispatch(ArtistActions.getTopTracks, props.id);
  store.dispatch(ArtistActions.getAlbums, props.id);
  store.dispatch(ArtistActions.getRelatedArtists, props.id);
  store.dispatch(ArtistActions.getSingles, props.id);
  store.dispatch(ArtistActions.getFollowStatus, props.id);

  domArtistpage.value ? (domArtistpage.value.scrollTop = 0) : null;

  useEventListener(domArtistpage.value, "scroll", () => {
    scrolledHead.value = domArtistpage.value ? domArtistpage.value.scrollTop > 50 : false;
  });
});
</script>

<style lang="scss">
.sticky-heading {
  position: sticky;
  top: 88px;
  z-index: 1;
  background-color: var(--bg-color-darker);
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
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;

  @include l {
    grid-template-columns: 1fr 1fr;
  }
}
.eps {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20px;

  @include l {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @include l {
    grid-template-columns: 1fr 1fr;
  }
}

.singles {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 20px;

  @include xl {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  @include l {
    grid-template-columns: 1fr 1fr;
  }
}

.content {
  display: grid;
  gap: 40px;
  grid-template-columns: 1fr 300px;
  padding: 30px 40px;

  @include xl {
    grid-template-columns: 1fr;
  }

  &__block {
    margin-bottom: 60px;
  }
}

.top {
  flex: 0 0 350px;

  @include xl {
    order: -1;
  }

  &__item {
    margin-bottom: 40px;

    @include xl {
      margin-bottom: 0;
    }
  }
}
.artist-page {
  scroll-behavior: smooth;
  overflow-y: scroll;
  animation: popContent 1s ease both;
}

.related-artists {
  @include xl {
    display: none;
  }
}
</style>
