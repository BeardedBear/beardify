<template>
  <div :class="{ floating }" class="links">
    <BdTooltip content="Sputnik" side="bottom">
      <BdButton variant="nude" @click.stop.prevent="frameStore.open(link.sputnik, 'Sputnik')">
        <i aria-hidden="true" class="icon-sputnik" />
        <span class="link-name">Sputnik</span>
      </BdButton>
    </BdTooltip>
    <BdTooltip content="Discogs" side="bottom">
      <BdButton aria-label="Discogs" icon-only variant="nude" @click.stop.prevent="openLink(link.discogs)">
        <i aria-hidden="true" class="icon-discogs" />
        <span class="link-name">Discogs</span>
      </BdButton>
    </BdTooltip>
    <BdTooltip content="RateYourMusic" side="bottom">
      <BdButton aria-label="RateYourMusic" icon-only variant="nude" @click.stop.prevent="openLink(link.rym)">
        <i aria-hidden="true" class="icon-rym" />
        <span class="link-name">RateYourMusic</span>
      </BdButton>
    </BdTooltip>
    <template v-if="!floating">
      <span class="separator">·</span>
      <BdTooltip v-for="socialLink in socialLinks" :key="socialLink.url" :content="socialLink.name" side="bottom">
        <BdButton :aria-label="socialLink.name" icon-only variant="nude" @click.stop.prevent="openLink(socialLink.url)">
          <i :class="socialLink.icon" aria-hidden="true" />
          <span class="link-name">{{ socialLink.name }}</span>
        </BdButton>
      </BdTooltip>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdTooltip } from "bearded-ui";
import { computed, onMounted, onUpdated, ref } from "vue";

import type { SocialLink } from "@/helpers/socialLinks";

import { useFrame } from "@/components/frame/FrameStore";
import { normalizeDiacritics } from "@/helpers/normalizeDiacritics";
import { openLink } from "@/helpers/openLink";
import { socialLinksFromDiscogs, socialLinksFromMusicBrainz, socialLinksFromWikidata } from "@/helpers/socialLinks";
import { useArtist } from "@/views/artist/ArtistStore";

const props = defineProps<{
  artistName: string;
  floating?: boolean;
}>();

const frameStore = useFrame();
const artistStore = useArtist();
const link = ref<Record<string, string>>({});
const artistNameNormalized = ref<string>("");

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

// Use Wikidata Wikipedia URL if available, otherwise fallback to constructed URL
const wikipediaUrl = computed(() => {
  if (props.floating) {
    return `https://en.wikipedia.org/wiki/${artistNameNormalized.value}`;
  }
  return artistStore.wikidataArtist?.wikipediaUrl || `https://en.wikipedia.org/wiki/${artistNameNormalized.value}`;
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

function updateLinks(): void {
  artistNameNormalized.value = normalizeDiacritics(props.artistName).replaceAll("&", "and");
  link.value = {
    discogs: discogsUrl.value,
    google: `https://www.google.com/search?q=${artistNameNormalized.value}&igu=1`,
    lastfm: `https://www.last.fm/music/${artistNameNormalized.value}`,
    rym: rymUrl.value,
    sputnik: `https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=${artistNameNormalized.value}&amp;x=0&amp;y=0`,
    wikipedia: wikipediaUrl.value,
    youtube: `https://www.youtube.com/results?search_query=${artistNameNormalized.value}`,
  };
}

onMounted(() => updateLinks());
onUpdated(() => updateLinks());
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

  &.floating {
    justify-content: center;
  }

  .separator {
    color: var(--bd-font-color-darker);
    margin: 0 var(--bd-space-1);
  }

  .link-name {
    color: var(--bd-font-color);
    display: none; /* hidden on desktop */
    font-variation-settings: var(--bd-font-variation-settings-bold);
    font-weight: var(--bd-weight-bold-fallback);
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
