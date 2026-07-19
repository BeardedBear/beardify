<template>
  <div v-if="loading" class="loading">
    <Loader />
  </div>
  <div v-else-if="error" class="error">
    <p>This collection is unavailable. It may be private or no longer exist.</p>
  </div>
  <PageScroller v-else>
    <PageFit>
      <div class="shared-collection">
        <header class="header">
          <Cover :images="playlist.images" class="cover" size="large" />
          <div>
            <div class="title">
              {{ playlist.name.replace("#Collection ", "") }}
            </div>
            <div class="metas">{{ playlist.owner.display_name }} &nbsp;·&nbsp; {{ albumList.length }} albums</div>
            <a class="badge" href="https://beardify.netlify.app/" rel="noopener" target="_blank">Shared with Beardify</a>
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
import { onMounted, ref } from "vue";

import { AlbumSimplified } from "@/@types/Album";
import { defaultPlaylist } from "@/@types/Defaults";
import { Paging } from "@/@types/Paging";
import { Playlist, PlaylistTrack } from "@/@types/Playlist";
import Cover from "@/components/ui/AlbumCover.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import PageFit from "@/components/ui/PageFit.vue";
import PageScroller from "@/components/ui/PageScroller.vue";
import { publicSpotifyGet } from "@/helpers/publicSpotify";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";

const props = defineProps<{ id: string }>();

const loading = ref(true);
const error = ref(false);
const playlist = ref<Playlist>(defaultPlaylist);
const albumList = ref<AlbumSimplified[]>([]);

async function loadTracks(url: string, tracks: PlaylistTrack[]): Promise<PlaylistTrack[]> {
  const page = await publicSpotifyGet<Paging<PlaylistTrack>>(url);
  const all = tracks.concat(page.items.filter((item) => item.track));
  return page.next ? loadTracks(page.next, all) : all;
}

onMounted(async () => {
  try {
    playlist.value = await publicSpotifyGet<Playlist>(`playlists/${props.id}`);
    const tracks = await loadTracks(`playlists/${props.id}/tracks`, []);
    albumList.value = removeDuplicatesAlbums(tracks.map((t) => t.track.album));
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.loading,
.error {
  display: grid;
  height: 100vh;
  place-content: center;
  text-align: center;
}

.shared-collection {
  padding: 3rem 5rem;
}

.header {
  align-items: center;
  display: flex;
  margin-bottom: 3rem;

  .cover {
    border-radius: 0.4rem;
    height: 7rem;
    margin-right: 2rem;
    width: 7rem;
  }

  .title {
    font-size: var(--font-size-xl);

    @include font-bold;
  }

  .metas {
    margin-top: 0.3rem;
    opacity: 0.6;
  }

  .badge {
    color: var(--primary-color);
    display: inline-block;
    margin-top: 0.5rem;
    text-decoration: none;
  }
}

.album-list {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
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
