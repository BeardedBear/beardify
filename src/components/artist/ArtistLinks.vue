<template>
  <div :class="{ floating }" class="links">
    <ButtonIndex @click.stop.prevent="frameStore.open(link.sputnik, 'Sputnik')" variant="nude">
      <i class="icon-sputnik" />
      <span class="link-name">Sputnik</span>
    </ButtonIndex>
    <ButtonIndex icon-only @click.stop.prevent="openLink(link.discogs)" variant="nude">
      <i class="icon-discogs" />
      <span class="link-name">Discogs</span>
    </ButtonIndex>
    <ButtonIndex icon-only @click.stop.prevent="openLink(link.rym)" variant="nude">
      <i class="icon-rym" />
      <span class="link-name">RateYourMusic</span>
    </ButtonIndex>
    <template v-if="!floating">
      <span class="separator">·</span>
      <ButtonIndex
        v-for="socialLink in socialLinks"
        :key="socialLink.url"
        :title="socialLink.name"
        icon-only
        variant="nude"
        @click.stop.prevent="openLink(socialLink.url)"
      >
        <i :class="socialLink.icon" />
        <span class="link-name">{{ socialLink.name }}</span>
      </ButtonIndex>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUpdated, ref } from "vue";

import { useFrame } from "@/components/frame/FrameStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { normalizeDiacritics } from "@/helpers/normalizeDiacritics";
import { useArtist } from "@/views/artist/ArtistStore";

import type { SocialLink } from "@/helpers/socialLinks";
import { socialLinksFromDiscogs, socialLinksFromMusicBrainz, socialLinksFromWikidata } from "@/helpers/socialLinks";

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

function openLink(url: string): void {
  window.open(url, "_blank");
}

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

<style lang="scss" scoped>
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/mixins" as *;

.links {
  align-items: center;
  display: flex;
  gap: 0.25rem;
  justify-content: flex-start;
  position: relative;
  width: 100%;

  &.floating {
    justify-content: center;
  }

  .separator {
    color: rgb(125 125 125 / 50%);
    margin: 0 0.3rem;
  }

  .link-name {
    @include font-bold;

    color: var(--font-color);
    display: none; /* hidden on desktop */
    white-space: nowrap;
  }
}

/* Mobile: vertical list, show names next to icons */
@include responsive.mobile {
  .links {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.35rem;

    .separator {
      display: none;
    }

    .button {
      justify-content: flex-start;
      opacity: 0.95;
      padding-left: 0.6rem;
      padding-right: 0.6rem;
      width: 100%;
    }

    .link-name {
      display: inline-block;
      font-size: 0.95rem;
      margin-left: 0.5rem;
    }

    /* ensure icons are aligned and have a fixed width */
    i[class^="icon-"] {
      align-items: center;
      display: inline-flex;
      font-size: 1rem;
      justify-content: center;
      width: 1.25rem;
    }
  }
}
</style>
