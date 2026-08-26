<template>
  <div v-if="!userStore.user" class="loader">
    <BdLoader />
  </div>
  <div v-else ref="scrollRef" class="user-page" @scroll="onScroll">
    <div class="head">
      <img :src="coverUrl(userStore.user.images, 'large')" alt="" class="avatar-bg" />
      <div class="inner">
        <div class="metas">
          <img :src="coverUrl(userStore.user.images, 'large')" alt="" class="avatar" />
          <div>
            <h1 class="name bd-font-bold">
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
        <div class="bd-heading sticky title">Collections</div>
        <div class="gallery">
          <router-link
            v-for="collection in userStore.collections"
            :key="collection.id"
            :to="`/collection/${collection.id}`"
            class="playlist bd-font-bold"
          >
            <Cover :images="collection.images" :size="'large'" class="playlist-cover" />
            <div>{{ collection.name.replaceAll("#Collection ", "") }}</div>
          </router-link>
        </div>
      </div>
      <div v-if="userStore.playlists.length">
        <div class="bd-heading sticky title">Playlists</div>
        <div class="gallery">
          <router-link
            v-for="playlist in userStore.playlists"
            :key="playlist.id"
            :to="`/playlist/${playlist.id}`"
            class="playlist bd-font-bold"
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
import { coverUrl } from "@/helpers/cover";
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
  padding: var(--bd-space-6) var(--page-inset);
  position: relative;

  @media (--mobile) {
    padding-block: var(--bd-space-4);
  }

  @media (--tablet) {
    padding-block: var(--bd-space-5);
  }

  .inner {
    align-items: center;
    display: flex;
    gap: var(--bd-space-4);
    justify-content: space-between;
    margin: 0 auto;
    max-width: 100rem;
    position: relative;
    z-index: 1;
  }

  .metas {
    display: flex;
    gap: var(--bd-space-4);
    justify-content: space-between;
  }

  .avatar {
    --avatar-size: 4rem;

    border-radius: var(--bd-radius-full);
    height: var(--avatar-size);
    width: var(--avatar-size);
  }

  .name {
    font-size: var(--bd-font-size-xl);
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
  margin: var(--bd-space-6) var(--bd-space-4) var(--bd-space-2);
}

.content {
  margin: 0 auto;
  max-width: 100rem;
  padding: var(--bd-space-6) var(--bd-space-8);

  @media (--mobile) {
    padding: var(--bd-space-4);
  }

  @media (--tablet) {
    padding: var(--bd-space-5) var(--bd-space-6);
  }

  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  }

  .playlist-cover {
    aspect-ratio: 1;
    border-radius: var(--bd-radius-sm);
    margin-bottom: var(--bd-space-2);
    width: 100%;
  }

  .playlist {
    border-radius: var(--bd-radius-md);
    color: var(--bd-font-color);
    padding: var(--bd-space-4);
    text-decoration: none;
    transition:
      background-color var(--bd-transition),
      transform var(--bd-transition);

    &:hover {
      background-color: var(--bd-bg-light);
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
