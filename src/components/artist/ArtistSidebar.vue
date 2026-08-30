<template>
  <aside v-if="hasContent" class="sidebar">
    <div v-if="details.length" class="sidebar-section">
      <h3 class="sidebar-title bd-font-bold">Details</h3>
      <div class="sidebar-list">
        <div v-for="item in details" :key="item.label" class="sidebar-item">
          <span class="sidebar-label bd-font-bold">{{ item.label }}</span>
          <span class="sidebar-value">{{ item.value }}</span>
        </div>
      </div>
    </div>

    <div v-if="activeMembers.length || formerMembers.length" class="sidebar-section">
      <h3 class="sidebar-title bd-font-bold">Members</h3>
      <div v-if="activeMembers.length" class="sidebar-members">
        <MemberPopover
          v-for="member in activeMembers"
          :key="member.id"
          class="sidebar-member-pop"
          :discogs-id="member.id"
          :name="member.name"
          :thumbnail="member.thumbnail"
        >
          <a :href="member.url" class="sidebar-member bd-font-bold" target="_blank" rel="noopener noreferrer">
            <img v-if="member.thumbnail" :src="member.thumbnail" :alt="member.name" class="member-thumbnail" />
            <div v-else class="member-placeholder">
              <i class="icon-user" />
            </div>
            <span class="member-name">{{ member.name }}</span>
          </a>
        </MemberPopover>
      </div>

      <template v-if="formerMembers.length">
        <h4 class="sidebar-subtitle bd-font-bold">Former</h4>
        <div class="sidebar-members">
          <MemberPopover
            v-for="member in formerMembers"
            :key="member.id"
            class="sidebar-member-pop"
            :discogs-id="member.id"
            :name="member.name"
            :thumbnail="member.thumbnail"
          >
            <a
              :href="member.url"
              class="sidebar-member inactive bd-font-bold"
              rel="noopener noreferrer"
              target="_blank"
            >
              <img v-if="member.thumbnail" :src="member.thumbnail" :alt="member.name" class="member-thumbnail" />
              <div v-else class="member-placeholder">
                <i class="icon-user" />
              </div>
              <span class="member-name">{{ member.name }}</span>
            </a>
          </MemberPopover>
        </div>
      </template>
    </div>

    <div v-if="externalLinks.length" class="sidebar-section">
      <h3 class="sidebar-title bd-font-bold">External Links</h3>
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

import MemberPopover from "@/components/artist/MemberPopover.vue";
import { cleanDiscogsName } from "@/helpers/discogs";
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
  thumbnail: null | string;
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
      name: cleanDiscogsName(member.name),
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
      name: cleanDiscogsName(member.name),
      thumbnail: member.thumbnail_url || null,
      url: `https://www.discogs.com/artist/${member.id}`,
    }));
});

const hasContent = computed(
  () =>
    details.value.length > 0
    || externalLinks.value.length > 0
    || activeMembers.value.length > 0
    || formerMembers.value.length > 0,
);
</script>

<style scoped>

.sidebar {
  --sidebar-radius: 0.5rem;
  --sidebar-margin: 0.2rem;

  display: flex;
  flex-direction: column;
  gap: var(--bd-space-5);
}

.sidebar-section {
  background: var(--bd-bg);
  border-radius: calc(var(--sidebar-radius) + var(--sidebar-margin));
}

.sidebar-title {
  background-color: var(--bd-bg-light);
  border-radius: var(--sidebar-radius) var(--sidebar-radius) 0 0;
  font-size: var(--bd-font-size-base);
  margin: var(--sidebar-margin);
  padding: var(--bd-space-2) var(--bd-space-4);
  text-transform: uppercase;
}

.sidebar-subtitle {
  border-top: 1px solid var(--bd-bg-light);
  margin: 0 var(--bd-space-4);
  opacity: 0.6;
  padding: var(--bd-space-3) 0 var(--bd-space-1);
  text-transform: uppercase;
}

.sidebar-list {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-3);
  padding: var(--bd-space-4);
}

.sidebar-item {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-1);
}

.sidebar-label {
  font-size: var(--bd-font-size-sm);
  opacity: 0.6;
  text-transform: uppercase;
}

.sidebar-value {
  color: var(--bd-font-color);
  line-height: 1.4;
}

.sidebar-links {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-2);
  padding: var(--bd-space-4);
}

.sidebar-link {
  align-items: center;
  border-radius: var(--bd-radius-sm);
  color: var(--bd-font-color-light);
  display: flex;
  gap: var(--bd-space-2);
  padding: var(--bd-space-2);
  text-decoration: none;
  transition:
    background-color var(--bd-transition-fast),
    color var(--bd-transition-fast);

  &:hover {
    background-color: var(--bd-bg-light);
    color: var(--bd-font-color);
  }

  i {
    font-size: var(--bd-font-size-base);
    opacity: 0.7;
  }

  span {
    font-size: var(--bd-font-size-sm);
  }
}

.sidebar-members {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-2);
  padding: var(--bd-space-4);
}

.sidebar-member-pop {
  display: block;
}

.sidebar-member {
  align-items: center;
  border-radius: var(--bd-radius-sm);
  color: var(--bd-font-color-light);
  display: flex;
  gap: var(--bd-space-2);
  padding: var(--bd-space-2);
  position: relative;
  text-decoration: none;
  transition:
    background-color var(--bd-transition-fast),
    color var(--bd-transition-fast);
  z-index: 1;

  &:hover {
    background-color: var(--bd-bg-light);
    color: var(--bd-font-color);
    z-index: 10;
  }

  &.inactive {
    color: var(--bd-font-color);
  }
}

.member-thumbnail {
  border-radius: var(--bd-radius-full);
  height: 24px;
  object-fit: cover;
  width: 24px;
}

.member-placeholder {
  align-items: center;
  background-color: var(--bd-bg-light);
  border-radius: var(--bd-radius-full);
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;

  i {
    font-size: var(--bd-font-size-xs);
    opacity: 0.5;
  }
}

.member-name {
  flex: 1;
}

.member-status {
  color: var(--bd-font-color-dark);
  font-style: italic;
}
</style>
