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
        <template v-if="topTiers">
          <div class="tier-section">
            <template v-if="tier0.length">
              <div class="tier-heading">{{ getTierLabel(0, topTiers) }}</div>
              <div class="tier-grid tier-grid-0">
                <SharedAlbumCard v-for="album in tier0" :key="album.id" :album="album" :rank="rankOf(album.id)" />
              </div>
            </template>
            <template v-if="tier1.length">
              <div class="tier-heading">{{ getTierLabel(1, topTiers) }}</div>
              <div class="tier-grid tier-grid-1">
                <SharedAlbumCard v-for="album in tier1" :key="album.id" :album="album" :rank="rankOf(album.id)" />
              </div>
            </template>
            <template v-if="tier2.length">
              <div class="tier-heading">{{ getTierLabel(2, topTiers) }}</div>
              <div class="tier-grid tier-grid-2">
                <SharedAlbumCard v-for="album in tier2" :key="album.id" :album="album" :rank="rankOf(album.id)" />
              </div>
            </template>
          </div>
        </template>
        <template v-else-if="tierList">
          <div class="tier-section">
            <template v-for="(tier, i) in tierList" :key="i">
              <template v-if="tierGroups[i]?.length">
                <div class="tier-row" :class="{ 'tier-row-side': configStore.tierListSideLabels }">
                  <div
                    class="tier-heading tier-heading-colored"
                    :class="{ 'tier-heading-side': configStore.tierListSideLabels }"
                    :style="{ backgroundColor: getTierColor(i, tierList.length) }"
                  >
                    {{ displayTierLabel(tier.label) }}
                  </div>
                  <div
                    class="tier-grid"
                    :class="configStore.tierListSideLabels ? 'tier-grid-side' : 'tier-grid-dynamic'"
                  >
                    <SharedAlbumCard v-for="album in tierGroups[i]" :key="album.id" :album="album" />
                  </div>
                </div>
              </template>
            </template>
            <template v-if="unsortedGroup.length">
              <div class="tier-row" :class="{ 'tier-row-side': configStore.tierListSideLabels }">
                <div
                  class="tier-heading tier-heading-unsorted"
                  :class="{ 'tier-heading-side': configStore.tierListSideLabels }"
                >
                  {{ UNSORTED_TIER_LABEL }}
                </div>
                <div
                  class="tier-grid"
                  :class="configStore.tierListSideLabels ? 'tier-grid-side' : 'tier-grid-dynamic'"
                >
                  <SharedAlbumCard v-for="album in unsortedGroup" :key="album.id" :album="album" />
                </div>
              </div>
            </template>
          </div>
        </template>
        <div v-else class="album-list">
          <SharedAlbumCard v-for="album in albumList" :key="album.id" :album="album" />
        </div>
      </div>
    </PageFit>
  </PageScroller>
</template>

<script lang="ts" setup>
import { HTTPError } from "ky";
import { computed, onMounted, ref } from "vue";

import { AlbumSimplified } from "@/@types/Album";
import { defaultPlaylist } from "@/@types/Defaults";
import { Paging } from "@/@types/Paging";
import { Playlist, PlaylistTrack } from "@/@types/Playlist";
import SharedAlbumCard from "@/components/album/SharedAlbumCard.vue";
import { useConfig } from "@/components/config/ConfigStore";
import Cover from "@/components/ui/AlbumCover.vue";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import PageFit from "@/components/ui/PageFit.vue";
import PageScroller from "@/components/ui/PageScroller.vue";
import {
  displayTierLabel,
  getTierColor,
  getTierLabel,
  parseCollectionRankingMode,
  TierList,
  TopTiers,
  UNSORTED_TIER_LABEL,
} from "@/helpers/collectionOptions";
import { fetchAllPages } from "@/helpers/pagination";
import { publicSpotifyGet } from "@/helpers/publicSpotify";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";
import { absoluteRouteUrl, RouteName } from "@/router";

const props = defineProps<{ id: string }>();
const configStore = useConfig();

const loading = ref(true);
const error = ref("");
const playlist = ref<Playlist>(defaultPlaylist);
const albumList = ref<AlbumSimplified[]>([]);
const beardifyUrl = absoluteRouteUrl(RouteName.Collection, props.id);
const rankingMode = computed(() => parseCollectionRankingMode(playlist.value.description));
const topTiers = computed<null | TopTiers>(() => (rankingMode.value.type === "top" ? rankingMode.value.tiers : null));
const tierList = computed<null | TierList>(() =>
  rankingMode.value.type === "tierlist" ? rankingMode.value.tiers : null,
);

const tier0 = computed<AlbumSimplified[]>(() => (topTiers.value ? albumList.value.slice(0, topTiers.value[0]) : []));
const tier1 = computed<AlbumSimplified[]>(() =>
  topTiers.value ? albumList.value.slice(topTiers.value[0], topTiers.value[0] + topTiers.value[1]) : [],
);
const tier2 = computed<AlbumSimplified[]>(() =>
  topTiers.value ? albumList.value.slice(topTiers.value[0] + topTiers.value[1]) : [],
);

const tierGroups = computed<AlbumSimplified[][]>(() => {
  const list = tierList.value;
  if (!list) return [];
  let offset = 0;
  return list.map((tier) => {
    const size = tier.size ?? 0;
    const group = albumList.value.slice(offset, offset + size);
    offset += size;
    return group;
  });
});

const unsortedGroup = computed<AlbumSimplified[]>(() => {
  const list = tierList.value;
  if (!list) return [];
  const sortedCount = list.reduce((total, tier) => total + (tier.size ?? 0), 0);
  return albumList.value.slice(sortedCount);
});

function errorMessage(err: unknown): string {
  if (!(err instanceof HTTPError)) return "This collection is unavailable. Please try again later.";
  if (err.response.status === 404) return "This collection doesn't exist.";
  if (err.response.status === 403) return "This collection is private. Ask the owner to make it public.";
  return "This collection is unavailable. Please try again later.";
}

function rankOf(id: string): number {
  return albumList.value.findIndex((album) => album.id === id) + 1;
}

onMounted(async () => {
  try {
    playlist.value = await publicSpotifyGet<Playlist>(`playlists/${props.id}`);
    // The playlist response already embeds the first page of tracks, no need to re-fetch it.
    const firstPage = playlist.value.tracks;
    const remaining = firstPage.next
      ? await fetchAllPages<PlaylistTrack>((u) => publicSpotifyGet<Paging<PlaylistTrack>>(u), firstPage.next)
      : [];
    const tracks = firstPage.items.concat(remaining).filter((item) => item.item);
    albumList.value = removeDuplicatesAlbums(tracks.map((t) => t.item.album));
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

.tier-section {
  padding-top: 1rem;
}

.tier-row {
  display: contents;
}

.tier-row-side {
  align-items: stretch;
  display: flex;
  margin-bottom: 1.5rem;
}

.tier-heading {
  background-color: var(--bg-color);
  border-radius: 0.4rem;

  @include font-bold;

  font-size: var(--font-size-lg);
  margin: 2rem 0 1rem;
  padding: 0.7rem 1.2rem;

  &:first-child {
    margin-top: 0;
  }
}

.tier-heading-colored {
  color: #fff;
  text-shadow: 0 0.1rem 0.2rem rgb(0 0 0 / 40%);
}

.tier-heading-unsorted {
  background-color: transparent;
  border: 0.1rem dashed var(--bg-color-lighter);
  color: var(--font-color-dark);
  font-style: italic;
  opacity: 0.7;
}

.tier-heading-side {
  align-items: center;
  border-radius: 0.4rem 0 0 0.4rem;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  line-break: anywhere;
  margin: 0;
  text-align: center;
  width: 8rem;

  @include responsive.mobile {
    width: 5rem;
  }
}

.tier-grid {
  display: grid;
  gap: 2rem;

  @include responsive.mobile {
    gap: 1rem;
  }
}

.tier-grid-0 {
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
}

.tier-grid-1 {
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
}

.tier-grid-2 {
  grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
}

.tier-grid-dynamic {
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
}

.tier-grid-side {
  background-color: var(--bg-color);
  border-radius: 0 0.4rem 0.4rem 0;
  display: flex;
  flex-wrap: wrap;
  padding: 1rem;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.album) {
    width: 8rem;

    @include responsive.mobile {
      width: 6rem;
    }
  }
}
</style>
