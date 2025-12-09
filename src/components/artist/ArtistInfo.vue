<template>
  <div class="artist-info">
    <div class="info-section" v-if="artistStore.wikidataArtist">
      <h3 class="section-title">Details</h3>
      <div class="details-grid">
        <div class="detail-item" v-if="artistStore.wikidataArtist.description">
          <span class="detail-label">Description</span>
          <span class="detail-value">{{ artistStore.wikidataArtist.description }}</span>
        </div>
        <div class="detail-item" v-if="artistStore.artist.genres?.length">
          <span class="detail-label">Genres</span>
          <span class="detail-value">{{ artistStore.artist.genres.join(", ") }}</span>
        </div>
        <div class="detail-item" v-if="artistStore.artist.followers">
          <span class="detail-label">Followers</span>
          <span class="detail-value">{{ formatNumber(artistStore.artist.followers.total) }}</span>
        </div>
      </div>
    </div>

    <div class="info-section" v-if="hasBiography">
      <div class="section-header">
        <LanguageSelect
          v-if="hasMultipleLanguages"
          :model-value="artistStore.wikipediaLanguage"
          :options="artistStore.wikidataArtist?.wikipediaLanguages ?? []"
          @change="onLanguageChange"
        />
      </div>
      <!-- Wikipedia content (priority) -->
      <div class="wikipedia-content" v-if="artistStore.wikipediaExtract" v-html="artistStore.wikipediaExtract" />
      <!-- Fallback to Discogs profile if no Wikipedia -->
      <div class="discogs-biography" v-else-if="artistStore.discogsArtist?.profile" v-html="formattedDiscogsProfile" />
    </div>

    <div class="info-section" v-if="hasExternalLinks">
      <h3 class="section-title">External Links</h3>
      <div class="external-links">
        <a
          v-if="artistStore.wikidataArtist?.wikipediaUrl"
          :href="artistStore.wikidataArtist.wikipediaUrl"
          class="external-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="icon-wikipedia" />
          <span>Wikipedia</span>
        </a>
        <a
          v-if="artistStore.discogsId"
          :href="`https://www.discogs.com/artist/${artistStore.discogsId}`"
          class="external-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="icon-discogs" />
          <span>Discogs</span>
        </a>
        <a
          v-if="artistStore.wikidataArtist?.identifiers.musicbrainzId"
          :href="`https://musicbrainz.org/artist/${artistStore.wikidataArtist.identifiers.musicbrainzId}`"
          class="external-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="icon-musicbrainz" />
          <span>MusicBrainz</span>
        </a>
        <a
          v-if="artistStore.wikidataArtist?.identifiers.rateYourMusicId"
          :href="`https://rateyourmusic.com/artist/${artistStore.wikidataArtist.identifiers.rateYourMusicId}`"
          class="external-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="icon-rym" />
          <span>Rate Your Music</span>
        </a>
      </div>
    </div>

    <div
      class="info-section"
      v-if="!artistStore.discogsArtist?.profile && !artistStore.wikidataArtist && !artistStore.wikipediaExtract"
    >
      <p class="no-info">No additional information available for this artist.</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import LanguageSelect, { type LanguageOption } from "@/components/ui/LanguageSelect.vue";
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();

const DISCOGS_BASE_URL = "https://www.discogs.com";
const LINK_ATTRS = 'target="_blank" rel="noopener noreferrer" class="discogs-link"';

const DISCOGS_ENTITIES: Record<string, { path: string; searchType: string; text: string }> = {
  a: { path: "artist", searchType: "artist", text: "artist" },
  l: { path: "label", searchType: "label", text: "label" },
  m: { path: "master", searchType: "master", text: "release" },
  r: { path: "release", searchType: "release", text: "release" },
};

const TEXT_FORMATS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\[b\](.*?)\[\/b\]/gi, replacement: "<strong>$1</strong>" },
  { pattern: /\[i\](.*?)\[\/i\]/gi, replacement: "<em>$1</em>" },
  { pattern: /\[u\](.*?)\[\/u\]/gi, replacement: "<u>$1</u>" },
];

function createDiscogsLinkById(type: string, id: string): string {
  const entity = DISCOGS_ENTITIES[type.toLowerCase()];
  if (!entity) return `[${type}${id}]`;
  return `<a href="${DISCOGS_BASE_URL}/${entity.path}/${id}" ${LINK_ATTRS}>${entity.text}</a>`;
}

function createDiscogsSearchLink(type: string, name: string): string {
  const entity = DISCOGS_ENTITIES[type.toLowerCase()];
  if (!entity) return `[${type}=${name}]`;
  return `<a href="${DISCOGS_BASE_URL}/search/?q=${encodeURIComponent(name)}&type=${entity.searchType}" ${LINK_ATTRS}>${name}</a>`;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function parseDiscogsMarkup(text: string): string {
  let result = text;
  result = result.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  for (const { pattern, replacement } of TEXT_FORMATS) {
    result = result.replace(pattern, replacement);
  }

  result = result.replace(/\[([almr])=?(\d+)\]/gi, (_, type, id) => createDiscogsLinkById(type, id));
  result = result.replace(/\[([al])=([^\]]+)\]/gi, (_, type, name) => createDiscogsSearchLink(type, name));
  result = result.replace(
    /\[url=(.*?)\](.*?)\[\/url\]/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>',
  );
  result = result.replace(/\[url\](.*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  result = result.replace(/\n/g, "<br>");

  return result;
}

const formattedDiscogsProfile = computed(() => {
  if (!artistStore.discogsArtist?.profile) return "";
  return parseDiscogsMarkup(artistStore.discogsArtist.profile);
});

const hasBiography = computed(() => {
  return artistStore.wikipediaExtract || artistStore.discogsArtist?.profile;
});

const hasExternalLinks = computed(() => {
  return (
    artistStore.wikidataArtist?.wikipediaUrl ||
    artistStore.discogsId ||
    artistStore.wikidataArtist?.identifiers.musicbrainzId ||
    artistStore.wikidataArtist?.identifiers.rateYourMusicId
  );
});

const hasMultipleLanguages = computed(() => {
  return (artistStore.wikidataArtist?.wikipediaLanguages?.length ?? 0) > 1;
});

function onLanguageChange(option: LanguageOption): void {
  artistStore.switchWikipediaLanguage(option.url, option.code);
}
</script>

<style lang="scss" scoped>
.artist-info {
  max-width: 60rem;
}

.info-section {
  margin-bottom: 2rem;
}

.section-title {
  align-items: center;
  border-bottom: 1px solid var(--bg-color-light);
  color: var(--font-color-default);
  display: flex;
  font-size: 1.1rem;
  font-weight: 600;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
}

.section-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;

  .section-title {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
}

.source-link {
  color: var(--font-color-light);
  opacity: 0.5;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }

  i {
    font-size: 0.9rem;
  }
}

.wikipedia-content {
  color: var(--font-color-light);
  font-size: 0.95rem;
  line-height: 1.7;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(section) {
    margin-bottom: 1.5rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(p) {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(h2) {
    border-bottom: 1px solid var(--bg-color-light);
    color: var(--font-color-default);
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
    margin-top: 1.5rem;
    padding-bottom: 0.4rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(h3) {
    color: var(--font-color-default);
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.6rem;
    margin-top: 1.2rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(h4) {
    color: var(--font-color-default);
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    margin-top: 1rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(ul),
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(ol) {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(li) {
    margin-bottom: 0.3rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(a) {
    color: var(--primary-color-light);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(b),
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(strong) {
    font-weight: bold;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(i),
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(em) {
    font-style: italic;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(table) {
    border-collapse: collapse;
    margin-bottom: 1rem;
    width: 100%;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(th),
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(td) {
    border: 1px solid var(--bg-color-light);
    padding: 0.5rem;
    text-align: left;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(th) {
    background-color: var(--bg-color-dark);
    font-weight: 600;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(blockquote) {
    border-left: 3px solid var(--primary-color-default);
    margin: 1rem 0;
    padding-left: 1rem;
  }
}

.biography {
  color: var(--font-color-light);
  font-size: 0.95rem;
  line-height: 1.7;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(em) {
    font-style: italic;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(strong) {
    font-weight: bold;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.discogs-link),
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(a) {
    color: var(--primary-color-light);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.details-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.detail-label {
  color: var(--font-color-light);
  font-size: 0.8rem;
  opacity: 0.6;
  text-transform: uppercase;
}

.detail-value {
  color: var(--font-color-default);
  font-size: 0.95rem;
}

.external-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.external-link {
  align-items: center;
  background-color: var(--bg-color-dark);
  border-radius: 0.3rem;
  color: var(--font-color-light);
  display: flex;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: var(--primary-color-default);
    color: var(--font-color-default);
  }

  i {
    font-size: 1.1rem;
  }

  span {
    font-size: 0.9rem;
  }
}

.no-info {
  color: var(--font-color-light);
  font-size: 0.95rem;
  opacity: 0.6;
}
</style>
