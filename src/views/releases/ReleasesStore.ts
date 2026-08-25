import { defineStore } from "pinia";

import { MenuItem, Release, ReleasesCheck, ReleasesPage } from "@/@types/Releases";
import { http } from "@/helpers/http";
import { useCheckLiveAlbum, useCheckReissueAlbum } from "@/helpers/useCleanAlbums";
import { useMergeReleaseSlugs } from "@/helpers/useMergeReleaseSlugs";
import { useAuth } from "@/views/auth/AuthStore";

export const useReleases = defineStore("releases", {
  actions: {
    async clean() {
      this.menu = [];
      this.releases = [];
    },

    async createReleasesCheckEntry() {
      const authStore = useAuth();
      const userId = authStore.me?.id;
      const data = await http
        .get(`https://2fpx4328.directus.app/items/releases_check?filter[user][_eq]=${userId}`)
        .json<{ data: ReleasesCheck[] }>();

      if (!data.data.length) {
        try {
          await http.post("https://2fpx4328.directus.app/items/releases_check", {
            json: {
              checks: [],
              user: useAuth().me?.id,
            },
          });
          this.checks = [];
        } catch {
          // silent fail; optional feature
        }
      } else {
        this.checks = data.data[0].checks;
        this.uid = data.data[0].id;
      }
    },

    async getReleases() {
      const data = await http
        .get(`https://2fpx4328.directus.app/assets/7e053788-71a4-46b3-b349-44b300a1b0a2?t=${new Date().getTime()}`)
        .json<Release[]>();

      // Build category menu using Map for O(1) lookups
      const categoryMap = new Map<string, Set<string>>();
      for (const release of data) {
        if (!categoryMap.has(release.category)) {
          categoryMap.set(release.category, new Set());
        }
        // slug is an array, so add each slug to the set
        for (const slug of release.slug) {
          categoryMap.get(release.category)!.add(slug);
        }
      }

      // Build menu from category map
      const existingMenuNames = new Set(this.menu.map((item) => item.name));
      for (const [category, slugsSet] of categoryMap) {
        if (!existingMenuNames.has(category)) {
          const menuItem: MenuItem = {
            name: category,
            slugs: Array.from(slugsSet),
          };
          this.menu.push(menuItem);
        }
      }

      const dataWithMergedSlugs = useMergeReleaseSlugs(data);
      // Combine filters to reduce iterations
      const filteredReleases = dataWithMergedSlugs.filter(
        (release) => !useCheckLiveAlbum(release.album) && !useCheckReissueAlbum(release.album),
      );

      // Cache month names and create lookup map for better performance
      const monthNames = [
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
      const monthIndexMap = new Map(monthNames.map((month, index) => [month, index]));

      this.monthList = Array.from(new Set(dataWithMergedSlugs.map((release) => release.releaseDate))).sort((a, b) => {
        const monthA = monthIndexMap.get(String(a.split(" ").shift())) ?? -1;
        const monthB = monthIndexMap.get(String(b.split(" ").shift())) ?? -1;
        return monthB - monthA;
      });
      this.releases = filteredReleases.sort((a, b) => b.releaseDateRaw - a.releaseDateRaw);
    },

    setActiveSlug(slug: null | string) {
      this.activeSlug = this.activeSlug === slug ? null : slug;
    },

    toggleRelease(releaseId: string) {
      const addChecks = this.checks && this.checks?.concat({ createdAt: Date.now(), id: releaseId });
      const delChecks = this.checks && this.checks?.filter((r) => r.id !== releaseId);
      const allreadyExist = this.checks?.some((r) => r.id === releaseId);
      const checks = !allreadyExist ? addChecks : delChecks;

      http.patch(`https://2fpx4328.directus.app/items/releases_check/${this.uid}`, {
        json: { checks },
      });

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
