<template>
  <div :class="{ clickable, current }" class="track">
    <img :src="coverUrl" alt="" class="cover" />
    <div class="metas">
      <div class="name">
        <template v-if="index !== undefined">{{ index + 1 }}.</template>
        {{ track.name }}
      </div>
      <div class="artists">
        <ArtistList :artist-list="track.artists" feat />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ArtistList from "@/components/artist/ArtistList.vue";

defineProps<{
  clickable?: boolean;
  coverUrl: string;
  current?: boolean;
  index?: number;
  track: Spotify.Track;
}>();
</script>

<style scoped>
.track {
  align-items: center;
  display: flex;
  gap: var(--bd-space-2);
  padding: var(--bd-space-2);

  &.clickable {
    cursor: pointer;

    &:hover {
      background-color: var(--bd-bg-light);
      border-radius: var(--bd-radius-md);
    }
  }

  &.current {
    background-color: var(--bd-bg);
    border: 1px solid var(--bd-bg-light);
    border-radius: var(--bd-radius-md);
    padding: var(--bd-space-1) var(--bd-space-2);
  }

  .cover {
    --cover-size: 2.2rem;

    border-radius: var(--bd-radius-sm);
    height: var(--cover-size);
    width: var(--cover-size);
  }
}

/*
 * La troncature vivait dans le template (`substring(0, 20)`), au même caractère
 * quelle que soit la largeur du panneau. `min-width: 0` est ce qui autorise la
 * colonne flex à rétrécir sous la taille de son contenu, sans quoi l'ellipse ne
 * se déclenche jamais.
 */
.metas {
  min-width: 0;
}

.artists,
.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
