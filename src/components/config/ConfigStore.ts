import { defineStore } from "pinia";

import { Config } from "@/@types/Config";

export const useConfig = defineStore("config", {
  actions: {
    close() {
      this.show = false;
    },

    open() {
      this.show = true;
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
    show: false,
    tierListSideLabels: true,
  }),
});
