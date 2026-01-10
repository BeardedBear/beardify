<template>
  <DialogWrap title="Album Variants" with-title>
    <div :class="gridClass" class="album-variants-grid">
      <div class="album-variants-item">
        <Album
          :album="dialogStore.albumGroup!.baseAlbum"
          :can-save="canSave"
          :cover-size="coverSize"
          :with-artists="withArtists"
          :without-metas="withoutMetas"
          :without-release-date="withoutReleaseDate"
        />
      </div>
      <div v-for="variant in dialogStore.albumGroup!.variants" :key="variant.id" class="album-variants-item">
        <Album
          :album="variant"
          :can-save="canSave"
          :cover-size="coverSize"
          :with-artists="withArtists"
          :without-metas="withoutMetas"
          :without-release-date="withoutReleaseDate"
        />
      </div>
    </div>
  </DialogWrap>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { ImageSize } from "@/@types/Image";
import Album from "@/components/album/AlbumIndex.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import DialogWrap from "@/components/dialog/DialogWrap.vue";

defineProps<{
  canSave?: boolean;
  coverSize?: ImageSize | undefined;
  withArtists?: boolean;
  withoutMetas?: boolean;
  withoutReleaseDate?: boolean;
}>();

const dialogStore = useDialog();

const totalAlbums = computed(() => {
  if (!dialogStore.albumGroup) return 0;
  return 1 + dialogStore.albumGroup.variants.length;
});

const gridClass = computed(() => {
  const total = totalAlbums.value;
  if (total <= 2) return "grid-small";
  if (total <= 4) return "grid-medium";
  return "grid-large";
});
</script>

<style lang="scss" scoped>
.album-variants-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  padding: 2rem;

  &.grid-small {
    max-width: 30rem;
  }

  &.grid-medium {
    max-width: 35rem;
  }

  &.grid-large {
    max-height: 80vh;
    max-width: 90vw;
    overflow-y: auto;
    width: 70rem;
  }
}

.album-variants-item {
  animation: fade-in-variant 0.3s ease both;
}

@keyframes fade-in-variant {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
