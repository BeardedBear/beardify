export interface ArtistPage {
  artist: Artist;
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
  images: string[];
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
  genres: [],
  href: "",
  id: "",
  images: [],
  name: "",
  popularity: 0,
  type: "",
  uri: ""
};
