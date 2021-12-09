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
    },

    getMyPodcasts() {
      instance()
        .get<Paging<PodcastSaved>>("me/shows")
        .then(({ data }) => {
          this.myPodcasts = data.items;
          console.log(data.items);
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
