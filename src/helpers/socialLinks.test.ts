import { describe, expect, it } from "vitest";

import { detectSocialLinkFromUrl, extractUrl } from "./socialLinks";

/*
 * Artist links come from three sources with three shapes (Discogs, MusicBrainz,
 * Wikidata) and land in one row of icons. A pattern that stops matching turns a
 * recognised platform into a generic "Website", which is a silent downgrade
 * nobody notices.
 */
describe("detectSocialLinkFromUrl", () => {
  it("recognises the platforms it ships icons for", () => {
    expect(detectSocialLinkFromUrl("https://facebook.com/radiohead")?.name).toBe("Facebook");
    expect(detectSocialLinkFromUrl("https://www.instagram.com/radiohead")?.name).toBe("Instagram");
    expect(detectSocialLinkFromUrl("https://youtube.com/@radiohead")?.name).toBe("YouTube");
    expect(detectSocialLinkFromUrl("https://radiohead.bandcamp.com")?.name).toBe("Bandcamp");
    expect(detectSocialLinkFromUrl("https://soundcloud.com/radiohead")?.name).toBe("SoundCloud");
  });

  it("hands back the url it was given, untouched", () => {
    const url = "https://facebook.com/radiohead";
    expect(detectSocialLinkFromUrl(url)?.url).toBe(url);
  });

  it("always carries an icon when it matches", () => {
    expect(detectSocialLinkFromUrl("https://instagram.com/x")?.icon).toBeTruthy();
  });
});

describe("extractUrl", () => {
  it("pulls a url out of surrounding prose", () => {
    expect(extractUrl("Official site: https://radiohead.com here")).toBe("https://radiohead.com");
  });

  it("upgrades http to https", () => {
    // These end up in an href; no reason to send anyone to plain http.
    expect(extractUrl("http://radiohead.com")).toBe("https://radiohead.com");
  });

  it("drops punctuation the sentence left stuck to the end", () => {
    expect(extractUrl("See https://radiohead.com.")).toBe("https://radiohead.com");
    expect(extractUrl("(https://radiohead.com)")).toBe("https://radiohead.com");
  });

  it("returns null when there is nothing to extract", () => {
    expect(extractUrl(null)).toBeNull();
    expect(extractUrl(undefined)).toBeNull();
    expect(extractUrl("")).toBeNull();
    expect(extractUrl("no link in here")).toBeNull();
  });
});
