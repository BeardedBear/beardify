<template>
  <div v-if="podcastsStore.podcast" class="podcast-header">
    <Cover :images="podcastsStore.podcast.images" class="cover" size="medium" />
    <div class="body">
      <h1 class="title bd-font-bold">
        {{ podcastsStore.podcast.name }}
      </h1>
      <div class="infos">
        <span>{{ podcastsStore.podcast.publisher }}</span>
        <span>&nbsp;·&nbsp;</span>
        <span>{{ podcastsStore.podcast.total_episodes }} episodes</span>
        <!--
          Same denominator the releases feed uses, off the same data: every
          episode payload carries `resume_point.fully_played`, and the surface
          already drew a corner flag with it without ever counting it.
        -->
        <template v-if="podcastsStore.episodes.length">
          <span>&nbsp;·&nbsp;</span>
          <span>{{ podcastsStore.listenedCount }} of {{ podcastsStore.episodes.length }} listened</span>
        </template>
      </div>
      <p v-if="podcastsStore.podcast.description" class="description bd-font-italic">
        {{ podcastsStore.podcast.description }}
      </p>
    </div>
    <div class="options">
      <PodcastFollowButton :podcast-id="podcastsStore.podcast.id" />
      <ShareContent :beardify-url="$route.fullPath" :spotify-url="podcastsStore.podcast.external_urls.spotify" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import PodcastFollowButton from "@/components/podcast/PodcastFollowButton.vue";
import Cover from "@/components/ui/AlbumCover.vue";
import ShareContent from "@/components/ui/ShareContent.vue";
import { usePodcasts } from "@/views/podcasts/PodcastsStore";

const podcastsStore = usePodcasts();
</script>

<style scoped>

.podcast-header {
  display: flex;
  gap: var(--bd-space-4);
  margin-bottom: var(--bd-space-6);

  @media (--mobile) {
    flex-wrap: wrap;
  }
}

.cover {
  border-radius: var(--bd-radius-md);
  flex-shrink: 0;
  height: 8rem;
  width: 8rem;
}

.body {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: var(--bd-font-size-xl);
  margin-bottom: var(--bd-space-2);
}

.infos {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-sm);
}

.description {
  -webkit-box-orient: vertical;
  color: var(--bd-font-color-dark);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  margin-top: var(--bd-space-3);
  overflow: hidden;
}

.options {
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: var(--bd-space-4);
}
</style>
