<template>
  <div v-if="loading" class="loading">
    <Loader />
  </div>
  <div v-else-if="error" class="error">
    <p>{{ error }}</p>
  </div>
  <PageScroller v-else>
    <PageFit>
      <div class="shared-collection">
        <header class="header">
          <div class="infos">
            <Cover :images="playlist.images" class="cover" size="large" />
            <div>
              <div class="title">
                {{ playlist.name.replace("#Collection ", "") }}
              </div>
              <div class="metas">{{ playlist.owner.display_name }} &nbsp;·&nbsp; {{ albumList.length }} albums</div>
            </div>
          </div>
          <div class="links">
            <ButtonIndex :href="beardifyUrl" target="_blank" variant="primary">Open in Beardify</ButtonIndex>
            <ButtonIndex :href="playlist.external_urls.spotify" target="_blank" variant="border">
              Open in Spotify
            </ButtonIndex>
          </div>
        </header>
        <div class="album-list">
          <a
            v-for="album in albumList"
            :key="album.id"
            class="album"
            :href="album.external_urls.spotify"
            rel="noopener"
            target="_blank"
          >
            <Cover :images="album.images" class="album-cover" size="medium" />
            <div class="name">{{ album.name }}</div>
            <div class="artists">{{ album.artists.map((a) => a.name).join(", ") }}</div>
          </a>
        </div>
      </div>
    </PageFit>
  </PageScroller>
</template>

<script lang="ts" setup>
import { HTTPError } from "ky";
import { onMounted, ref } from "vue";

import { AlbumSimplified } from "@/@types/Album";
import { defaultPlaylist } from "@/@types/Defaults";
import { Paging } from "@/@types/Paging";
import { Playlist, PlaylistTrack } from "@/@types/Playlist";
import Cover from "@/components/ui/AlbumCover.vue";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import PageFit from "@/components/ui/PageFit.vue";
import PageScroller from "@/components/ui/PageScroller.vue";
import { fetchAllPages } from "@/helpers/pagination";
import { publicSpotifyGet } from "@/helpers/publicSpotify";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";
import { absoluteRouteUrl, RouteName } from "@/router";

const props = defineProps<{ id: string }>();

const loading = ref(true);
const error = ref("");
const playlist = ref<Playlist>(defaultPlaylist);
const albumList = ref<AlbumSimplified[]>([]);
const beardifyUrl = absoluteRouteUrl(RouteName.Collection, props.id);

function errorMessage(err: unknown): string {
  if (!(err instanceof HTTPError)) return "This collection is unavailable. Please try again later.";
  if (err.response.status === 404) return "This collection doesn't exist.";
  if (err.response.status === 403) return "This collection is private. Ask the owner to make it public.";
  return "This collection is unavailable. Please try again later.";
}

onMounted(async () => {
  try {
    playlist.value = await publicSpotifyGet<Playlist>(`playlists/${props.id}`);
    // The playlist response already embeds the first page of tracks, no need to re-fetch it.
    const firstPage = playlist.value.tracks;
    const remaining = firstPage.next
      ? await fetchAllPages<PlaylistTrack>((u) => publicSpotifyGet<Paging<PlaylistTrack>>(u), firstPage.next)
      : [];
    const tracks = firstPage.items.concat(remaining).filter((item) => item.track);
    albumList.value = removeDuplicatesAlbums(tracks.map((t) => t.track.album));
  } catch (err) {
    error.value = errorMessage(err);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;
@use "@/assets/scss/responsive" as responsive;

.loading,
.error {
  display: grid;
  height: 100vh;
  place-content: center;
  text-align: center;
}

.shared-collection {
  padding: 0 5rem 3rem;

  @include responsive.mobile {
    padding: 0 1rem 1.5rem;
  }
}

.header {
  align-items: center;
  background-color: var(--bg-color-darker);
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 1;

  @include responsive.mobile {
    align-items: flex-start;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0;
  }

  .infos {
    align-items: center;
    display: flex;
  }

  .cover {
    border-radius: 0.4rem;
    height: 4rem;
    margin-right: 2rem;
    width: 4rem;

    @include responsive.mobile {
      height: 3rem;
      margin-right: 1rem;
      width: 3rem;
    }
  }

  .title {
    font-size: var(--font-size-xl);

    @include font-bold;
  }

  .metas {
    margin-top: 0.3rem;
    opacity: 0.6;
  }

  .links {
    display: flex;
    gap: 0.6rem;

    @include responsive.mobile {
      width: 100%;

      /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
      :deep(.button) {
        flex: 1;
      }
    }
  }
}

.album-list {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));

  @include responsive.mobile {
    gap: 1rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.album {
  color: inherit;
  text-decoration: none;

  .album-cover {
    border-radius: 0.4rem;
    margin-bottom: 0.5rem;
    width: 100%;
  }

  .name {
    @include font-bold;
  }

  .artists {
    opacity: 0.6;
  }
}
</style>
