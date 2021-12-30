<template>
  <div v-if="!releasesStore.releases.length" class="loader"><Loader /></div>
  <div v-else class="releases">
    <div class="side">
      <ReleaseSide />
    </div>
    <div ref="listDOM" class="list">
      <ReleaseList />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useReleases } from "./ReleasesStore";
import Loader from "../../components/LoadingDots.vue";
import ReleaseList from "../../components/releases/ReleaseList.vue";
import ReleaseSide from "../../components/releases/ReleaseSide.vue";
import { ref, watch } from "vue";

const releasesStore = useReleases();
const listDOM = ref<HTMLElement | null>(null);

watch(
  () => releasesStore.activeSlug,
  () => listDOM.value?.scrollTo(0, 0),
);

if (!releasesStore.releases.length) releasesStore.getReleases();
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
