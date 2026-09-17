<template>
  <!--
    `success` for the followed state, not `primary`: the artist page already
    uses the solid accent for "followed", so podcast's inverted mapping made
    the same fill mean opposite things two routes apart.
  -->
  <BdButton
    :loading="podcastsStore.followBusy"
    :variant="podcastsStore.isFollowing ? 'success' : 'primary'"
    class="follow-button"
    @click="podcastsStore.switchFollow(props.podcastId)"
  >
    <i
      aria-hidden="true"
      :class="{
        'icon-follow': !podcastsStore.isFollowing,
        'icon-followed': podcastsStore.isFollowing,
      }"
    />
    <span v-if="!podcastsStore.isFollowing">Follow podcast</span>
    <span v-else>Unfollow</span>
  </BdButton>
</template>

<script lang="ts" setup>
import { BdButton } from "bearded-ui";

import { usePodcasts } from "@/views/podcasts/PodcastsStore";

const props = defineProps<{
  podcastId: string;
}>();

const podcastsStore = usePodcasts();
</script>

<style scoped>
.follow-button {
  align-items: center;
  display: flex;
  gap: var(--bd-space-2);
  white-space: nowrap;

  i {
    font-size: var(--bd-font-size-lg);
  }
}
</style>
