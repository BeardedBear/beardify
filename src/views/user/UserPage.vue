<template>
  <div v-if="!userStore.user" class="loader">
    <BdLoader />
  </div>
  <div v-else ref="scrollRef" class="user-page" @scroll="onScroll">
    <div class="head">
      <img :src="userStore.user.images[0].url" alt="" class="avatar-bg" />
      <div class="inner">
        <div class="metas">
          <img :src="userStore.user.images[0].url" alt="" class="avatar" />
          <div>
            <h1 class="name font-bold">
              {{ userStore.user?.display_name }}
            </h1>
            <div class="followers">{{ userStore.user?.followers.total }} followers</div>
          </div>
        </div>
        <ShareContent :beardify-url="$route.fullPath" :spotify-url="userStore.user.external_urls.spotify" />
      </div>
    </div>

    <div class="content">
      <div v-if="userStore.collections.length">
        <div class="heading sticky title">Collections</div>
        <div class="gallery">
          <router-link
            v-for="collection in userStore.collections"
            :key="collection.id"
            :to="`/collection/${collection.id}`"
            class="playlist font-bold"
          >
            <Cover :images="collection.images" :size="'large'" class="playlist-cover" />
            <div>{{ collection.name.replaceAll("#Collection ", "") }}</div>
          </router-link>
        </div>
      </div>
      <div v-if="userStore.playlists.length">
        <div class="heading sticky title">Playlists</div>
        <div class="gallery">
          <router-link
            v-for="playlist in userStore.playlists"
            :key="playlist.id"
            :to="`/playlist/${playlist.id}`"
            class="playlist font-bold"
          >
            <Cover :images="playlist.images" :size="'large'" class="playlist-cover" />
            <div>{{ playlist.name }}</div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdLoader } from "bearded-ui";
import { ref } from "vue";
import { RouterLink, useRoute } from "vue-router";

import Cover from "@/components/ui/AlbumCover.vue";
import ShareContent from "@/components/ui/ShareContent.vue";
import { useScrollRestore } from "@/composables/useScrollRestore";
import { useUserStore } from "@/views/user/UserStore";

const userStore = useUserStore();
const scrollRef = ref<HTMLElement | null>(null);
const { onScroll } = useScrollRestore(`scroll-${useRoute().path}`, scrollRef);
const props = defineProps<{
  id: string;
}>();

userStore.clean().finally(() => {
  userStore.getUser(props.id);
  userStore.getUserPlaylists(`users/${props.id}/playlists?limit=50`);
});
</script>

<style scoped>

.head {
  overflow: hidden;
  padding: 2rem 5rem;
  position: relative;

  @media (--mobile) {
    padding: 1rem;
  }

  @media (--tablet) {
    padding: 1.5rem 2rem;
  }

  .inner {
    align-items: center;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 100rem;
    position: relative;
    z-index: 1;
  }

  .metas {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
  }

  .avatar {
    --avatar-size: 4rem;

    border-radius: 100%;
    height: var(--avatar-size);
    width: var(--avatar-size);
  }

  .name {
    font-size: var(--font-size-xl);
  }

  .avatar-bg {
    filter: blur(5rem);
    inset: 0;
    opacity: 0.2;
    position: absolute;
    top: 50%;
    transform: translateY(-33%);
    width: 100%;
  }
}

.title {
  margin: 2rem 1rem 0.5rem;
}

.content {
  margin: 0 auto;
  max-width: 100rem;
  padding: 2rem 4rem;

  @media (--mobile) {
    padding: 1rem;
  }

  @media (--tablet) {
    padding: 1.5rem 2rem;
  }

  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  }

  .playlist-cover {
    aspect-ratio: 1;
    border-radius: 0.4rem;
    margin-bottom: 0.5rem;
    width: 100%;
  }

  .playlist {
    border-radius: 0.5rem;
    color: var(--font-color);
    padding: 1rem;
    text-decoration: none;
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;

    &:hover {
      background-color: var(--bg-color-light);
      transform: scale(1.05);
    }
  }
}

.user-page {
  animation: pop-content 1s ease both;
  overflow-y: scroll;
}

.loader {
  display: grid;
  place-content: center;
}
</style>
