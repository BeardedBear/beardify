export interface LastfmArtistTopAlbums {
  topalbums?: {
    album: LastfmTopAlbum[];
  };
}

export interface LastfmTagTopArtists {
  topartists?: {
    artist: LastfmTopArtist[];
  };
}

export interface LastfmTopAlbum {
  name: string;
}

export interface LastfmTopArtist {
  mbid?: string;
  name: string;
  url: string;
}
