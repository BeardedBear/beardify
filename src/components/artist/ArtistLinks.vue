<template>
  <div :class="{ floating }" class="links">
    <ButtonIndex @click.stop.prevent="frameStore.open(link.sputnik, 'Sputnik')" variant="nude">
      <i class="icon-sputnik" />
    </ButtonIndex>
    <ButtonIndex icon-only @click.stop.prevent="openLink(link.discogs)" variant="nude">
      <i class="icon-discogs" />
    </ButtonIndex>
    <ButtonIndex icon-only @click.stop.prevent="openLink(link.rym)" variant="nude">
      <i class="icon-rym" />
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

interface SocialLink {
  icon: string;
  name: string;
  url: string;
}

const props = defineProps<{
  artistName: string;
  floating?: boolean;
}>();

const frameStore = useFrame();
const artistStore = useArtist();
const link = ref<Record<string, string>>({});
const artistNameNormalized = ref<string>("");

/**
 * Social network patterns to identify URLs
 */
const SOCIAL_PATTERNS: Array<{ icon: string; name: string; pattern: RegExp }> = [
  { icon: "icon-facebook", name: "Facebook", pattern: /facebook\.com/i },
  { icon: "icon-twitter", name: "Twitter / X", pattern: /twitter\.com|x\.com/i },
  { icon: "icon-instagram", name: "Instagram", pattern: /instagram\.com/i },
  { icon: "icon-youtube", name: "YouTube", pattern: /youtube\.com|youtu\.be/i },
  { icon: "icon-bandcamp", name: "Bandcamp", pattern: /bandcamp\.com/i },
  { icon: "icon-soundcloud", name: "SoundCloud", pattern: /soundcloud\.com/i },
  { icon: "icon-link", name: "Website", pattern: /.*/ }, // Fallback for unknown URLs
];

/**
 * Extract and clean a URL from a string that might contain extra text
 */
function extractUrl(text: string): string | null {
  const urlMatch = text.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    let url = urlMatch[0];
    url = url.replace(/^https?:\/\/\.+/, "https://");
    url = url.replace(/[.,;:!?)]+$/, "");
    return url;
  }
  const domainMatch = text.match(/(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+)(?:\/[^\s]*)?/i);
  if (domainMatch) {
    const domain = domainMatch[0].replace(/^\.+/, "");
    return `https://${domain}`;
  }
  return null;
}

/**
 * Build social links from Wikidata identifiers
 */
function getWikidataSocialLinks(): SocialLink[] {
  const links: SocialLink[] = [];
  const identifiers = artistStore.wikidataArtist?.identifiers;

  if (!identifiers) return links;

  if (identifiers.twitterUsername) {
    links.push({
      icon: "icon-twitter",
      name: "Twitter / X",
      url: `https://twitter.com/${identifiers.twitterUsername}`,
    });
  }
  if (identifiers.instagramUsername) {
    links.push({
      icon: "icon-instagram",
      name: "Instagram",
      url: `https://www.instagram.com/${identifiers.instagramUsername}`,
    });
  }
  if (identifiers.facebookId) {
    links.push({ icon: "icon-facebook", name: "Facebook", url: `https://www.facebook.com/${identifiers.facebookId}` });
  }
  if (identifiers.youtubeChannelId) {
    links.push({
      icon: "icon-youtube",
      name: "YouTube",
      url: `https://www.youtube.com/channel/${identifiers.youtubeChannelId}`,
    });
  }
  if (identifiers.bandcampId) {
    links.push({ icon: "icon-bandcamp", name: "Bandcamp", url: `https://${identifiers.bandcampId}.bandcamp.com` });
  }
  if (identifiers.soundcloudId) {
    links.push({
      icon: "icon-soundcloud",
      name: "SoundCloud",
      url: `https://soundcloud.com/${identifiers.soundcloudId}`,
    });
  }
  if (identifiers.officialWebsite) {
    const websiteUrl = extractUrl(identifiers.officialWebsite);
    if (websiteUrl) {
      links.push({ icon: "icon-link", name: "Website", url: websiteUrl });
    }
  }

  return links;
}

/**
 * Parse Discogs URLs and identify social networks
 */
function getDiscogsSocialLinks(): SocialLink[] {
  const links: SocialLink[] = [];
  const urls = artistStore.discogsArtist?.urls;

  if (!urls) return links;

  for (const rawUrl of urls) {
    const url = extractUrl(rawUrl) || rawUrl;
    if (url.includes("discogs.com")) continue;

    for (const { icon, name, pattern } of SOCIAL_PATTERNS) {
      if (pattern.test(url)) {
        if (!links.some((l) => l.name === name)) {
          links.push({ icon, name, url });
        }
        break;
      }
    }
  }

  return links;
}

/**
 * Extract social links from MusicBrainz relations
 */
function getMusicBrainzSocialLinks(): SocialLink[] {
  const links: SocialLink[] = [];
  const relations = artistStore.musicbrainzArtist?.relations;
  if (!relations) return links;

  for (const rel of relations) {
    const resource = rel.url?.resource;
    if (!resource) continue;
    const url = extractUrl(resource) || resource;
    // skip internal MusicBrainz links
    if (url.includes("musicbrainz.org")) continue;

    for (const { icon, name, pattern } of SOCIAL_PATTERNS) {
      if (pattern.test(url)) {
        if (!links.some((l) => l.name === name)) {
          links.push({ icon, name, url });
        }
        break;
      }
    }
  }

  return links;
}

/**
 * Merge and deduplicate social links from Wikidata and Discogs
 */
const socialLinks = computed<SocialLink[]>(() => {
  const wikidataLinks = getWikidataSocialLinks();
  const discogsLinks = getDiscogsSocialLinks();
  const linkMap = new Map<string, SocialLink>();

  for (const l of wikidataLinks) {
    linkMap.set(l.name, l);
  }
  for (const l of discogsLinks) {
    if (!linkMap.has(l.name)) {
      linkMap.set(l.name, l);
    }
  }

  // Include MusicBrainz relations-derived social links
  const musicbrainzLinks = getMusicBrainzSocialLinks();
  for (const l of musicbrainzLinks) {
    if (!linkMap.has(l.name)) {
      linkMap.set(l.name, l);
    }
  }

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
.links {
  align-items: center;
  display: flex;
  position: relative;

  .separator {
    color: rgb(125 125 125 / 50%);
    margin: 0 0.3rem;
  }
}
</style>
