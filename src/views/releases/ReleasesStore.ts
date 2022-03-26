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
        `https://2fpx4328.directus.app/items/releases_check?filter[user][_eq]=${userId}`,
      );

      if (!data.data.length) {
        axios
          .post("https://2fpx4328.directus.app/items/releases_check", { user: useAuth().me?.id, checks: [] })
          .then(() => (this.checks = []));
      } else {
        this.checks = data.data[0].checks;
        this.uid = data.data[0].id;
      }
    },

    toggleRelease(releaseId: string) {
      const addChecks = this.checks && this.checks?.concat({ createdAt: Date.now(), id: releaseId });
      const delChecks = this.checks && this.checks?.filter((r) => r.id !== releaseId);
      const allreadyExist = this.checks?.some((r) => r.id === releaseId);
      const checks = !allreadyExist ? addChecks : delChecks;

      axios.patch(`https://2fpx4328.directus.app/items/releases_check/${this.uid}`, { checks });
      this.checks = checks;
    },

    async getReleases() {
      fetch(
        "https://2fpx4328.directus.app/assets/6d6a9ed6-64ba-4724-a583-fc77b0ca039a",
        process.env.NODE_ENV === "production" ? { mode: "no-cors" } : { mode: "cors" },
      ).then(async (e) => {
        const data: Release[] = await e.json();
        const categories = Array.from(new Set(data.map((release) => release.category)));
        function getSlugsByCategory(category: string): string[] {
          const array: string[] = [];
          const mergedSlugs = data
            .filter((release_1) => release_1.category === category)
            .map((e_1) => array.concat(e_1.slug))
            .flat();
          return Array.from(new Set(mergedSlugs));
        }
        categories.forEach((category_1): void => {
          const teee: MenuItem = {
            name: category_1,
            slugs: getSlugsByCategory(category_1),
          };
          if (!this.menu.find((e_2) => e_2.name == teee.name)) this.menu.push(teee);
        });
        const dataWithMergedSlugs = useMergeReleaseSlugs(data);
        const removedLives = dataWithMergedSlugs.filter((release_2) => !useCheckLiveAlbum(release_2.album));
        const removedReissues = removedLives.filter((release_3) => !useCheckReissueAlbum(release_3.album));
        this.monthList = Array.from(new Set(dataWithMergedSlugs.map((release_4) => release_4.releaseDate))).sort(
          (a, b) => Number(b.split(" ").pop()) - Number(a.split(" ").pop()),
        );
        this.releases = removedReissues.sort((a_1, b_1) => b_1.releaseDateRaw - a_1.releaseDateRaw);
      });
    },
  },
});
