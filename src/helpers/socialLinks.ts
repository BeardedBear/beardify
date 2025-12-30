export interface SocialLink {
  icon: string;
  name: string;
  url: string;
}

/**
 * Social network patterns to identify URLs
 */
export const SOCIAL_PATTERNS: Array<{ icon: string; name: string; pattern: RegExp }> = [
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
export function detectSocialLinkFromUrl(url: string): null | SocialLink {
  for (const { icon, name, pattern } of SOCIAL_PATTERNS) {
    if (pattern.test(url)) {
      return { icon, name, url };
    }
  }
  return null;
}

export function extractUrl(text?: null | string): null | string {
  if (!text) return null;
  const urlMatch = text.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    let url = urlMatch[0];
    // Normalize to https (keep host and path)
    url = url.replace(/^http:\/\//i, "https://");
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

export function socialLinksFromDiscogs(urls: string[] | undefined): SocialLink[] {
  const links: SocialLink[] = [];
  if (!urls) return links;
  for (const rawUrl of urls) {
    const url = extractUrl(rawUrl) || rawUrl;
    if (!url) continue;
    if (url.includes("discogs.com")) continue;
    const detected = detectSocialLinkFromUrl(url);
    if (detected && !links.some((l) => l.name === detected.name)) {
      links.push(detected);
    }
  }
  return links;
}

export function socialLinksFromMusicBrainz(
  relations: import("./musicbrainz").MusicBrainzArtist["relations"] | undefined,
): SocialLink[] {
  const links: SocialLink[] = [];
  if (!relations) return links;
  for (const rel of relations) {
    const resource = rel?.url?.resource;
    if (!resource) continue;
    const url = extractUrl(resource) || resource;
    if (!url) continue;
    if (url.includes("musicbrainz.org")) continue;
    const detected = detectSocialLinkFromUrl(url);
    if (detected && !links.some((l) => l.name === detected.name)) {
      links.push(detected);
    }
  }
  return links;
}

export function socialLinksFromWikidata(
  identifiers: import("@/@types/Artist").WikidataArtistIdentifiers | undefined,
): SocialLink[] {
  const links: SocialLink[] = [];
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
    const websiteUrl = extractUrl(identifiers.officialWebsite);
    if (websiteUrl) {
      links.push({ icon: "icon-link", name: "Website", url: websiteUrl });
    }
  }

  return links;
}
