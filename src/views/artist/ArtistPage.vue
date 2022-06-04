<template>
  <div v-if="artistStore.artist.name === ''" class="loader"><Loader /></div>
  <div v-else class="artist-page">
    <ArtistHeader ref="domHead" />
    <div class="content">
      <div class="list">
        <div
          v-if="
            !artistStore.albums.length &&
            !artistStore.eps.length &&
            !artistStore.singles.length &&
            !artistStore.albumsLive.length
          "
        >
          {{ artistStore.artist.name }} didn't release anything, it's a bit sad.
        </div>
        <BlockAlbums />
        <BlockAlbumsLive />
        <BlockEps />
        <BlockSingles />
      </div>
      <div class="top">
        <TopTracks class="top-item" />
        <RelatedArtists class="top-item related-artists" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue";
import { useArtist } from "./ArtistStore";
import RelatedArtists from "../../components/artist/RelatedArtists.vue";
import ArtistHeader from "../../components/artist/ArtistHeader.vue";
import TopTracks from "../../components/artist/TopTracks.vue";
import Loader from "../../components/LoadingDots.vue";
import BlockAlbums from "../../components/artist/BlockAlbums.vue";
import BlockAlbumsLive from "../../components/artist/BlockAlbumsLive.vue";
import BlockEps from "../../components/artist/BlockEps.vue";
import BlockSingles from "../../components/artist/BlockSingles.vue";

const props = defineProps<{ id: string }>();
const artistStore = useArtist();
const domHead = ref<HTMLDivElement | null>(null);

artistStore.clean().finally(() => {
  artistStore.getArtist(props.id);
  artistStore.getTopTracks(props.id);
  artistStore.getAlbums(`artists/${props.id}/albums?include_groups=album&limit=50`);
  artistStore.getRelatedArtists(props.id);
  artistStore.getSingles(props.id);
  artistStore.getFollowStatus(props.id);
});
</script>

<style lang="scss">
.sticky-heading {
  background-color: var(--bg-color-darker);
  margin-bottom: 0.8rem;
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

.content {
  display: grid;
  gap: 2.5rem;
  grid-template-columns: 1fr 20rem;
  margin: 0 auto;
  max-width: 120rem;
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
}

.top-item {
  margin-bottom: 2.5rem;

  @include xl {
    margin-bottom: 0;
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
