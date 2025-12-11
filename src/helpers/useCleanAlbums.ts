import { Album, AlbumSimplified } from "@/@types/Album";
import { CurrentlyPlayingAlbum } from "@/@types/CurrentlyPlaying";

export function isAlbum(album: Album | AlbumSimplified | CurrentlyPlayingAlbum): boolean {
  return album.album_type === "album" || album.album_type === "ALBUM";
}

export function isCompilation(album: Album | AlbumSimplified | CurrentlyPlayingAlbum): boolean {
  return album.album_type === "compilation";
}

export function isEP(album: Album | AlbumSimplified | CurrentlyPlayingAlbum): boolean {
  const minimumNumberOfTracks = 3;
  return album.total_tracks >= minimumNumberOfTracks && album.album_type === "single";
}

export function isSingle(album: Album | AlbumSimplified | CurrentlyPlayingAlbum): boolean {
  const minimumNumberOfTracks = 3;
  return album.total_tracks < minimumNumberOfTracks && album.album_type === "single";
}

// Keywords for live album detection
const LIVE_ALBUM_KEYWORDS = [
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
];

// Cache compiled regex for live album detection
const liveAlbumRegex = new RegExp(`(${[...LIVE_ALBUM_KEYWORDS, ...LIVE_ALBUM_SPECIAL_PATTERNS].join("|")})`);

export function useCheckLiveAlbum(albumName: string): boolean {
  const cleanedName = albumName.toLowerCase().trim();
  return liveAlbumRegex.test(cleanedName) || cleanedName.split(" ").pop() === "live)";
}

// Cache compiled regex for reissue album detection
const reissueAlbumRegex = /(\(reissue)/;

export function useCheckReissueAlbum(albumName: string): boolean {
  const cleanedName = albumName.toLowerCase().trim();
  return reissueAlbumRegex.test(cleanedName);
}
