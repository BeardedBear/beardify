export interface LastfmTagTopArtists {
  topartists?: {
    artist: LastfmTopArtist[];
  };
}

export interface LastfmTopArtist {
  mbid?: string;
  name: string;
  url: string;
}
