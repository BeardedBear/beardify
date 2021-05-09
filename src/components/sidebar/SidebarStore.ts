import { AxiosResponse } from "axios";
import { log } from "console";
import { ActionTree, MutationTree } from "vuex";
import { Album } from "../../@types/Album";
import { Artist } from "../../@types/Artist";
import { defaultSimplifiedPlaylist } from "../../@types/Defaults";
import { Paging } from "../../@types/Paging";
import { SimplifiedPlaylist } from "../../@types/Playlist";
import { RootState } from "../../@types/RootState";
import { Search, SearchFromAPI } from "../../@types/Search";
import { Sidebar } from "../../@types/Sidebar";
import { TrackSimplified } from "../../@types/Track";
import { instance } from "../../api";

const state: Sidebar = {
  collections: [defaultSimplifiedPlaylist],
  playlists: [defaultSimplifiedPlaylist]
};

// MUTATIONS

export enum Mutations {
  SET_RESULTS = "SET_RESULTS"
}

const mutations: MutationTree<Sidebar> = {
  [Mutations.SET_RESULTS](state, data: SimplifiedPlaylist[]): void {
    state.playlists = data;
    console.log("coucou");
  }
};

// ACTIONS

export enum SidebarActions {
  search = "search"
}

// function recursive<P>(type: Paging<P[]>) {
//   let test: P[] = [];

//   if (type.next !== "") {
//     instance.get<Paging<P>>(type.next).then(e => {
//       test.push(e.data);
//     });
//   }

//   return test;
// }

function oais(url: AxiosResponse): SimplifiedPlaylist[] {
  if (url.data.next !== "") {
  }
  instance.get<Paging<SimplifiedPlaylist>>(url.data.next).then(f => {
    return f.data.items;
  });
  return [];
}

const actions: ActionTree<Sidebar, RootState> = {
  [SidebarActions.search](store) {
    instance.get<Paging<SimplifiedPlaylist>>(`https://api.spotify.com/v1/me/playlists?limit=50`).then(e => {
      // let playlistss: SimplifiedPlaylist[] = [];
      // playlistss.push(...playlistss, e.data.items);
      // store.dispatch(SidebarActions.search)
      // console.log(playlistss);
      // playlistss.concat(e.data.items);
      // console.log("oais", oais(e));
      console.log("e.data.items", e.data);
      store.commit(Mutations.SET_RESULTS, e.data.items);

      // if (e.data.next !== "") {
      //   instance.get<Paging<SimplifiedPlaylist>>(e.data.next).then(f => {
      //     // playlists.push();
      //     playlistss.concat(f.data.items);
      //     console.log("playlistss", playlistss);
      //   });
      // }
      // console.log(e.data);
      // console.log(playlists);

      // const artists = e.data.artists.items.slice(0, 12);
      // const albums = e.data.albums.items.slice(0, 6);
      // const tracks = e.data.tracks.items.slice(0, 6);
      // store.commit(Mutations.SET_RESULTS, { artists, albums, tracks });
    });
  }
};

export default {
  actions,
  mutations,
  namespaced: true,
  state
};
