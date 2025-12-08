<template>
  <div class="social-links" v-if="socialLinks.length > 0">
    <a
      v-for="link in socialLinks"
      :key="link.url"
      :href="link.url"
      :title="link.name"
      class="social-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      <i :class="link.icon" />
    </a>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { useArtist } from "@/views/artist/ArtistStore";

interface SocialLink {
  icon: string;
  name: string;
  url: string;
}

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
  { icon: "icon-spotify", name: "Spotify", pattern: /spotify\.com/i },
  { icon: "icon-link", name: "Website", pattern: /.*/ }, // Fallback for unknown URLs
];

const artistStore = useArtist();

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
    links.push({
      icon: "icon-facebook",
      name: "Facebook",
      url: `https://www.facebook.com/${identifiers.facebookId}`,
    });
  }

  if (identifiers.youtubeChannelId) {
    links.push({
      icon: "icon-youtube",
      name: "YouTube",
      url: `https://www.youtube.com/channel/${identifiers.youtubeChannelId}`,
    });
  }

  if (identifiers.bandcampId) {
    links.push({
      icon: "icon-bandcamp",
      name: "Bandcamp",
      url: `https://${identifiers.bandcampId}.bandcamp.com`,
    });
  }

  if (identifiers.soundcloudId) {
    links.push({
      icon: "icon-soundcloud",
      name: "SoundCloud",
      url: `https://soundcloud.com/${identifiers.soundcloudId}`,
    });
  }

  if (identifiers.officialWebsite) {
    links.push({
      icon: "icon-link",
      name: "Website",
      url: identifiers.officialWebsite,
    });
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

  for (const url of urls) {
    // Skip Discogs' own URLs
    if (url.includes("discogs.com")) continue;

    // Find matching pattern
    for (const { icon, name, pattern } of SOCIAL_PATTERNS) {
      if (pattern.test(url)) {
        // Don't add duplicate networks
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
 * Wikidata takes priority as it's more structured
 */
const socialLinks = computed<SocialLink[]>(() => {
  const wikidataLinks = getWikidataSocialLinks();
  const discogsLinks = getDiscogsSocialLinks();

  // Use a Map to deduplicate by network name (Wikidata takes priority)
  const linkMap = new Map<string, SocialLink>();

  // Add Wikidata links first (priority)
  for (const link of wikidataLinks) {
    linkMap.set(link.name, link);
  }

  // Add Discogs links if not already present
  for (const link of discogsLinks) {
    if (!linkMap.has(link.name)) {
      linkMap.set(link.name, link);
    }
  }

  return Array.from(linkMap.values());
});
</script>

<style lang="scss" scoped>
.social-links {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  position: relative;
  z-index: 1;
}

.social-link {
  align-items: center;
  background-color: var(--bg-color-dark);
  border-radius: 0.3rem;
  color: var(--font-color-light);
  display: flex;
  height: 1.8rem;
  justify-content: center;
  text-decoration: none;
  width: 1.8rem;

  &:hover {
    background-color: var(--primary-color-default);
    color: var(--font-color-default);
  }

  i {
    font-size: 1rem;
    opacity: 0.6;
  }

  &:hover i {
    opacity: 1;
  }
}
</style>
