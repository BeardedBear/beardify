<template>
  <div v-if="!releasesStore.releases.length" class="loader">
    <Loader />
  </div>
  <div v-else class="releases">
    <div class="side">
      <ReleaseSide />
    </div>
    <div ref="scrollRef" class="list" @scroll="onScroll">
      <ReleaseList />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

import ReleaseList from "@/components/releases/ReleaseList.vue";
import ReleaseSide from "@/components/releases/ReleaseSide.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import { useScrollRestore } from "@/composables/useScrollRestore";
import { useAuth } from "@/views/auth/AuthStore";
import { useReleases } from "@/views/releases/ReleasesStore";

const releasesStore = useReleases();
const authStore = useAuth();
const scrollRef = ref<HTMLElement | null>(null);
const { onScroll } = useScrollRestore(`scroll-${useRoute().path}`, scrollRef);

watch(
  () => releasesStore.activeSlug,
  () => scrollRef.value?.scrollTo(0, 0),
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
