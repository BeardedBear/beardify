import axios from "axios";
import { defineStore } from "pinia";
import { MenuItem, Release, ReleasesCheck, ReleasesPage } from "../../@types/Releases";
import { useCheckLiveAlbum, useCheckReissueAlbum } from "../../helpers/useCleanAlbums";
import { useMergeReleaseSlugs } from "../../helpers/useMergeReleaseSlugs";
import { useAuth } from "../auth/AuthStore";

export const useReleases = defineStore("releases", {
  state: (): ReleasesPage => ({
    menu: [],
    releases: [],
    monthList: [],
    activeSlug: null,
    checks: null,
    uid: null,
  }),

  actions: {
    async clean() {
      this.menu = [];
      this.releases = [];
    },

    setActiveSlug(slug: string | null) {
      this.activeSlug = this.activeSlug === slug ? null : slug;
    },

    async createReleasesCheckEntry() {
      const authStore = useAuth();
      const userId = authStore.me?.id;
      const { data } = await axios.get<{ data: ReleasesCheck[] }>(
        `https://beardictus.com/items/ReleasesCheck?filter[user][_eq]=${userId}`,
      );

      if (!data.data.length) {
        axios
          .post("https://beardictus.com/items/ReleasesCheck", {
            user: useAuth().me?.id,
            checks: [],
          })
          .then(() => (this.checks = []));
      } else {
        this.checks = data.data[0].checks;
        this.uid = data.data[0].id;
      }
    },

    async checkRelease(releaseId: string) {
      const newChecks = this.checks && this.checks?.concat(releaseId);

      if (!this.checks?.includes(releaseId)) {
        axios.patch(`https://beardictus.com/items/ReleasesCheck/${this.uid}`, {
          checks: newChecks,
        });
        this.checks = newChecks;
      }
    },

    async getReleases() {
      axios.get<{ data: { releases: Release[] } }>("https://beardictus.com/items/releases").then(({ data }) => {
        const categories = Array.from(new Set(data.data.releases.map((release) => release.category)));
        function getSlugsByCategory(category: string): string[] {
          const array: string[] = [];
          const mergedSlugs = data.data.releases
            .filter((release) => release.category === category)
            .map((e) => array.concat(e.slug))
            .flat();
          return Array.from(new Set(mergedSlugs));
        }

        categories.forEach((category): void => {
          const teee: MenuItem = {
            name: category,
            slugs: getSlugsByCategory(category),
          };
          if (!this.menu.find((e) => e.name == teee.name)) this.menu.push(teee);
        });

        const dataWithMergedSlugs = useMergeReleaseSlugs(data.data.releases);
        const removedLives = dataWithMergedSlugs.filter((release) => !useCheckLiveAlbum(release.album));
        const removedReissues = removedLives.filter((release) => !useCheckReissueAlbum(release.album));
        this.monthList = Array.from(new Set(dataWithMergedSlugs.map((release) => release.releaseDate))).sort(
          (a, b) => Number(b.split(" ").pop()) - Number(a.split(" ").pop()),
        );
        this.releases = removedReissues.sort((a, b) => b.releaseDateRaw - a.releaseDateRaw);
      });
    },
  },
});
