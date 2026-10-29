<template>
  <div :class="{ floating }" class="links">
    <template v-if="!floating">
      <BdTooltip v-for="socialLink in socialLinks" :key="socialLink.url" :content="socialLink.name" side="bottom">
        <BdButton :aria-label="socialLink.name" icon-only variant="nude" @click.stop.prevent="openLink(socialLink.url)">
          <i :class="socialLink.icon" aria-hidden="true" />
          <span class="link-name bd-font-bold">{{ socialLink.name }}</span>
        </BdButton>
      </BdTooltip>
      <span v-if="socialLinks.length" class="separator">·</span>
    </template>
    <BdTooltip content="Discogs" side="bottom">
      <BdButton
        aria-label="Discogs"
        icon-only
        :size="buttonSize"
        variant="nude"
        @click.stop.prevent="openLink(link.discogs)"
      >
        <i aria-hidden="true" class="icon-discogs" />
        <span class="link-name bd-font-bold">Discogs</span>
      </BdButton>
    </BdTooltip>
    <BdTooltip content="RateYourMusic" side="bottom">
      <BdButton
        aria-label="RateYourMusic"
        icon-only
        :size="buttonSize"
        variant="nude"
        @click.stop.prevent="openLink(link.rym)"
      >
        <i aria-hidden="true" class="icon-rym" />
        <span class="link-name bd-font-bold">RateYourMusic</span>
      </BdButton>
    </BdTooltip>
    <BdTooltip content="Album of the Year" side="bottom">
      <BdButton
        aria-label="Album of the Year"
        icon-only
        :size="buttonSize"
        variant="nude"
        @click.stop.prevent="openLink(link.aoty)"
      >
        <i aria-hidden="true" class="icon-album" />
        <span class="link-name bd-font-bold">Album of the Year</span>
      </BdButton>
    </BdTooltip>
</div>
</template>

<script lang="ts" setup>
import { BdButton, BdTooltip } from "bearded-ui";
import { computed } from "vue";

import type { SocialLink } from "@/helpers/socialLinks";

import { normalizeDiacritics } from "@/helpers/normalizeDiacritics";
import { openLink } from "@/helpers/openLink";
import { socialLinksFromDiscogs, socialLinksFromMusicBrainz, socialLinksFromWikidata } from "@/helpers/socialLinks";
import { useArtist } from "@/views/artist/ArtistStore";

const props = defineProps<{
  artistName: string;
  floating?: boolean;
}>();

const artistStore = useArtist();
// Smaller inside the hover card, where they sit in a tooltip panel
const buttonSize = computed(() => (props.floating ? "small" : undefined));
const artistNameNormalized = computed(() => normalizeDiacritics(props.artistName).replaceAll("&", "and"));

/**
 * Merge and deduplicate social links from Wikidata, Musicbrainz and Discogs
 */
const socialLinks = computed<SocialLink[]>(() => {
  const wikidataLinks = socialLinksFromWikidata(artistStore.wikidataArtist?.identifiers);
  const discogsLinks = socialLinksFromDiscogs(artistStore.discogsArtist?.urls);
  const musicbrainzLinks = socialLinksFromMusicBrainz(artistStore.musicbrainzArtist?.relations);

  const linkMap = new Map<string, SocialLink>();

  for (const l of wikidataLinks) linkMap.set(l.name, l);
  for (const l of discogsLinks) if (!linkMap.has(l.name)) linkMap.set(l.name, l);
  for (const l of musicbrainzLinks) if (!linkMap.has(l.name)) linkMap.set(l.name, l);

  return Array.from(linkMap.values());
});

// Use Wikidata Discogs ID if available, otherwise use constructed URL
const discogsUrl = computed(() => {
  if (props.floating) {
    return `https://www.discogs.com/artist/${artistNameNormalized.value}`;
  }
  const wikidataDiscogsId = artistStore.wikidataArtist?.identifiers.discogsId;
  if (wikidataDiscogsId) {
    return `https://www.discogs.com/artist/${wikidataDiscogsId}`;
  }
  if (artistStore.discogsId) {
    return `https://www.discogs.com/artist/${artistStore.discogsId}`;
  }
  return `https://www.discogs.com/artist/${artistNameNormalized.value}`;
});

// Use Wikidata Rate Your Music ID if available
const rymUrl = computed(() => {
  if (props.floating) {
    return `https://rateyourmusic.com/search?searchtype=a&searchterm=${artistNameNormalized.value}`;
  }
  const rymId = artistStore.wikidataArtist?.identifiers.rateYourMusicId;
  if (rymId) {
    return `https://rateyourmusic.com/artist/${rymId}`;
  }
  return `https://rateyourmusic.com/search?searchtype=a&searchterm=${artistNameNormalized.value}`;
});

// Search only: AOTY has no Wikidata property to resolve a direct artist page from.
const aotyUrl = computed(
  () => `https://www.albumoftheyear.org/search/artists/?q=${encodeURIComponent(props.artistName)}`,
);

const link = computed(() => ({
  aoty: aotyUrl.value,
  discogs: discogsUrl.value,
  rym: rymUrl.value,
}));
</script>

<style>

.links .bd-tooltip-trigger {
  @media (--mobile) {
    width: 100%;
  }
}
</style>

<style scoped>

.links {
  align-items: center;
  display: flex;
  gap: var(--bd-space-1);
  justify-content: flex-start;
  position: relative;
  width: 100%;

  /* Inside the tooltip panel: tighter buttons, and eat most of the panel's own padding */
  &.floating {
    gap: 0;
    justify-content: center;
    margin: calc(var(--bd-space-1) * -1) calc(var(--bd-space-2) * -1);
    width: auto;
  }

  .separator {
    color: var(--bd-font-color-darker);
    margin: 0 var(--bd-space-1);
  }

  .link-name {
    color: var(--bd-font-color);
    display: none; /* hidden on desktop */
    white-space: nowrap;
  }
}

/* Mobile: vertical list, show names next to icons */
@media (--mobile) {
  .links {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--bd-space-1);

    .separator {
      display: none;
    }

    .bd-button {
      justify-content: flex-start;
      opacity: 0.95;
      padding-left: var(--bd-space-2);
      padding-right: var(--bd-space-2);
      width: 100%;
    }

    .link-name {
      display: inline-block;
      margin-left: var(--bd-space-2);
    }

    /* ensure icons are aligned and have a fixed width */
    i[class^="icon-"] {
      align-items: center;
      display: inline-flex;
      font-size: var(--bd-font-size-base);
      justify-content: center;
      width: 1.25rem;
    }
  }
}
</style>
