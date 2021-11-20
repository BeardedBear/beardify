<template>
  <div v-if="artistStore.artist.name === ''" class="loader"><Loader /></div>
  <div v-else ref="domArtistpage" class="artist-page">
    <ArtistHeader ref="domHead" :scrolled-head="scrolledHead" />
    <div class="content">
      <div class="list">
        <div v-if="!artistStore.albums.length && !artistStore.eps.length && !artistStore.singles.length">
          {{ artistStore.artist.name }} n'a rien sorti, c'est triste un peu.
        </div>
        <div v-if="artistStore.albums.length" class="content__block">
          <div class="heading sticky-heading">Albums</div>
          <div class="albums">
            <div v-for="(album, index) in artistStore.albums" :key="index">
              <Album :album="album" :currently-played-id="playerStore.currentlyPlaying.item?.album.uri" can-save />
            </div>
          </div>
        </div>
        <div v-if="artistStore.eps.length" class="content__block">
          <div class="heading sticky-heading">EP's</div>
          <div class="eps">
            <div v-for="(album, index) in artistStore.eps" :key="index">
              <Album :album="album" :currently-played-id="playerStore.currentlyPlaying.item?.album.uri" can-save />
            </div>
          </div>
        </div>
        <div v-if="artistStore.singles.length" class="content__block">
          <div class="heading sticky-heading">Singles</div>
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
import { defineProps, onMounted, ref, watch } from "vue";
import { templateRef, useEventListener } from "@vueuse/core";
import { useArtist } from "./ArtistStore";
import RelatedArtists from "./RelatedArtists.vue";
import Album from "../../components/Album.vue";
import ArtistHeader from "./ArtistHeader.vue";
import TopTracks from "./TopTracks.vue";
import { usePlayer } from "../../components/player/PlayerStore";
import { useAuth } from "../auth/AuthStore";
import Loader from "../../components/LoadingDots.vue";

const props = defineProps<{
  id: string;
}>();
const domArtistpage = templateRef("domArtistpage");
const scrolledHead = ref(false);
const artistStore = useArtist();
const playerStore = usePlayer();
const authStore = useAuth();

function getData(): void {
  artistStore.clean().finally(() => {
    artistStore.getArtist(props.id);
    artistStore.getTopTracks(props.id);
    artistStore.getAlbums(props.id);
    artistStore.getRelatedArtists(props.id);
    artistStore.getSingles(props.id);
    artistStore.getTopTracks(props.id);
    artistStore.getFollowStatus(props.id);
  });
}

authStore.accessToken ? getData() : watch(authStore, () => getData());

onMounted(() => {
  domArtistpage.value ? (domArtistpage.value.scrollTop = 0) : null;
  useEventListener(domArtistpage.value, "scroll", () => {
    scrolledHead.value = domArtistpage.value ? domArtistpage.value.scrollTop > 50 : false;
  });
});
</script>

<style lang="scss">
.sticky-heading {
  background-color: var(--bg-color-darker);
  position: sticky;
  top: 88px;
  z-index: 1;
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
  gap: 20px;
  grid-template-columns: 1fr 1fr 1fr;

  @include l {
    grid-template-columns: 1fr 1fr;
  }
}

.eps {
  display: grid;
  gap: 20px;
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
  gap: 20px;
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
