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

    <div class="sidebar-section" v-if="activeMembers.length || formerMembers.length">
      <h3 class="sidebar-title">Members</h3>
      <div class="sidebar-members" v-if="activeMembers.length">
        <a
          v-for="member in activeMembers"
          :key="member.id"
          :href="member.url"
          class="sidebar-member"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img v-if="member.thumbnail" :src="member.thumbnail" :alt="member.name" class="member-thumbnail" />
          <div v-else class="member-placeholder">
            <i class="icon-user" />
          </div>
          <span class="member-name">{{ member.name }}</span>
          <div v-if="member.thumbnail" class="member-popup">
            <img :src="member.thumbnail" :alt="member.name" />
          </div>
        </a>
      </div>

      <template v-if="formerMembers.length">
        <h4 class="sidebar-subtitle">Former</h4>
        <div class="sidebar-members">
          <a
            v-for="member in formerMembers"
            :key="member.id"
            :href="member.url"
            class="sidebar-member inactive"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img v-if="member.thumbnail" :src="member.thumbnail" :alt="member.name" class="member-thumbnail" />
            <div v-else class="member-placeholder">
              <i class="icon-user" />
            </div>
            <span class="member-name">{{ member.name }}</span>
            <div v-if="member.thumbnail" class="member-popup">
              <img :src="member.thumbnail" :alt="member.name" />
            </div>
          </a>
        </div>
      </template>
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

interface MemberItem {
  active: boolean;
  id: number;
  name: string;
  thumbnail: string | null;
  url: string;
}

const artistStore = useArtist();

const activeMembers = computed<MemberItem[]>(() => {
  const discogsMembers = artistStore.discogsArtist?.members;
  if (!discogsMembers?.length) return [];

  return discogsMembers
    .filter((member) => member.active)
    .map((member) => ({
      active: member.active,
      id: member.id,
      name: member.name.replace(/\s*\(\d+\)$/, ""),
      thumbnail: member.thumbnail_url || null,
      url: `https://www.discogs.com/artist/${member.id}`,
    }));
});

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

const formerMembers = computed<MemberItem[]>(() => {
  const discogsMembers = artistStore.discogsArtist?.members;
  if (!discogsMembers?.length) return [];

  return discogsMembers
    .filter((member) => !member.active)
    .map((member) => ({
      active: member.active,
      id: member.id,
      name: member.name.replace(/\s*\(\d+\)$/, ""),
      thumbnail: member.thumbnail_url || null,
      url: `https://www.discogs.com/artist/${member.id}`,
    }));
});

const hasContent = computed(
  () =>
    details.value.length > 0 ||
    externalLinks.value.length > 0 ||
    activeMembers.value.length > 0 ||
    formerMembers.value.length > 0,
);
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

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
  @include font-bold;

  background-color: var(--bg-color-light);
  border-radius: $radius $radius 0 0;
  font-size: var(--font-size-base);
  margin: $margin;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
}

.sidebar-subtitle {
  @include font-bold;

  border-top: 1px solid var(--bg-color-light);
  margin: 0 1rem;
  opacity: 0.6;
  padding: 0.75rem 0 0.25rem;
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
  font-size: var(--font-size-sm);

  @include font-bold;

  opacity: 0.6;
  text-transform: uppercase;
}

.sidebar-value {
  color: var(--font-color-default);
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
    font-size: var(--font-size-base);
    opacity: 0.7;
  }

  span {
    font-size: var(--font-size-sm);
  }
}

.sidebar-members {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1rem;
}

.member-popup {
  $size: 200px;

  background-color: var(--bg-color-dark);
  border-radius: 0.5rem;
  box-shadow: 0 4px 20px rgb(0 0 0 / 40%);
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  right: calc(100% + 0.75rem);
  top: 50%;
  transform: translateX(10px) translateY(-50%);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  z-index: 100;

  img {
    display: block;
    object-fit: cover;
    width: $size;
  }
}

.sidebar-member {
  align-items: center;
  border-radius: 0.25rem;
  color: var(--font-color-light);
  display: flex;

  @include font-bold;

  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  position: relative;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  z-index: 1;

  &:hover {
    background-color: var(--bg-color-light);
    color: var(--font-color-default);
    z-index: 10;

    .member-popup {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0) translateY(-50%);
    }
  }

  &.inactive {
    color: var(--font-color);
  }
}

.member-thumbnail {
  border-radius: 50%;
  height: 24px;
  object-fit: cover;
  width: 24px;
}

.member-placeholder {
  align-items: center;
  background-color: var(--bg-color-light);
  border-radius: 50%;
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;

  i {
    font-size: var(--font-size-xs);
    opacity: 0.5;
  }
}

.member-name {
  flex: 1;
}

.member-status {
  font-style: italic;
  opacity: 0.5;
}
</style>
