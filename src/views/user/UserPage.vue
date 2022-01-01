<template>
  <div v-if="!userStore.user" class="loader"><LoadingDots /></div>
  <div v-else class="user-page">
    <div class="head">
      <img class="avatar" :src="userStore.user.images[0].url" alt="" />
      <div class="inner">
        <div class="name">{{ userStore.user?.display_name }}</div>
      </div>
    </div>

    <div class="content">
      <div>
        <div class="heading sticky title">Collections</div>
        <div class="gallery">
          <router-link
            v-for="collection in userStore.collections"
            :key="collection.id"
            :to="`/collection/${collection.id}`"
            class="playlist"
          >
            <Cover :images="collection.images" :size="'large'" class="playlist-cover" />
            <div>{{ collection.name.replaceAll("#Collection ", "") }}</div>
          </router-link>
        </div>
      </div>
      <div>
        <div class="heading sticky title">Playlists</div>
        <div class="gallery">
          <router-link
            v-for="playlist in userStore.playlists"
            :key="playlist.id"
            :to="`/playlist/${playlist.id}`"
            class="playlist"
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
import { useUserStore } from "./UserStore";
import { defineProps } from "vue";
import LoadingDots from "../../components/LoadingDots.vue";
import Cover from "../../components/Cover.vue";

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
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.head {
  overflow: hidden;
  padding: 2rem;
  position: relative;

  .inner {
    margin: 0 auto;
    max-width: 100rem;
    position: relative;
    z-index: 1;
  }

  .name {
    font-size: 2rem;
    font-weight: bold;
  }

  .avatar {
    filter: blur(15px);
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

    @include l {
      grid-template-columns: repeat(8, 1fr);
    }

    @include hdpi {
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
