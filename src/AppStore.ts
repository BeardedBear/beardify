import { defineStore } from "pinia";

interface App {
  loading: boolean;
}

export const useApp = defineStore("app", {
  state: (): App => ({
    loading: true,
  }),

  actions: {
    setLoading(bool: boolean) {
      this.loading = bool;
    },
  },
});
