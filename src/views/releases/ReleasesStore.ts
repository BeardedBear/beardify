import axios from "axios";
import { defineStore } from "pinia";
import { MenuItem, Release, ReleasesPage } from "../../@types/Releases";
import { useMergeReleaseSlugs } from "../../helpers/useMergeReleaseSlugs";

export const useReleases = defineStore("releases", {
  state: (): ReleasesPage => ({
    menu: [],
    releases: [],
    monthList: [],
    activeSlug: null,
  }),

  actions: {
    async clean() {
      this.menu = [];
      this.releases = [];
    },

    setActiveSlug(slug: string | null) {
      this.activeSlug = this.activeSlug === slug ? null : slug;
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
        this.monthList = Array.from(new Set(dataWithMergedSlugs.map((release) => release.releaseDate)));
        this.releases = dataWithMergedSlugs.sort((a, b) => b.releaseDateRaw - a.releaseDateRaw);
      });
    },
  },
});
