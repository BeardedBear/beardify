export interface ArtistPage {
  artist: Artist;
  topTracks: ArtistTopTracks;
  albums: AlbumSimplified[];
  singles: AlbumSimplified[];
  relatedArtists: RelatedArtists;
  followStatus: boolean;
}

export interface ArtistTopTracks {
  tracks: Track[];
}

export interface Image {
  height: number;
  url: string;
  width: number;
}

// export interface Album {
//   album_group: string;
//   album_type: string;
//   artists: ArtistSimplified[];
//   external_urls: ExternalUrls;
//   href: string;
//   id: string;
//   images: Image[];
//   name: string;
//   release_date: string;
//   release_date_precision: string;
//   total_tracks: number;
//   type: string;
//   uri: string;
// }

export interface Track {
  album: AlbumSimplified;
  artists: ArtistSimplified[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: { isrc: string };
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  is_playable: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

export const defaultExternalUrls = {
  Spotify: ""
};
interface ExternalUrls {
  spotify: string;
}

export interface RelatedArtists {
  artists: Artist[];
}

export interface ArtistSimplified {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}
export interface Artist {
  external_urls: {
    spotify: string;
  };
  followers: {
    href: null;
    total: number;
  };
  genres: string[];
  href: string;
  id: string;
  images: Image[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}

export const defaultArtist = {
  external_urls: {
    spotify: ""
  },
  followers: {
    href: null,
    total: 0
  },
  genres: [""],
  href: "",
  id: "",
  images: [],
  name: "",
  popularity: 0,
  type: "",
  uri: ""
};

export interface AlbumSimplified {
  album_type: string;
  artists: ArtistSimplified[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

export const defaultAlbumSimplified = {
  album_type: "",
  artists: defaultArtist,
  external_urls: defaultExternalUrls,
  href: "",
  id: "",
  images: [],
  name: "",
  release_date: "",
  release_date_precision: "",
  total_tracks: 0,
  type: "",
  uri: ""
};
