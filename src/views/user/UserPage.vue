<template>
  <div class="loader" v-if="!userStore.user"><LoadingDots /></div>
  <div class="user-page" v-else>
    <div class="head">
      <img :src="userStore.user.images[0].url" alt="" class="avatar-bg" />
      <div class="inner">
        <div class="metas">
          <img :src="userStore.user.images[0].url" alt="" class="avatar" />
          <div>
            <div class="name">{{ userStore.user?.display_name }}</div>
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
            :key="collection.id"
            :to="`/collection/${collection.id}`"
            class="playlist"
            v-for="collection in userStore.collections"
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
            :key="playlist.id"
            :to="`/playlist/${playlist.id}`"
            class="playlist"
            v-for="playlist in userStore.playlists"
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
import { RouterLink } from "vue-router";

import Cover from "../../components/AlbumCover.vue";
import LoadingDots from "../../components/LoadingDots.vue";
import ShareContent from "../../components/ShareContent.vue";
import { useUserStore } from "./UserStore";

const userStore = useUserStore();
const props = defineProps<{
  id: string;
}>();

userStore.clean().finally(() => {
  userStore.getUser(props.id);
  userStore.getUserPlaylists(`users/${props.id}/playlists?limit=50`);
});
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../../assets/scss/colors" as colors;
@use "../../assets/scss/responsive" as responsive;

.head {
  overflow: hidden;
  padding: 2rem 5rem;
  position: relative;

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
    $size: 4rem;

    border-radius: 100%;
    height: $size;
    width: $size;
  }

  .name {
    font-size: 2rem;
    font-weight: bold;
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

  .gallery {
    display: grid;
    grid-template-columns: repeat(7, 1fr);

    @include responsive.l {
      grid-template-columns: repeat(8, 1fr);
    }

    @include responsive.hdpi {
      grid-template-columns: repeat(9, 1fr);
    }
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
    font-weight: bold;
    padding: 1rem;
    text-decoration: none;
    transition: 0.15s;

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
