import axios from "axios";
import { defineStore } from "pinia";

import { MenuItem, Release, ReleasesCheck, ReleasesPage } from "../../@types/Releases";
import { useCheckLiveAlbum, useCheckReissueAlbum } from "../../helpers/useCleanAlbums";
import { useMergeReleaseSlugs } from "../../helpers/useMergeReleaseSlugs";
import { useAuth } from "../auth/AuthStore";

export const useReleases = defineStore("releases", {
  actions: {
    async clean() {
      this.menu = [];
      this.releases = [];
    },

    async createReleasesCheckEntry() {
      const authStore = useAuth();
      const userId = authStore.me?.id;
      const { data } = await axios.get<{ data: ReleasesCheck[] }>(
        `https://2fpx4328.directus.app/items/releases_check?filter[user][_eq]=${userId}`,
      );

      if (!data.data.length) {
        axios
          .post("https://2fpx4328.directus.app/items/releases_check", {
            checks: [],
            user: useAuth().me?.id,
          })
          .then(() => (this.checks = []));
      } else {
        this.checks = data.data[0].checks;
        this.uid = data.data[0].id;
      }
    },

    async getReleases() {
      const { data } = await axios.get<Release[]>(
        `https://2fpx4328.directus.app/assets/7e053788-71a4-46b3-b349-44b300a1b0a2?t=${new Date().getTime()}`,
      );

      function getSlugsByCategory(category: string): string[] {
        const array: string[] = [];
        const mergedSlugs = data
          .filter((release) => release.category === category)
          .map((e) => array.concat(e.slug))
          .flat();
        return Array.from(new Set(mergedSlugs));
      }

      Array.from(new Set(data.map((release) => release.category))).forEach((category): void => {
        const teee: MenuItem = {
          name: category,
          slugs: getSlugsByCategory(category),
        };
        if (!this.menu.find((e) => e.name == teee.name)) this.menu.push(teee);
      });

      const dataWithMergedSlugs = useMergeReleaseSlugs(data);
      const removedLives = dataWithMergedSlugs.filter((release) => !useCheckLiveAlbum(release.album));
      const removedReissues = removedLives.filter((release) => !useCheckReissueAlbum(release.album));

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      this.monthList = Array.from(new Set(dataWithMergedSlugs.map((release) => release.releaseDate))).sort((a, b) => {
        return months.indexOf(String(b.split(" ").shift())) - months.indexOf(String(a.split(" ").shift()));
      });
      this.releases = removedReissues.sort((a, b) => b.releaseDateRaw - a.releaseDateRaw);
    },

    setActiveSlug(slug: null | string) {
      this.activeSlug = this.activeSlug === slug ? null : slug;
    },

    toggleRelease(releaseId: string) {
      const addChecks = this.checks && this.checks?.concat({ createdAt: Date.now(), id: releaseId });
      const delChecks = this.checks && this.checks?.filter((r) => r.id !== releaseId);
      const allreadyExist = this.checks?.some((r) => r.id === releaseId);
      const checks = !allreadyExist ? addChecks : delChecks;

      axios.patch(`https://2fpx4328.directus.app/items/releases_check/${this.uid}`, { checks });
      this.checks = checks;
    },
  },

  state: (): ReleasesPage => ({
    activeSlug: null,
    checks: null,
    menu: [],
    monthList: [],
    releases: [],
    uid: null,
  }),
});
