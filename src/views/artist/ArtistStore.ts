import { ActionTree, MutationTree } from "vuex";
import { AlbumSimplified } from "../../@types/Album";
import { Artist, ArtistPage, ArtistTopTracks, RelatedArtists } from "../../@types/Artist";
import { defaultArtist } from "../../@types/Defaults";
import { Paging } from "../../@types/Paging";
import { RootState } from "../../@types/RootState";
import { instance } from "../../api";
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";

const state: ArtistPage = {
  artist: defaultArtist,
  topTracks: {
    tracks: [],
  },
  albums: [],
  eps: [],
  singles: [],
  relatedArtists: {
    artists: [],
  },
  followStatus: false,
};

// MUTATIONS

export enum Mutations {
  SET_ARTIST = "SET_ARTIST",
  SET_TRACKS = "SET_TRACKS",
  SET_ALBUMS = "SET_ALBUMS",
  SET_SINGLES = "SET_SINGLES",
  SET_EPS = "SET_EPS",
  SET_RELATED_ARTISTS = "SET_RELATED_ARTISTS",
  SET_FOLLOW_STATUS = "SET_FOLLOW_STATUS",
  FOLLOW = "FOLLOW",
  UNFOLLOW = "UNFOLLOW",
}

const mutations: MutationTree<ArtistPage> = {
  [Mutations.SET_ARTIST](state, data: Artist): void {
    state.artist = data;
  },

  [Mutations.SET_TRACKS](state, data: ArtistTopTracks): void {
    state.topTracks = data;
  },

  [Mutations.SET_ALBUMS](state, data: AlbumSimplified[]): void {
    state.albums = state.albums.concat(data);
  },

  [Mutations.SET_SINGLES](state, data: AlbumSimplified[]): void {
    state.singles = data;
  },

  [Mutations.SET_EPS](state, data: AlbumSimplified[]): void {
    state.eps = data;
  },

  [Mutations.SET_RELATED_ARTISTS](state, data: Artist[]): void {
    state.relatedArtists.artists = data;
  },

  [Mutations.SET_FOLLOW_STATUS](state, data: boolean): void {
    state.followStatus = data;
  },

  [Mutations.FOLLOW](state): void {
    state.followStatus = true;
  },

  [Mutations.UNFOLLOW](state): void {
    state.followStatus = false;
  },
};

// ACTIONS

export enum ArtistActions {
  getArtist = "getArtist",
  getTopTracks = "getTopTracks",
  getAlbums = "getAlbums",
  getSingles = "getSingles",
  getRelatedArtists = "getRelatedArtists",
  getFollowStatus = "getFollowStatus",
  switchFollow = "switchFollow",
}

const actions: ActionTree<ArtistPage, RootState> = {
  [ArtistActions.getArtist](store, artistId: string): void {
    instance()
      .get<Artist>(`artists/${artistId}`)
      .then((e) => {
        store.commit(Mutations.SET_ARTIST, e.data);
      });
  },

  [ArtistActions.getTopTracks](store, artistId: string): void {
    instance()
      .get<ArtistTopTracks>(`artists/${artistId}/top-tracks?market=FR`)
      .then((e) => {
        store.commit(Mutations.SET_TRACKS, e.data);
      });
  },

  [ArtistActions.getAlbums](store, artistId: string): void {
    instance()
      .get<Paging<AlbumSimplified>>(`artists/${artistId}/albums?market=FR&include_groups=album&limit=50`)
      .then((e) => {
        store.commit(Mutations.SET_ALBUMS, removeDuplicatesAlbums(e.data.items));
        if (e.data.next !== "") {
          instance()
            .get<Paging<AlbumSimplified>>(e.data.next)
            .then((e) => store.commit(Mutations.SET_ALBUMS, removeDuplicatesAlbums(e.data.items)));
        }
      });
  },

  [ArtistActions.getSingles](store, artistId: string): void {
    instance()
      .get<Paging<AlbumSimplified>>(`artists/${artistId}/albums?market=FR&include_groups=single&limit=50`)
      .then((e) => {
        const minimumNumberOfTracks = 3;
        const onlySingles = e.data.items.filter((e) => e.total_tracks < minimumNumberOfTracks);
        const onlyEps = e.data.items.filter((e) => e.total_tracks >= minimumNumberOfTracks);
        store.commit(Mutations.SET_SINGLES, removeDuplicatesAlbums(onlySingles));
        store.commit(Mutations.SET_EPS, removeDuplicatesAlbums(onlyEps));
      });
  },

  [ArtistActions.getRelatedArtists](store, artistId: string): void {
    instance()
      .get<RelatedArtists>(`artists/${artistId}/related-artists`)
      .then((e) => {
        store.commit(Mutations.SET_RELATED_ARTISTS, e.data.artists.slice(0, 15));
      });
  },

  [ArtistActions.getFollowStatus](store, artistId: string): void {
    instance()
      .get<boolean[]>(`me/following/contains?type=artist&ids=${artistId}`)
      .then((e) => {
        store.commit(Mutations.SET_FOLLOW_STATUS, e.data.pop());
      });
  },

  [ArtistActions.switchFollow](store, artistId: string): void {
    if (store.state.followStatus) {
      instance().delete(`me/following?type=artist&ids=${artistId}`);
      store.commit(Mutations.SET_FOLLOW_STATUS, false);
    } else {
      instance().put(`me/following?type=artist&ids=${artistId}`);
      store.commit(Mutations.SET_FOLLOW_STATUS, true);
    }
  },
};

export default {
  actions,
  mutations,
  state,
};
