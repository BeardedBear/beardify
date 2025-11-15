<template>
  <button
    @click="toggleFollow"
    :class="{
      'button-primary': !podcastsStore.isFollowing,
      followed: podcastsStore.isFollowing,
    }"
    class="button follow-button"
    :disabled="loading"
  >
    <i
      :class="{
        'icon-follow': !podcastsStore.isFollowing,
        'icon-followed': podcastsStore.isFollowing,
      }"
    ></i>
    <span v-if="!podcastsStore.isFollowing">Follow podcast</span>
    <span v-else>Unfollow</span>
  </button>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { usePodcasts } from "../../views/podcasts/PodcastsStore";

const props = defineProps<{
  podcastId: string;
}>();

const podcastsStore = usePodcasts();
const loading = ref(false);

async function toggleFollow(): Promise<void> {
  if (loading.value) return;

  loading.value = true;

  try {
    if (podcastsStore.isFollowing) {
      await podcastsStore.unfollowPodcast(props.podcastId);
    } else {
      await podcastsStore.followPodcast(props.podcastId);
    }
  } catch (error) {
    console.error("Error toggling podcast follow status:", error);
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.follow-button {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;

  &.followed {
    color: var(--primary-color);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  i {
    font-size: 1.1rem;
  }
}
</style>
