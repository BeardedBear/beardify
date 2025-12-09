<template>
  <aside class="sidebar" v-if="hasContent">
    <div class="sidebar-section" v-if="details.length">
      <h3 class="sidebar-title">Details</h3>
      <div class="sidebar-list">
        <div class="sidebar-item" v-for="item in details" :key="item.label">
          <span class="sidebar-label">{{ item.label }}</span>
          <span class="sidebar-value">{{ item.value }}</span>
        </div>
      </div>
    </div>

    <div class="sidebar-section" v-if="externalLinks.length">
      <h3 class="sidebar-title">External Links</h3>
      <div class="sidebar-links">
        <a
          v-for="link in externalLinks"
          :key="link.label"
          :href="link.url"
          class="sidebar-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i :class="link.icon" />
          <span>{{ link.label }}</span>
        </a>
      </div>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { useArtist } from "@/views/artist/ArtistStore";

interface DetailItem {
  label: string;
  value: string;
}

interface ExternalLink {
  icon: string;
  label: string;
  url: string;
}

const artistStore = useArtist();

const details = computed<DetailItem[]>(() => {
  const items: DetailItem[] = [];

  if (artistStore.wikidataArtist?.description) {
    items.push({ label: "Description", value: artistStore.wikidataArtist.description });
  }
  if (artistStore.artist.genres?.length) {
    items.push({ label: "Genres", value: artistStore.artist.genres.join(", ") });
  }
  if (artistStore.artist.followers) {
    items.push({ label: "Followers", value: artistStore.artist.followers.total.toLocaleString() });
  }

  return items;
});

const externalLinks = computed<ExternalLink[]>(() => {
  const links: ExternalLink[] = [];

  if (artistStore.wikidataArtist?.wikipediaUrl) {
    links.push({
      icon: "icon-wikipedia",
      label: "Wikipedia",
      url: artistStore.wikidataArtist.wikipediaUrl,
    });
  }
  if (artistStore.discogsId) {
    links.push({
      icon: "icon-discogs",
      label: "Discogs",
      url: `https://www.discogs.com/artist/${artistStore.discogsId}`,
    });
  }
  if (artistStore.wikidataArtist?.identifiers.rateYourMusicId) {
    links.push({
      icon: "icon-rym",
      label: "Rate Your Music",
      url: `https://rateyourmusic.com/artist/${artistStore.wikidataArtist.identifiers.rateYourMusicId}`,
    });
  }

  return links;
});

const hasContent = computed(() => details.value.length > 0 || externalLinks.value.length > 0);
</script>

<style lang="scss" scoped>
  $radius: 0.5rem;
  $margin: 0.2rem;

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-section {
  background: var(--bg-color);
  border-radius: calc($radius + $margin);
}

.sidebar-title {
  background-color: var(--bg-color-light);
  border-radius: $radius $radius 0 0;
  font-size: 0.9rem;
  font-weight: 600;
  margin: $margin;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
}

.sidebar-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
}

.sidebar-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.sidebar-label {
  font-size: 0.7rem;
  font-weight: bold;
  opacity: 0.6;
  text-transform: uppercase;
}

.sidebar-value {
  color: var(--font-color-default);
  font-size: 0.85rem;
  line-height: 1.4;
}

.sidebar-links {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1rem;
}

.sidebar-link {
  align-items: center;
  border-radius: 0.25rem;
  color: var(--font-color-light);
  display: flex;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: var(--bg-color-light);
    color: var(--font-color-default);
  }

  i {
    font-size: 1rem;
    opacity: 0.7;
  }

  span {
    font-size: 0.85rem;
  }
}
</style>
