import { defineStore } from "pinia";
import { Paging } from "../../@types/Paging";
import { Podcast, PodcastItem, PodcastSaved, PodcastsPage } from "../../@types/Podcast";
import { instance } from "../../api";

export const usePodcasts = defineStore("podcasts", {
  state: (): PodcastsPage => ({
    podcast: null,
    list: null,
    myPodcasts: [],
  }),

  actions: {
    async clean() {
      this.podcast = null;
      this.list = null;
      this.myPodcasts = [];
    },

    // getPlaylists(url: string) {
    //   if (url && router.currentRoute.value.name !== "Login") {
    //     instance()
    //       .get<Paging<SimplifiedPlaylist>>(url)
    //       .then((e) => {
    //         this.playlists = this.playlists.concat(e.data.items);
    //         if (e.data.next) this.getPlaylists(e.data.next);
    //       });
    //   }
    // },

    getMyPodcasts(url: string) {
      instance()
        .get<Paging<PodcastSaved>>(url)
        .then((e) => {
          this.myPodcasts = this.myPodcasts.concat(e.data.items);

          if (e.data.next) this.getMyPodcasts(e.data.next);
        });

      // this.myPodcasts = data);
      // if (e.data.next) {
      //   instance()
      //     .get<Paging<PlaylistTrack>>(e.data.next)
      //     .then((f) => {
      //       this.tracks = this.tracks.concat(f.data.items.filter((g) => g.track));
      //     });
      // }
      // });
    },

    getPodcasts() {
      const podcasts = [
        "5JxGy243aIXNWg6HSeV627", // La Pifotheque
        "31ZkKfw71Dp6uGhxmB7joR", // Le Bruit
      ];

      instance()
        .get<PodcastItem>(`/shows?ids=${podcasts.join()}`)
        .then(({ data }) => {
          this.list = data;
        });
    },

    getPodcast(podcastId: string) {
      instance()
        .get<Podcast>(`/shows/${podcastId}`)
        .then(({ data }) => {
          this.podcast = data;
          console.log(data);

          // this.list = data.shows;
        });
    },
  },
});
