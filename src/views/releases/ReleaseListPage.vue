<template>
  <div class="loader" v-if="!releasesStore.releases.length"><Loader /></div>
  <div class="releases" v-else>
    <div class="side"><ReleaseSide /></div>
    <div class="list" ref="listDOM"><ReleaseList /></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

import Loader from "@/components/ui/LoadingDots.vue";
import ReleaseList from "@/components/releases/ReleaseList.vue";
import ReleaseSide from "@/components/releases/ReleaseSide.vue";
import { useAuth } from "@/views/auth/AuthStore";
import { useReleases } from "@/views/releases/ReleasesStore";

const releasesStore = useReleases();
const authStore = useAuth();
const listDOM = ref<HTMLElement | null>(null);

watch(
  () => releasesStore.activeSlug,
  () => listDOM.value?.scrollTo(0, 0),
);

watch(
  () => authStore.me,
  () => authStore.me && releasesStore.createReleasesCheckEntry(),
);

authStore.me && !releasesStore.checks && releasesStore.createReleasesCheckEntry();
!releasesStore.releases.length && releasesStore.getReleases();
</script>

<style lang="scss" scoped>
.releases {
  animation: pop-content 1s ease both;
  display: flex;
  overflow: hidden;
}

.list {
  flex: 1;
  overflow: auto;
}

.side {
  overflow: auto;
  padding: 0 1rem 1rem;
  position: sticky;
  top: 0;
  width: 12rem;
}

.loader {
  display: grid;
  place-content: center;
}
</style>
