import { Album, AlbumSimplified } from "@/@types/Album";
import { CurrentlyPlayingAlbum } from "@/@types/CurrentlyPlaying";

/**
 * Returns true if the release is a full album (not a single, EP, or compilation).
 * @param album - Album object from the Spotify API
 */
export function isAlbum(album: Album | AlbumSimplified | CurrentlyPlayingAlbum): boolean {
  return album.album_type === "album" || album.album_type === "ALBUM";
}

/**
 * Returns true if the release is a compilation.
 * @param album - Album object from the Spotify API
 */
export function isCompilation(album: Album | AlbumSimplified | CurrentlyPlayingAlbum): boolean {
  return album.album_type === "compilation";
}

const MIN_TRACKS_FOR_EP = 3;

/**
 * Returns true if the release is an EP.
 * Spotify marks EPs as "single" type; we distinguish them by track count (>= MIN_TRACKS_FOR_EP).
 * @param album - Album object from the Spotify API
 */
export function isEP(album: Album | AlbumSimplified | CurrentlyPlayingAlbum): boolean {
  return album.total_tracks >= MIN_TRACKS_FOR_EP && album.album_type === "single";
}

/**
 * Returns true if the release is a single (fewer than MIN_TRACKS_FOR_EP tracks, type "single").
 * @param album - Album object from the Spotify API
 */
export function isSingle(album: Album | AlbumSimplified | CurrentlyPlayingAlbum): boolean {
  return album.total_tracks < MIN_TRACKS_FOR_EP && album.album_type === "single";
}

// Keywords for compilation album detection
const COMPILATION_KEYWORDS = [
  "anniversary collection",
  "anthology",
  "b-sides",
  "b sides",
  "best of",
  "chronicles",
  "complete recordings",
  "definitive collection",
  "greatest hits",
  "masterpieces",
  "rarities",
  "retrospective",
  "singles collection",
  "the collection",
  "the essential",
  "the very best",
  "very best of",
  "(demos)",
  "collection of",
  "'s classic",
  "happy holidays",
  "remixed",
  "from the original",
  "recordings",
  "picture soundtrack",
];

const COMPILATION_SPECIAL_PATTERNS = [
  "mix\\]",
  // "mix\\)",
];

const compilationAlbumRegex = new RegExp(`(${[...COMPILATION_KEYWORDS, ...COMPILATION_SPECIAL_PATTERNS].join("|")})`);

/**
 * Heuristic check: returns true if the album name suggests it is a compilation.
 * @param albumName - Album title to test
 */
export function useCheckCompilationAlbum(albumName: string): boolean {
  return compilationAlbumRegex.test(albumName.toLowerCase().trim());
}

// Keywords for live album detection
const LIVE_ALBUM_KEYWORDS = [
  "lost not forgotten archives",
  "chaos in motion",
  "live in",
  "live on",
  "live at",
  "live from",
  "live over",
  "in live",
  "on live",
  "official live",
  "live olympia",
  "live series",
  "live session",
  "live performance",
  "live anthology",
  "live bootleg",
  "world tour",
  "in concert",
  "concert",
  "royal albert hall",
  "wacken",
  "mtv unplugged",
  "live & unplugged",
  "live and unplugged",
  "bbc",
  "live and",
  "live &",
];

// Special patterns for live album detection
const LIVE_ALBUM_SPECIAL_PATTERNS = [
  "^live\\s",
  "\\(live",
  "\\[live",
  "\\- live",
  "live\\!",
  "\\…live",
  "live \\'",
  "live 1",
  "live\\, 1",
  "live 2",
  "live\\, 2",
  "\\.\\.\\.live",
  "live\\;",
  "\\: live",
  " - 19",
  "live:",
];

// Cache compiled regex for live album detection
const liveAlbumRegex = new RegExp(`(${[...LIVE_ALBUM_KEYWORDS, ...LIVE_ALBUM_SPECIAL_PATTERNS].join("|")})`);

/**
 * Heuristic check: returns true if the album name suggests it is a live recording.
 * Matches against a curated list of keywords and special patterns (e.g. "Live at …", "In Concert").
 * @param albumName - Album title to test
 */
export function useCheckLiveAlbum(albumName: string): boolean {
  const cleanedName = albumName.toLowerCase().trim();
  const lastWord = cleanedName.split(" ").pop() ?? "";
  return liveAlbumRegex.test(cleanedName) || lastWord === "live)" || lastWord === "live";
}

// Cache compiled regex for reissue album detection
const reissueAlbumRegex = /(\(reissue)/;

/**
 * Heuristic check: returns true if the album name contains "(reissue)".
 * @param albumName - Album title to test
 */
export function useCheckReissueAlbum(albumName: string): boolean {
  const cleanedName = albumName.toLowerCase().trim();
  return reissueAlbumRegex.test(cleanedName);
}
