<template>
  <div class="what">
    <div class="cover-wrap">
      <img :src="coverUrl" class="cover" />
      <div
        v-if="playerStore.currentlyPlaying.item"
        class="hover"
        @click="dialogStore.open({ type: 'addSong', songUri: playerStore.currentlyPlaying.item?.uri })"
      >
        <i class="add icon-plus"></i>
      </div>
    </div>
    <div>
      <div>
        <template v-if="playerStore.currentlyPlaying.currently_playing_type === 'episode'">
          <div class="trackname">{{ playerStore.currentFromSDK?.artists[0].name }}</div>
          <div class="album">{{ playerStore.currentFromSDK?.name }}</div>
        </template>
        <template v-else>
          <span v-if="playerStore.currentlyPlaying.item" class="trackname">
            {{ playerStore.currentlyPlaying.item.name }} —
          </span>
        </template>

        <ArtistList
          v-if="playerStore.currentlyPlaying.item"
          :artist-list="playerStore.currentlyPlaying.item.album.artists"
          :feat="true"
        />
      </div>
      <div v-if="playerStore.currentlyPlaying.item" class="album">
        <router-link :to="`/album/${playerStore.currentlyPlaying.item.album.id}`" class="link">
          <i
            :class="{
              'icon-ep': isEP(playerStore.currentlyPlaying.item.album),
              'icon-album': isAlbum(playerStore.currentlyPlaying.item.album),
            }"
          ></i>
          {{ playerStore.currentlyPlaying.item.album.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// import Cover from "../Cover.vue";
import ArtistList from "../artist/ArtistList.vue";
import { usePlayer } from "./PlayerStore";
import { useDialog } from "../dialog/DialogStore";
import { defineProps } from "vue";
import { isEP, isAlbum } from "../../helpers/useCleanAlbums";

const playerStore = usePlayer();
const dialogStore = useDialog();

defineProps<{
  coverUrl: string;
}>();
</script>

<style lang="scss" scoped>
@use "sass:color";

.cover {
  border-radius: 0.3rem;
  display: block;
}

.cover-wrap {
  position: relative;

  .add {
    font-size: 1.4rem;
    transition: 0.2s;
    will-change: transform;

    &:hover {
      transform: scale(1.2);
    }
  }

  .hover {
    align-items: center;
    background-color: color.change(black, $alpha: 0.8);
    border-radius: 0.3rem;
    cursor: pointer;
    display: flex;
    inset: 0;
    justify-content: center;
    opacity: 0;
    position: absolute;
    transition: 0.2s;
  }

  &:hover {
    .hover {
      opacity: 1;
    }
  }
}

.trackname {
  font-weight: bold;
}

.artistname {
  color: currentcolor;
  font-weight: 700;
  text-decoration: none;
}

.album {
  font-size: 0.9rem;
  font-style: italic;

  .link {
    color: currentcolor;
    cursor: pointer;
    font-size: 0.9rem;
    font-style: italic;
    opacity: 0.5;
    text-decoration: none;

    &:hover {
      color: var(--primary-color);
      opacity: 1;
    }
  }
}

.what {
  align-items: center;
  display: flex;
  gap: 1rem;

  img {
    height: 3rem;
  }
}
</style>
