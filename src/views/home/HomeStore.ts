import { ActionTree, MutationTree } from "vuex";
import { AlbumSimplified } from "../../@types/Album";
import { Artist } from "../../@types/Artist";
import { HomePage } from "../../@types/Home";
import { Paging } from "../../@types/Paging";
import { RootState } from "../../@types/RootState";
import { Track } from "../../@types/Track";
import { api, instance } from "../../api";
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";
import { getRandomInt } from "../../helpers/random";

const state: HomePage = {
  recommendedAlbums: [],
};

// MUTATIONS

export enum Mutations {
  SET_RECOMMENDED_ALBUMS = "SET_RECOMMENDED_ALBUMS",
}

const mutations: MutationTree<HomePage> = {
  [Mutations.SET_RECOMMENDED_ALBUMS](state, albums: AlbumSimplified[]): void {
    state.recommendedAlbums = albums;
  },
};

// ACTIONS
export enum HomeActions {
  getRecommendedAlbums = "getRecommendedAlbums",
}

const actions: ActionTree<HomePage, RootState> = {
  [HomeActions.getRecommendedAlbums](store) {
    instance.get<Paging<Artist>>(`${api.url}me/top/artists`).then((e) => {
      interface Top {
        seed: unknown;
        tracks: Track[];
      }

      const artistsSeed = `${e.data.items[getRandomInt(0, 10)].id},${e.data.items[getRandomInt(0, 10)].id},${
        e.data.items[getRandomInt(0, 10)].id
      },${e.data.items[getRandomInt(0, 10)].id},${e.data.items[getRandomInt(0, 10)].id}`;

      instance.get<Top>(`${api.url}recommendations?market=FR&seed_artists=${artistsSeed}&limit=50`).then((f) => {
        store.commit(
          Mutations.SET_RECOMMENDED_ALBUMS,
          removeDuplicatesAlbums(f.data.tracks.map((g) => g.album).filter((h) => h.album_type === "ALBUM"))
        );
      });
    });
  },
};

export default {
  actions,
  mutations,
  state,
};
