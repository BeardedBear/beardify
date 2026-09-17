import { defineStore } from "pinia";

import { Config } from "@/@types/Config";
import { SearchCategory } from "@/components/search/searchCategories";

export const useConfig = defineStore("config", {
  actions: {
    close() {
      this.show = false;
    },

    open() {
      this.show = true;
    },

    /**
     * Switch one search column on or off.
     * @param category - The column
     * @param enabled - Whether the search should look there
     */
    setSearchCategory(category: SearchCategory, enabled: boolean) {
      this.searchCategories[category] = enabled;
    },

    /** Reading language for artist biographies, kept across artists and sessions. */
    setWikipediaLanguage(code: string) {
      this.wikipediaLanguage = code;
    },

    toggleTierListSideLabels(value: boolean) {
      this.tierListSideLabels = value;
    },
  },

  persist: {
    key: "beardify-config",
  },
  // Les couleurs ne sont plus ici : bearded-ui les tient dans `useTheme()`, qui
  // les persiste sous sa propre clé `bearded-ui-theme`.
  state: (): Config => ({
    // Everything on: the modal has always searched all five, and a first-run
    // user should not have to discover a setting to get what they had.
    searchCategories: { albums: true, artists: true, collections: true, podcasts: true, tracks: true },
    show: false,
    tierListSideLabels: true,
    wikipediaLanguage: "",
  }),
});
