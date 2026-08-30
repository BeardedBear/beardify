import type { BandMember } from "@/@types/Artist";

import { BEARDIFY_USER_AGENT, http } from "@/helpers/http";

const WIKIDATA_ENTITY_URL = "https://www.wikidata.org/wiki/Special:EntityData/";
const WIKIDATA_API_URL = "https://www.wikidata.org/w/api.php";

/**
 * Wikidata property/item IDs used to extract band members from "has part(s)" (P527)
 */
const MEMBER_PROPERTIES = {
  END_TIME: "P582",
  HAS_PART: "P527",
  HUMAN: "Q5",
  INSTANCE_OF: "P31",
  INSTRUMENT: "P1303",
  START_TIME: "P580",
};

/**
 * Max entities resolvable in a single wbgetentities call
 */
const WBGETENTITIES_CHUNK = 50;

/**
 * Wikidata property IDs for music-related data
 */
const WIKIDATA_PROPERTIES = {
  ALBUM_OF_THE_YEAR_ID: "P7050",
  ALLMUSIC_ARTIST_ID: "P1728",
  APPLE_MUSIC_ARTIST_ID: "P3943",
  BANDCAMP_ID: "P3283",
  DEEZER_ARTIST_ID: "P2722",
  DISCOGS_ARTIST_ID: "P1953",
  FACEBOOK_ID: "P2013",
  GENIUS_ARTIST_ID: "P2909",
  IMAGE: "P18",
  INSTAGRAM_USERNAME: "P2003",
  MUSICBRAINZ_ARTIST_ID: "P434",
  OFFICIAL_WEBSITE: "P856",
  RATE_YOUR_MUSIC_ID: "P5404",
  SETLISTFM_ARTIST_ID: "P5356",
  SONGKICK_ARTIST_ID: "P3478",
  SOUNDCLOUD_ID: "P3040",
  SPOTIFY_ARTIST_ID: "P1902",
  TWITTER_USERNAME: "P2002",
  YOUTUBE_CHANNEL_ID: "P2397",
};

/**
 * Interface for Wikidata artist data with all external identifiers
 */
export interface WikidataArtist {
  description: null | string;
  id: string;
  identifiers: WikidataArtistIdentifiers;
  imageUrl: null | string;
  label: null | string;
  wikipediaLanguages: WikipediaLanguage[];
  wikipediaUrl: null | string;
}

/**
 * External identifiers available from Wikidata
 */
export interface WikidataArtistIdentifiers {
  albumOfTheYearId: null | string;
  allMusicId: null | string;
  appleMusicId: null | string;
  bandcampId: null | string;
  deezerId: null | string;
  discogsId: null | string;
  facebookId: null | string;
  geniusId: null | string;
  instagramUsername: null | string;
  musicbrainzId: null | string;
  officialWebsite: null | string;
  rateYourMusicId: null | string;
  setlistfmId: null | string;
  songkickId: null | string;
  soundcloudId: null | string;
  spotifyId: null | string;
  twitterUsername: null | string;
  youtubeChannelId: null | string;
}

/**
 * Interface for available Wikipedia language
 */
export interface WikipediaLanguage {
  code: string;
  name: string;
  url: string;
}

/**
 * Interface for Wikidata claim
 */
interface WikidataClaim {
  mainsnak: WikidataSnak;
  qualifiers?: Record<string, WikidataSnak[]>;
  rank: string;
  type: string;
}

/**
 * Interface for Wikidata entity
 */
interface WikidataEntity {
  claims?: Record<string, WikidataClaim[]>;
  descriptions?: Record<string, { language: string; value: string }>;
  id: string;
  labels?: Record<string, { language: string; value: string }>;
  sitelinks?: Record<string, { badges: string[]; site: string; title: string }>;
  type: string;
}

/**
 * Interface for a Wikidata snak (main value or qualifier)
 */
interface WikidataSnak {
  datatype?: string;
  datavalue?: {
    type: string;
    value: WikidataValue;
  };
  property: string;
  snaktype: string;
}

/**
 * Possible value shapes returned by Wikidata
 */
type WikidataValue
  = | { "numeric-id": number }
    | { id: string }
    | { precision: number; time: string }
    | string;

/**
 * Sections to exclude from Wikipedia content (multilingual)
 * Each array contains translations for the same section across supported languages
 */
const EXCLUDED_WIKIPEDIA_SECTIONS: string[] = [
  // Band members
  "Band members",
  "Membres du groupe",
  "Mitglieder",
  "Miembros",
  "Membri del gruppo",
  "Leden",
  "Membros",
  "Участники",
  "メンバー",
  "成员",
  "멤버",

  // Members
  "Members",
  "Membres",
  "Membri",
  "成員",

  // External links
  "External links",
  "Liens externes",
  "Weblinks",
  "Enlaces externos",
  "Collegamenti esterni",
  "Externe links",
  "Ligações externas",
  "Внешние ссылки",
  "外部リンク",
  "外部链接",
  "외부 링크",

  // Further reading
  "Further reading",
  "Bibliographie",
  "Literatur",
  "Bibliografía",
  "Bibliografia",
  "Literatuur",
  "Leitura adicional",
  "Литература",
  "参考文献",
  "延伸阅读",
  "더 읽기",

  // Notes
  "Notes",
  "Notes et références",
  "Anmerkungen",
  "Notas",
  "Note",
  "Noten",
  "Примечания",
  "脚注",
  "注释",
  "각주",

  // References
  "References",
  "Références",
  "Einzelnachweise",
  "Referencias",
  "Referenties",
  "Referências",
  "Ссылки",
  "出典",
  "参考资料",

  // See also
  "See also",
  "Voir aussi",
  "Siehe auch",
  "Véase también",
  "Voci correlate",
  "Zie ook",
  "Ver também",
  "См. также",
  "関連項目",
  "参见",
  "같이 보기",

  // Sources
  "Sources",
  "Quellen",
  "Fuentes",
  "Fonti",
  "Bronnen",
  "Fontes",
  "Источники",
  "来源",
  "출처",

  // Tours
  "Tours",
  "Tournées",
  "Tourneen",
  "Giras",
  "Tour",
  "Tournees",
  "Turnês",
  "Туры",
  "ツアー",
  "巡回演出",
  "투어",

  // Awards (bonus - commonly excluded)
  "Awards",
  "Récompenses",
  "Auszeichnungen",
  "Premios",
  "Premi",
  "Prijzen",
  "Prêmios",
  "Награды",
  "受賞歴",
  "奖项",
  "수상",

  // Filmography (for artists who acted)
  "Filmography",
  "Filmographie",
  "Filmografie",
  "Filmografía",
  "Filmografia",
  "Фильмография",
  "フィルモグラフィー",
  "影视作品",
  "필모그래피",

  // Annexes (French Wikipedia specific section)
  "Annexes",
];

/**
 * Regex patterns for sections to exclude (for sections with many variants)
 * These patterns match section titles that START with the given prefix
 */
const EXCLUDED_WIKIPEDIA_SECTION_PATTERNS: RegExp[] = [
  // Discography in all languages (matches "Discography", "Discography (selection)", "Discographie studio", etc.)
  /^Discograph/i, // English, French
  /^Diskografi/i, // German, Swedish, Norwegian, Danish
  /^Discografía/i, // Spanish
  /^Discografia/i, // Italian, Portuguese
  /^Discografie/i, // Dutch, Romanian
  /^Дискография/i, // Russian
  /^ディスコグラフィ/i, // Japanese
  /^音乐作品/i, // Chinese
  /^음반/i, // Korean (음반 목록, 음반 discography)
];

/**
 * Get language display name using Intl API with fallback
 */
function getLanguageDisplayName(code: string): string {
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "language" });
    const name = displayNames.of(code);
    if (name && name !== code) {
      return name;
    }
  } catch {
    // Fallback if Intl API fails
  }
  return code.toUpperCase();
}

/**
 * Creates a Wikidata API client instance
 */
const wikidataClient = http.extend({
  headers: {
    "User-Agent": BEARDIFY_USER_AGENT,
  },
  retry: {
    limit: 1,
    statusCodes: [429, 503],
  },
  timeout: 10000,
});

/**
 * Entity requests currently in flight, keyed by entity id.
 *
 * `getWikidataArtist` and `getWikidataBandMembers` are called together for the same band and
 * read the same document, which Wikidata serves as `must-revalidate, max-age=0` — so without
 * this the payload (several hundred KB for a large band) is downloaded and parsed twice on
 * every artist page. Entries clear as soon as the request settles: this shares concurrent
 * callers, it is not a cache. Callers are expected to share one abort signal, since the first
 * one's signal is the one the shared request carries.
 */
const inFlightEntities = new Map<string, Promise<Record<string, WikidataEntity>>>();

/**
 * Get artist data from Wikidata by entity ID
 * @param entityId - The Wikidata entity ID (e.g., Q483)
 * @param signal - Aborts the request when the caller moves on (e.g. artist navigation)
 * @returns Promise resolving to WikidataArtist or null
 */
export async function getWikidataArtist(
  entityId: string,
  signal?: AbortSignal,
): Promise<null | WikidataArtist> {
  try {
    const entities = await fetchWikidataEntities(entityId, signal);

    const entity = entities[entityId];
    if (!entity) {
      return null;
    }

    return parseWikidataEntity(entity);
  } catch {
    return null;
  }
}

/**
 * Get band members (with active periods and instruments) from a Wikidata
 * band entity, using the "has part(s)" (P527) statements and their
 * start/end time qualifiers. Member names and instruments are resolved
 * through batched wbgetentities calls (no WDQS / SPARQL dependency).
 * @param entityId - The Wikidata entity ID of the band (e.g., Q15920)
 * @param signal - Aborts the requests when the caller moves on (e.g. artist navigation)
 * @returns Promise resolving to band members, empty array when none
 */
export async function getWikidataBandMembers(
  entityId: string,
  signal?: AbortSignal,
): Promise<BandMember[]> {
  try {
    const entities = await fetchWikidataEntities(entityId, signal);
    const statements = entities[entityId]?.claims?.[MEMBER_PROPERTIES.HAS_PART];
    if (!statements?.length) return [];

    // Extract member Q-ids and their start/end periods from the statements
    const partials = statements
      .map((statement) => {
        const id = getSnakEntityId(statement.mainsnak);
        if (!id) return null;
        return {
          begin: normalizeWikidataTime(getQualifierTime(statement, MEMBER_PROPERTIES.START_TIME)),
          end: normalizeWikidataTime(getQualifierTime(statement, MEMBER_PROPERTIES.END_TIME)),
          id,
        };
      })
      .filter((part): part is { begin: null | string; end: null | string; id: string } => part !== null);

    if (partials.length === 0) return [];

    // Resolve member labels + instruments, dropping non-person parts (albums, logos…)
    const memberEntities = await getWikidataEntities(
      partials.map((part) => part.id),
      "labels|claims",
      signal,
    );

    const instrumentIds = new Set<string>();
    const enriched = partials
      .map((part) => {
        const entity = memberEntities[part.id];
        if (!entity || !isHumanOrUnknown(entity)) return null;
        const instruments = getClaimEntityIds(entity, MEMBER_PROPERTIES.INSTRUMENT);
        instruments.forEach((instrument) => instrumentIds.add(instrument));
        return {
          begin: part.begin,
          end: part.end,
          ended: part.end !== null,
          id: part.id,
          instrumentIds: instruments,
          name: entity.labels?.en?.value || entity.labels?.fr?.value || part.id,
        };
      })
      .filter((member) => member !== null);

    if (enriched.length === 0) return [];

    // Resolve instrument labels in a second batch
    const instrumentLabels = await getWikidataEntities([...instrumentIds], "labels", signal);

    return enriched.map((member) => ({
      begin: member.begin,
      end: member.end,
      ended: member.ended,
      id: member.id,
      instruments: member.instrumentIds
        .map((instrument) => instrumentLabels[instrument]?.labels?.en?.value)
        .filter((label): label is string => Boolean(label)),
      name: member.name,
    }));
  } catch {
    return [];
  }
}

/**
 * Get Wikipedia article content (extract) from a Wikipedia URL
 * @param wikipediaUrl - The full Wikipedia URL
 * @param signal - Aborts the request when the caller moves on (e.g. artist navigation)
 * @returns Promise resolving to the article extract HTML or null
 */
export async function getWikipediaExtract(
  wikipediaUrl: string,
  signal?: AbortSignal,
): Promise<null | string> {
  try {
    // Extract language and title from URL
    // e.g., "https://en.wikipedia.org/wiki/Radiohead" -> lang: "en", title: "Radiohead"
    const urlMatch = wikipediaUrl.match(/https?:\/\/(\w+)\.wikipedia\.org\/wiki\/(.+)/);
    if (!urlMatch) {
      return null;
    }

    const [, lang, encodedTitle] = urlMatch;
    const title = decodeURIComponent(encodedTitle);

    // Use MediaWiki API with extracts - full article, HTML format
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      prop: "extracts",
      titles: title,
    });

    const response = await http.get(`https://${lang}.wikipedia.org/w/api.php?${params.toString()}`, { signal });
    const data = (await response.json()) as {
      query?: {
        pages: Record<
          string,
          {
            extract?: string;
            pageid: number;
            title: string;
          }
        >;
      };
    };

    if (!data.query?.pages) {
      return null;
    }

    // Get the first page (there should only be one)
    const pages = Object.values(data.query.pages);
    if (pages.length === 0 || !pages[0].extract) {
      return null;
    }

    // Clean the HTML to remove unwanted sections
    return cleanWikipediaHtml(pages[0].extract);
  } catch {
    return null;
  }
}

/**
 * Remove unwanted sections from Wikipedia HTML content
 * @param html - The raw HTML content from Wikipedia
 * @returns Cleaned HTML without excluded sections
 */
function cleanWikipediaHtml(html: string): string {
  // Wikipedia can use different HTML structures for headers:
  // - <h2><span id="...">Title</span></h2>
  // - <h2 id="...">Title</h2>
  // - <h2><span class="mw-headline" id="...">Title</span></h2>
  // We need to match all variations and remove everything until the next h2 or end

  // Helper function to escape special regex characters in exact section names
  const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /*
   * Exact names and regex patterns only differ in how their title source is
   * built (escape a literal vs. unanchor a pattern) and in what may trail the
   * title. Both then get the same three heading shapes, so they share one loop.
   */
  const titleSources = [
    ...EXCLUDED_WIKIPEDIA_SECTIONS.map((section) => `${escapeRegex(section)}\\s*`),
    ...EXCLUDED_WIKIPEDIA_SECTION_PATTERNS.map((pattern) => `${pattern.source.replace(/^\^/, "")}[^<]*`),
  ];

  let result = html;

  for (const title of titleSources) {
    const patterns = [
      // Match <h2>...<span>Title</span>...</h2> followed by content until next <h2 or end
      new RegExp(`<h2[^>]*>[^<]*<span[^>]*>[^<]*${title}[^<]*</span>[^<]*</h2>[\\s\\S]*?(?=<h2|$)`, "gi"),
      // Match <h2>Title</h2> directly (no span)
      new RegExp(`<h2[^>]*>\\s*${title}</h2>[\\s\\S]*?(?=<h2|$)`, "gi"),
      // Match <h3> variants for subsections
      new RegExp(`<h3[^>]*>[^<]*<span[^>]*>[^<]*${title}[^<]*</span>[^<]*</h3>[\\s\\S]*?(?=<h[23]|$)`, "gi"),
    ];

    for (const pattern of patterns) {
      result = result.replace(pattern, "");
    }
  }

  return result;
}

/**
 * Fetch a Wikidata entity document, joining a request already in flight for the same id.
 * @param entityId - The Wikidata entity ID (e.g., Q483)
 * @param signal - Aborts the request when the caller moves on (e.g. artist navigation)
 */
function fetchWikidataEntities(
  entityId: string,
  signal?: AbortSignal,
): Promise<Record<string, WikidataEntity>> {
  const pending = inFlightEntities.get(entityId);
  if (pending) return pending;

  const request = wikidataClient
    .get(`${WIKIDATA_ENTITY_URL}${entityId}.json`, { signal })
    .json<{ entities: Record<string, WikidataEntity> }>()
    .then((data) => data.entities)
    .finally(() => inFlightEntities.delete(entityId));

  inFlightEntities.set(entityId, request);
  return request;
}

/**
 * Extract all entity Q-ids referenced by a given property on an entity
 */
function getClaimEntityIds(entity: WikidataEntity, property: string): string[] {
  return (entity.claims?.[property] ?? [])
    .map((claim) => getSnakEntityId(claim.mainsnak))
    .filter((id): id is string => id !== null);
}

/**
 * Extract string value from a Wikidata claim
 * @param claims - The claims object
 * @param propertyId - The property ID to extract
 * @returns The string value or null
 */
function getClaimStringValue(claims: Record<string, WikidataClaim[]>, propertyId: string): null | string {
  const claim = claims[propertyId]?.[0];
  if (!claim?.mainsnak?.datavalue) {
    return null;
  }

  const value = claim.mainsnak.datavalue.value;
  if (typeof value === "string") {
    return value;
  }

  return null;
}

/**
 * Read a time qualifier value (e.g. P580/P582) from a claim
 */
function getQualifierTime(claim: WikidataClaim, property: string): string | undefined {
  const value = claim.qualifiers?.[property]?.[0]?.datavalue?.value;
  return value && typeof value === "object" && "time" in value ? value.time : undefined;
}

/**
 * Extract the referenced entity Q-id from a snak, or null when not an entity value
 */
function getSnakEntityId(snak: WikidataSnak): null | string {
  if (snak.snaktype !== "value") return null;
  const value = snak.datavalue?.value;
  return value && typeof value === "object" && "id" in value ? value.id : null;
}

/**
 * Batch-resolve Wikidata entities via wbgetentities (max 50 ids per request)
 * @param ids - Entity Q-ids to resolve
 * @param props - Comma-separated props (e.g. "labels|claims")
 * @param signal - Aborts the requests when the caller moves on (e.g. artist navigation)
 */
async function getWikidataEntities(
  ids: string[],
  props: string,
  signal?: AbortSignal,
): Promise<Record<string, WikidataEntity>> {
  const result: Record<string, WikidataEntity> = {};

  for (let i = 0; i < ids.length; i += WBGETENTITIES_CHUNK) {
    if (signal?.aborted) break;
    const chunk = ids.slice(i, i + WBGETENTITIES_CHUNK);
    if (chunk.length === 0) continue;

    const params = new URLSearchParams({
      action: "wbgetentities",
      format: "json",
      ids: chunk.join("|"),
      languages: "en|fr",
      origin: "*",
      props,
    });

    const response = await wikidataClient.get(`${WIKIDATA_API_URL}?${params.toString()}`, { signal });
    const data = await response.json<{ entities?: Record<string, WikidataEntity> }>();
    if (data.entities) Object.assign(result, data.entities);
  }

  return result;
}

/**
 * Convert Wikimedia Commons image name to URL
 * @param imageName - The image filename from Wikidata
 * @returns The full image URL or null
 */
function getWikimediaImageUrl(imageName: null | string): null | string {
  if (!imageName) {
    return null;
  }

  // Wikimedia Commons URL format
  const encodedName = encodeURIComponent(imageName.replace(/ /g, "_"));
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedName}?width=300`;
}

/**
 * Get all available Wikipedia languages from sitelinks
 * @param sitelinks - The sitelinks object from Wikidata
 * @returns Array of available Wikipedia languages
 */
function getWikipediaLanguages(
  sitelinks: Record<string, { badges: string[]; site: string; title: string }> | undefined,
): WikipediaLanguage[] {
  if (!sitelinks) {
    return [];
  }

  const languages: WikipediaLanguage[] = [];

  // Extract Wikipedia sitelinks (format: "enwiki", "frwiki", etc.)
  for (const [key, value] of Object.entries(sitelinks)) {
    const match = key.match(/^(\w+)wiki$/);
    if (match && !key.includes("commons") && !key.includes("species")) {
      const code = match[1];
      // Skip non-language wikis
      if (code.length <= 3) {
        languages.push({
          code,
          name: getLanguageDisplayName(code),
          url: `https://${code}.wikipedia.org/wiki/${encodeURIComponent(value.title.replace(/ /g, "_"))}`,
        });
      }
    }
  }

  // Sort: English first, then French, then alphabetically by name
  return languages.sort((a, b) => {
    if (a.code === "en") return -1;
    if (b.code === "en") return 1;
    if (a.code === "fr") return -1;
    if (b.code === "fr") return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Whether an entity is a human (P31=Q5) or has no explicit type.
 * Used to drop non-person "has part" values such as albums or logos.
 */
function isHumanOrUnknown(entity: WikidataEntity): boolean {
  const types = getClaimEntityIds(entity, MEMBER_PROPERTIES.INSTANCE_OF);
  return types.length === 0 || types.includes(MEMBER_PROPERTIES.HUMAN);
}

/**
 * Normalize a Wikidata time value (e.g. "+1981-10-28T00:00:00Z") to a partial
 * date string (YYYY, YYYY-MM or YYYY-MM-DD), dropping unknown month/day "00".
 */
function normalizeWikidataTime(time: string | undefined): null | string {
  if (!time) return null;
  const match = time.match(/^[+-]?(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const [, year, month, day] = match;
  let result = year;
  if (month !== "00") {
    result += `-${month}`;
    if (day !== "00") result += `-${day}`;
  }
  return result;
}

/**
 * Parse a Wikidata entity into a WikidataArtist object
 * @param entity - The raw Wikidata entity
 * @returns WikidataArtist object
 */
function parseWikidataEntity(entity: WikidataEntity): WikidataArtist {
  const claims = entity.claims || {};
  // Already sorted English-first, then French, so the preferred link is just
  // the first of those two that exists — no second preference list needed.
  const wikipediaLanguages = getWikipediaLanguages(entity.sitelinks);

  return {
    description: entity.descriptions?.en?.value || entity.descriptions?.fr?.value || null,
    id: entity.id,
    identifiers: {
      albumOfTheYearId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.ALBUM_OF_THE_YEAR_ID),
      allMusicId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.ALLMUSIC_ARTIST_ID),
      appleMusicId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.APPLE_MUSIC_ARTIST_ID),
      bandcampId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.BANDCAMP_ID),
      deezerId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.DEEZER_ARTIST_ID),
      discogsId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.DISCOGS_ARTIST_ID),
      facebookId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.FACEBOOK_ID),
      geniusId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.GENIUS_ARTIST_ID),
      instagramUsername: getClaimStringValue(claims, WIKIDATA_PROPERTIES.INSTAGRAM_USERNAME),
      musicbrainzId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.MUSICBRAINZ_ARTIST_ID),
      officialWebsite: getClaimStringValue(claims, WIKIDATA_PROPERTIES.OFFICIAL_WEBSITE),
      rateYourMusicId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.RATE_YOUR_MUSIC_ID),
      setlistfmId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.SETLISTFM_ARTIST_ID),
      songkickId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.SONGKICK_ARTIST_ID),
      soundcloudId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.SOUNDCLOUD_ID),
      spotifyId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.SPOTIFY_ARTIST_ID),
      twitterUsername: getClaimStringValue(claims, WIKIDATA_PROPERTIES.TWITTER_USERNAME),
      youtubeChannelId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.YOUTUBE_CHANNEL_ID),
    },
    imageUrl: getWikimediaImageUrl(getClaimStringValue(claims, WIKIDATA_PROPERTIES.IMAGE)),
    label: entity.labels?.en?.value || entity.labels?.fr?.value || null,
    wikipediaLanguages,
    wikipediaUrl: wikipediaLanguages.find((lang) => lang.code === "en" || lang.code === "fr")?.url ?? null,
  };
}
