<template>
  <div v-if="artistStore.artist.name === ''" class="loader">
    <Loader />
  </div>
  <div v-else class="artist-page">
    <ArtistHeader />
    <Transition name="tab-fade" mode="out-in">
      <div v-if="artistStore.activeTab === 'discography'" key="discography" class="content">
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
      <div v-else-if="artistStore.activeTab === 'info'" key="info" class="content content--info">
        <ArtistInfo />
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import ArtistHeader from "@/components/artist/ArtistHeader.vue";
import ArtistInfo from "@/components/artist/ArtistInfo.vue";
import BlockAlbums from "@/components/artist/BlockAlbums.vue";
import BlockAlbumsLive from "@/components/artist/BlockAlbumsLive.vue";
import BlockEps from "@/components/artist/BlockEps.vue";
import BlockSingles from "@/components/artist/BlockSingles.vue";
import RelatedArtists from "@/components/artist/RelatedArtists.vue";
import TopTracks from "@/components/artist/TopTracks.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import { useArtist } from "@/views/artist/ArtistStore";

const props = defineProps<{ id: string }>();
const artistStore = useArtist();

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
  z-index: 15;

  &::after {
    background-color: var(--bg-color-darker);
    bottom: 0;
    content: "";
    height: 100%;
    left: -1rem;
    position: absolute;
    right: -1rem;
    z-index: -1;
  }
}
</style>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

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
  position: relative;

  @include responsive.tablet-down {
    gap: 1.5rem;
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  @include responsive.xl {
    grid-template-columns: 1fr;
  }

  &--info {
    grid-template-columns: 1fr;
  }
}

.content-block {
  margin-bottom: 3rem;

  @include responsive.mobile {
    margin-bottom: 2rem;
  }
}

.top {
  flex: 0 0 22rem;

  @include responsive.tablet-down {
    order: -1;
  }

  @include responsive.xl {
    order: -1;
  }
}

.top-item {
  margin-bottom: 2.5rem;

  @include responsive.tablet-down {
    margin-bottom: 1.5rem;
  }

  @include responsive.xl {
    margin-bottom: 0;
  }
}

.artist-page {
  animation: pop-content 1s ease both;
  overflow-y: scroll;
  scroll-behavior: smooth;
}

.related-artists {
  @include responsive.tablet-down {
    display: none;
  }

  @include responsive.xl {
    display: none;
  }
}

.loader {
  display: grid;
  place-content: center;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
